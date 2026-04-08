CREATE OR REPLACE FUNCTION add_creator_as_participant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO participants (ride_id, user_id, guest_name)
  VALUES (NEW.id, NEW.creator_id, NULL)
  ON CONFLICT (ride_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_add_creator_as_participant
  AFTER INSERT ON rides
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_participant();
