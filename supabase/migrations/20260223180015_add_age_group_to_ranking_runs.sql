-- Add age_group column to ranking_runs so each run is scoped to a single age group.
ALTER TABLE ranking_runs ADD COLUMN age_group age_group_enum;

-- Backfill existing rows (all dev data is 18U).
UPDATE ranking_runs SET age_group = '18U' WHERE age_group IS NULL;

-- Make the column required going forward.
ALTER TABLE ranking_runs ALTER COLUMN age_group SET NOT NULL;

-- Composite index for efficient season + age_group lookups.
CREATE INDEX idx_ranking_runs_season_age_group ON ranking_runs(season_id, age_group);
