-- Migration: Create ranking_overrides table
-- Stores committee manual adjustments to algorithmic rankings.
-- Each override records the original algo rank, the committee-assigned final rank,
-- a justification (audit trail), and the committee member who made the change.

CREATE TABLE ranking_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ranking_run_id UUID NOT NULL REFERENCES ranking_runs(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    original_rank INTEGER NOT NULL,
    final_rank INTEGER NOT NULL,
    justification TEXT NOT NULL CHECK (char_length(justification) >= 10),
    committee_member TEXT NOT NULL CHECK (char_length(committee_member) >= 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_ranking_overrides_run_team UNIQUE (ranking_run_id, team_id)
);

CREATE INDEX idx_ranking_overrides_ranking_run_id ON ranking_overrides(ranking_run_id);
CREATE INDEX idx_ranking_overrides_team_id ON ranking_overrides(team_id);

CREATE TRIGGER trg_ranking_overrides_updated_at
    BEFORE UPDATE ON ranking_overrides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
