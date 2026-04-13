-- Add coffee shop fields for cafe rides
ALTER TABLE rides ADD COLUMN coffee_shop_name TEXT;
ALTER TABLE rides ADD COLUMN coffee_shop_address TEXT;

ALTER TABLE ride_series ADD COLUMN coffee_shop_name TEXT;
ALTER TABLE ride_series ADD COLUMN coffee_shop_address TEXT;

-- Update the generate_next_series_ride function to copy coffee shop fields
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
BEGIN
  -- Get series info
  SELECT * INTO v_series FROM ride_series WHERE id = p_series_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Calculate today in the series timezone
  v_today := (now() AT TIME ZONE v_series.timezone)::DATE;

  -- Check season bounds
  IF v_series.start_date IS NOT NULL AND v_today < v_series.start_date THEN
    RETURN NULL;
  END IF;
  IF v_series.end_date IS NOT NULL AND v_today > v_series.end_date THEN
    RETURN NULL;
  END IF;

  -- Calculate next occurrence date (today or future)
  v_days_ahead := (v_series.day_of_week - EXTRACT(DOW FROM v_today)::INT + 7) % 7;
  -- If today is the day but the time has passed, skip to next week
  IF v_days_ahead = 0 AND (now() AT TIME ZONE v_series.timezone)::TIME > v_series.start_time + INTERVAL '4 hours' THEN
    v_days_ahead := 7;
  END IF;
  v_next_date := v_today + v_days_ahead;

  -- Check if next date is within season
  IF v_series.end_date IS NOT NULL AND v_next_date > v_series.end_date THEN
    RETURN NULL;
  END IF;

  v_next_datetime := (v_next_date || ' ' || v_series.start_time)::TIMESTAMP AT TIME ZONE v_series.timezone;

  -- Check if a ride already exists for this date
  SELECT id INTO v_existing_ride_id
  FROM rides
  WHERE series_id = p_series_id
    AND (start_datetime AT TIME ZONE v_series.timezone)::DATE = v_next_date;

  IF v_existing_ride_id IS NOT NULL THEN
    RETURN v_existing_ride_id;
  END IF;

  -- Create the next occurrence (now includes coffee shop fields)
  INSERT INTO rides (creator_id, title, description, start_location, start_datetime, distance_miles, pace, route_link, series_id, tags, coffee_shop_name, coffee_shop_address)
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
    v_series.tags,
    v_series.coffee_shop_name,
    v_series.coffee_shop_address
  )
  RETURNING id INTO v_new_ride_id;

  RETURN v_new_ride_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
