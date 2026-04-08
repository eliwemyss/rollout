-- Ride Series: recurring, public, discoverable group rides
-- Regular rides remain one-off and link-shared (not public)

-- 1. Create the ride_series table
CREATE TABLE ride_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_location TEXT NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,  -- e.g., '18:00:00'
  distance_miles NUMERIC,
  pace TEXT,
  route_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add series_id to rides table (links occurrence to its series)
ALTER TABLE rides ADD COLUMN series_id UUID REFERENCES ride_series(id) ON DELETE SET NULL;

-- 3. Enable RLS
ALTER TABLE ride_series ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for ride_series

-- Anyone can view active series (public discovery)
CREATE POLICY "Anyone can view active series"
  ON ride_series FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Creator can view their own series even if inactive
CREATE POLICY "Creator can view own series"
  ON ride_series FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

-- Authenticated users can create series
CREATE POLICY "Authenticated users can create series"
  ON ride_series FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Creator can update their series
CREATE POLICY "Creator can update own series"
  ON ride_series FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Creator can delete their series
CREATE POLICY "Creator can delete own series"
  ON ride_series FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Admin full access
CREATE POLICY "Admin full select on series"
  ON ride_series FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admin full update on series"
  ON ride_series FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admin full delete on series"
  ON ride_series FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 5. Anyone can view series rides (rides with a series_id are public)
-- This is already handled by existing rides RLS since anon can select rides.
-- We just need to make sure anon can also see participants for series rides.

-- 6. Function to generate the next occurrence for a series
-- Called from the frontend when loading the homepage
CREATE OR REPLACE FUNCTION generate_next_series_ride(p_series_id UUID)
RETURNS UUID AS $$
DECLARE
  v_series ride_series%ROWTYPE;
  v_next_date DATE;
  v_next_datetime TIMESTAMPTZ;
  v_existing_ride_id UUID;
  v_new_ride_id UUID;
  v_today DATE := CURRENT_DATE;
  v_days_ahead INT;
BEGIN
  -- Get series info
  SELECT * INTO v_series FROM ride_series WHERE id = p_series_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Calculate next occurrence date (today or future)
  v_days_ahead := (v_series.day_of_week - EXTRACT(DOW FROM v_today)::INT + 7) % 7;
  -- If today is the day but the time has passed, skip to next week
  IF v_days_ahead = 0 AND CURRENT_TIME > v_series.start_time + INTERVAL '4 hours' THEN
    v_days_ahead := 7;
  END IF;
  v_next_date := v_today + v_days_ahead;
  v_next_datetime := (v_next_date || ' ' || v_series.start_time)::TIMESTAMPTZ;

  -- Check if a ride already exists for this date
  SELECT id INTO v_existing_ride_id
  FROM rides
  WHERE series_id = p_series_id
    AND start_datetime::DATE = v_next_date;

  IF v_existing_ride_id IS NOT NULL THEN
    RETURN v_existing_ride_id;
  END IF;

  -- Create the next occurrence
  INSERT INTO rides (creator_id, title, description, start_location, start_datetime, distance_miles, pace, route_link, series_id)
  VALUES (
    v_series.creator_id,
    v_series.title,
    v_series.description,
    v_series.start_location,
    v_next_datetime,
    v_series.distance_miles,
    v_series.pace,
    v_series.route_link,
    v_series.id
  )
  RETURNING id INTO v_new_ride_id;

  RETURN v_new_ride_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant anon and authenticated the ability to call this function
GRANT EXECUTE ON FUNCTION generate_next_series_ride(UUID) TO anon, authenticated;

-- 7. Updated_at trigger for series
CREATE TRIGGER set_series_updated_at
  BEFORE UPDATE ON ride_series
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
