/*
  # Initial Schema for Rollout

  ## Tables
  - profiles: user profile data synced from auth
  - rides: group ride listings
  - participants: users/guests who join rides
  - tips: coffee tips for ride leaders (Stripe integration)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated and anon access
*/

-- ============================================================
-- Profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role and auth triggers to insert profiles for new users
CREATE POLICY "Service can insert profiles"
  ON profiles FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================================
-- Rides
-- ============================================================
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_location text NOT NULL,
  start_datetime timestamptz NOT NULL,
  distance_miles numeric,
  pace text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rides are viewable by everyone"
  ON rides FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create rides"
  ON rides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own rides"
  ON rides FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own rides"
  ON rides FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- ============================================================
-- Participants
-- ============================================================
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  guest_name text,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(ride_id, user_id)
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants are viewable by everyone"
  ON participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join rides"
  ON participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users and creators can remove participants"
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
-- Tips
-- ============================================================
CREATE TABLE IF NOT EXISTS tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  tipper_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ride_creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  stripe_session_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tips"
  ON tips FOR SELECT
  TO authenticated
  USING (auth.uid() = tipper_user_id OR auth.uid() = ride_creator_id);

CREATE POLICY "Authenticated users can create tips"
  ON tips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tipper_user_id);

CREATE POLICY "Tippers can update status of their own tips"
  ON tips FOR UPDATE
  TO authenticated
  USING (auth.uid() = tipper_user_id)
  WITH CHECK (auth.uid() = tipper_user_id);
