-- Add club_id foreign key to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs(id) ON DELETE SET NULL;

-- Index for club lookups
CREATE INDEX idx_teams_club_id ON teams(club_id);
