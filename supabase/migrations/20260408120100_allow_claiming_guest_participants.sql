CREATE POLICY "Authenticated users can claim guest participants"
  ON participants FOR UPDATE
  TO authenticated
  USING (user_id IS NULL)
  WITH CHECK (user_id = auth.uid());
