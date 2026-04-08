-- Add timezone to ride_series so generated rides have correct local time
ALTER TABLE ride_series ADD COLUMN timezone TEXT NOT NULL DEFAULT 'America/Chicago';

-- Rebuild the function to use the series timezone
CREATE OR REPLACE FUNCTION generate_next_series_ride(p_series_id UUID)
RETURNS UUID AS $$
DECLARE
  v_series ride_series%ROWTYPE;
  v_next_date DATE;
  v_next_datetime TIMESTAMPTZ;
  v_existing_ride_id UUID;
  v_new_ride_id UUID;
  v_today DATE;
  v_days_ahead INT;
  v_now_local TIMESTAMP;
BEGIN
  SELECT * INTO v_series FROM ride_series WHERE id = p_series_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Get current date/time in the series timezone
  v_now_local := now() AT TIME ZONE v_series.timezone;
  v_today := v_now_local::DATE;

  v_days_ahead := (v_series.day_of_week - EXTRACT(DOW FROM v_today)::INT + 7) % 7;
  -- If today is the day but the ride time + 4 hours has passed, skip to next week
  IF v_days_ahead = 0 AND v_now_local::TIME > v_series.start_time + INTERVAL '4 hours' THEN
    v_days_ahead := 7;
  END IF;
  v_next_date := v_today + v_days_ahead;

  -- Build the datetime in the series timezone, then convert to UTC for storage
  v_next_datetime := (v_next_date || ' ' || v_series.start_time)::TIMESTAMP AT TIME ZONE v_series.timezone;

  SELECT id INTO v_existing_ride_id
  FROM rides
  WHERE series_id = p_series_id
    AND start_datetime = v_next_datetime;

  IF v_existing_ride_id IS NOT NULL THEN
    RETURN v_existing_ride_id;
  END IF;

  INSERT INTO rides (creator_id, title, description, start_location, start_datetime, distance_miles, pace, route_link, series_id, tags)
  VALUES (
    v_series.creator_id,
    v_series.title,
    v_series.description,
    v_series.start_location,
    v_next_datetime,
    v_series.distance_miles,
    v_series.pace,
    v_series.route_link,
    v_series.id,
    v_series.tags
  )
  RETURNING id INTO v_new_ride_id;

  RETURN v_new_ride_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
