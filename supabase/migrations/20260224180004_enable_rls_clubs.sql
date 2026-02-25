-- Enable RLS on clubs table (matching existing pattern)
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all clubs
CREATE POLICY "Authenticated users can read clubs"
  ON clubs FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert clubs
CREATE POLICY "Authenticated users can insert clubs"
  ON clubs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update clubs
CREATE POLICY "Authenticated users can update clubs"
  ON clubs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
