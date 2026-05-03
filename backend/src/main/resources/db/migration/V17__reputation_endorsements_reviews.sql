-- V17: Skill endorsements + peer reviews

CREATE TABLE skill_endorsements (
    skill_id    BIGINT      NOT NULL REFERENCES user_skills(id) ON DELETE CASCADE,
    endorser_id UUID        NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (skill_id, endorser_id)
);
CREATE INDEX idx_skill_endorsements_skill    ON skill_endorsements(skill_id);
CREATE INDEX idx_skill_endorsements_endorser ON skill_endorsements(endorser_id);

CREATE TYPE peer_review_context AS ENUM ('PROJECT', 'COURSE', 'MENTORSHIP', 'GENERAL');

CREATE TABLE peer_reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewee_id UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score       SMALLINT     NOT NULL CHECK (score BETWEEN 1 AND 5),
    context     peer_review_context NOT NULL DEFAULT 'GENERAL',
    comment     TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (reviewee_id, reviewer_id),
    CHECK (reviewee_id <> reviewer_id)
);
CREATE INDEX idx_peer_reviews_reviewee ON peer_reviews(reviewee_id);
CREATE INDEX idx_peer_reviews_reviewer ON peer_reviews(reviewer_id);
