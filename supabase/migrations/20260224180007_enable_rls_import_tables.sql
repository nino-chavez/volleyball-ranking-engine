-- Enable RLS and create policies for import_sources and import_jobs tables

-- import_sources
ALTER TABLE import_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read import_sources"
    ON import_sources FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert import_sources"
    ON import_sources FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update import_sources"
    ON import_sources FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete import_sources"
    ON import_sources FOR DELETE
    TO authenticated
    USING (true);

-- import_jobs
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read import_jobs"
    ON import_jobs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert import_jobs"
    ON import_jobs FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update import_jobs"
    ON import_jobs FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
