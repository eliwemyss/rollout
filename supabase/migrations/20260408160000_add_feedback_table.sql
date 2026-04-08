-- Feedback / feature request submissions
-- Anyone (anon or authenticated) can submit
-- Only admins can read/manage submissions

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
  message TEXT NOT NULL,
  contact_info TEXT, -- optional way for submitter to be reached
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'done', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback
CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can only set their own user_id or null
-- (enforced in app logic, policy just allows insert)

-- Admins can read all feedback
CREATE POLICY "Admins can read feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Submitters can see their own feedback
CREATE POLICY "Users can see own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can update feedback (status, notes)
CREATE POLICY "Admins can update feedback"
  ON feedback FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can delete feedback
CREATE POLICY "Admins can delete feedback"
  ON feedback FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
