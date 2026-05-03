-- V18: Career System — job postings, applications, team/cofounder search

CREATE TYPE job_type AS ENUM (
    'FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'CO_FOUNDER', 'TEAM_MEMBER'
);

CREATE TYPE job_status AS ENUM ('OPEN', 'CLOSED', 'DRAFT');

CREATE TYPE application_status AS ENUM ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED');

CREATE TABLE job_postings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id       UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id      UUID            REFERENCES projects(id) ON DELETE SET NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            NOT NULL,
    company         VARCHAR(150),
    location        VARCHAR(150),
    remote          BOOLEAN         NOT NULL DEFAULT FALSE,
    type            job_type        NOT NULL,
    status          job_status      NOT NULL DEFAULT 'OPEN',
    salary_min      INT,
    salary_max      INT,
    currency        VARCHAR(10)     DEFAULT 'USD',
    experience_years SMALLINT,
    application_url VARCHAR(500),
    applications_count INT          NOT NULL DEFAULT 0,
    views_count     INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE job_skills (
    job_id  UUID        NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    skill   VARCHAR(80) NOT NULL,
    PRIMARY KEY (job_id, skill)
);

CREATE TABLE job_applications (
    id           UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id       UUID              NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    applicant_id UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status       application_status NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    UNIQUE (job_id, applicant_id)
);

CREATE INDEX idx_job_postings_author   ON job_postings(author_id);
CREATE INDEX idx_job_postings_type     ON job_postings(type);
CREATE INDEX idx_job_postings_status   ON job_postings(status);
CREATE INDEX idx_job_postings_project  ON job_postings(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_job_applications_job  ON job_applications(job_id);
CREATE INDEX idx_job_applications_user ON job_applications(applicant_id);
CREATE INDEX idx_job_skills_job        ON job_skills(job_id);
