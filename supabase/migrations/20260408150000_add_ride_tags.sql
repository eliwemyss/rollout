-- Add tags to rides and ride_series for categorization
-- Tags are stored as text arrays with a predefined set enforced in the frontend
-- Possible tags: social, no-drop, drop, gravel, training, cafe, mtb

ALTER TABLE rides ADD COLUMN tags TEXT[] DEFAULT '{}';
ALTER TABLE ride_series ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Update the generate function to also copy tags to new ride occurrences
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
  SELECT * INTO v_series FROM ride_series WHERE id = p_series_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_days_ahead := (v_series.day_of_week - EXTRACT(DOW FROM v_today)::INT + 7) % 7;
  IF v_days_ahead = 0 AND CURRENT_TIME > v_series.start_time + INTERVAL '4 hours' THEN
    v_days_ahead := 7;
  END IF;
  v_next_date := v_today + v_days_ahead;
  v_next_datetime := (v_next_date || ' ' || v_series.start_time)::TIMESTAMPTZ;

  SELECT id INTO v_existing_ride_id
  FROM rides
  WHERE series_id = p_series_id
    AND start_datetime::DATE = v_next_date;

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
