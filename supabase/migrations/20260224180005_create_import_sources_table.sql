-- Create the import_sources table for managing data ingestion sources
CREATE TABLE IF NOT EXISTS import_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('xlsx_file', 'xlsx_url')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    age_group age_group_enum NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('finishes', 'colley')) DEFAULT 'finishes',
    enabled BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for filtering by season
CREATE INDEX idx_import_sources_season_id ON import_sources(season_id);

-- Apply the updated_at trigger
CREATE TRIGGER set_import_sources_updated_at
    BEFORE UPDATE ON import_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
