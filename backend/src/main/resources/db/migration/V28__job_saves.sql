-- V28: Job saves / bookmarks

CREATE TABLE job_saves (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id  UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, job_id)
);

CREATE INDEX idx_job_saves_user ON job_saves(user_id);
CREATE INDEX idx_job_saves_job  ON job_saves(job_id);

-- Full-text search index for job postings
CREATE INDEX idx_job_postings_search ON job_postings
    USING gin(to_tsvector('english', title || ' ' || COALESCE(company, '') || ' ' || description));
