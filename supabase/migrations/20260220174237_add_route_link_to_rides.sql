/*
  # Add route_link column to rides table

  ## Summary
  Adds an optional route_link text column to the rides table to store
  external route URLs (e.g., Strava, RideWithGPS, Google Maps links).

  ## Changes
  - `rides` table: new optional `route_link` column (text, nullable)

  ## Notes
  - No constraints applied; any URL is accepted
  - Existing rows will have NULL for this column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rides' AND column_name = 'route_link'
  ) THEN
    ALTER TABLE rides ADD COLUMN route_link text;
  END IF;
END $$;
