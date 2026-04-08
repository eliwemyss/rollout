/*
  # Add admin role to profiles

  - Adds is_admin boolean column (default false)
  - Sets eliwemyss@gmail.com as admin
  - Adds RLS policies giving admins full control over rides and participants
  - Adds policy for admins to view and manage all profiles
*/

-- Add admin column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Set initial admin
UPDATE profiles SET is_admin = true WHERE email = 'eliwemyss@gmail.com';

-- ============================================================
-- Admin RLS policies for rides
-- ============================================================

-- Admins can update any ride
CREATE POLICY "Admins can update any ride"
  ON rides FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can delete any ride
CREATE POLICY "Admins can delete any ride"
  ON rides FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================
-- Admin RLS policies for participants
-- ============================================================

-- Admins can remove any participant
CREATE POLICY "Admins can remove any participant"
  ON participants FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================
-- Admin RLS policies for profiles
-- ============================================================

-- Admins can update any profile (e.g., to promote/ban users)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can delete profiles (ban users)
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
