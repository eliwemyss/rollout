/*
  # Fix RLS Security Issues

  ## Summary
  Addresses 4 security vulnerabilities identified in the RLS audit.

  ## Issues Fixed

  ### 1. profiles - SELECT accessible to anon role
  - Previously: `USING (true)` with `public` (anon) role could read all profiles including emails
  - Fix: Restrict to authenticated users only. Public profile data (name, avatar) needed for
    ride detail pages is still accessible since ride viewers are expected to be authenticated,
    or we scope it via a joined query from rides they can see.

  ### 2. participants - INSERT allows anon to spoof user_id
  - Previously: anon role could insert a row with any `user_id` value, impersonating other users
  - Fix: Split into two policies:
    - Authenticated users: can insert only with their own user_id (or null for guest slot)
    - Anon users: can insert only with NULL user_id (genuine guests), enforcing guest_name present

  ### 3. participants - DELETE accessible to anon role
  - Previously: `public` role (includes anon) could delete participants if they matched the condition
  - Fix: Restrict DELETE to authenticated users only

  ### 4. tips - UPDATE allows client to set status directly
  - Previously: authenticated tipper could UPDATE any column including `status`, allowing
    a payment bypass (setting status='completed' without going through Stripe)
  - Fix: Remove the client-side UPDATE policy entirely. Status updates must go through the
    edge function using the service role key (which bypasses RLS), which is already how
    Stripe webhook completion works.

  ## Tables Modified
  - `profiles`: SELECT restricted to authenticated role
  - `participants`: INSERT split by auth state; DELETE restricted to authenticated
  - `tips`: UPDATE policy removed (server-side only via service role)
*/

-- ============================================================
-- 1. profiles: restrict SELECT to authenticated users
-- ============================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- 2. participants: fix INSERT to prevent user_id spoofing
-- ============================================================
DROP POLICY IF EXISTS "Anyone can join rides" ON participants;

-- Authenticated users can join with their own user_id
CREATE POLICY "Authenticated users can join rides"
  ON participants FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND guest_name IS NULL
  );

-- Anon/guest users can join only with NULL user_id and a non-empty guest_name
CREATE POLICY "Guests can join rides without user_id"
  ON participants FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL
    AND guest_name IS NOT NULL
    AND guest_name <> ''
  );

-- ============================================================
-- 3. participants: restrict DELETE to authenticated users
-- ============================================================
DROP POLICY IF EXISTS "Users and creators can remove participants" ON participants;

CREATE POLICY "Authenticated users and creators can remove participants"
  ON participants FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM rides
      WHERE rides.id = participants.ride_id
      AND rides.creator_id = auth.uid()
    )
  );

-- ============================================================
-- 4. tips: remove client-side UPDATE policy (server-only via service role)
-- ============================================================
DROP POLICY IF EXISTS "Tippers can update status of their own tips" ON tips;
