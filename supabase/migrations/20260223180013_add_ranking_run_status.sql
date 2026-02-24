-- Migration: Add status column to ranking_runs table
-- Supports draft/finalized workflow for committee overrides.
-- Draft runs allow overrides; finalized runs are read-only.

ALTER TABLE ranking_runs
    ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'finalized'));
