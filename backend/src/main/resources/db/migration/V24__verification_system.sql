CREATE TYPE verification_type   AS ENUM ('PROFESSIONAL', 'COMPANY', 'MENTOR', 'STARTUP');
CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE user_verifications (
    id           UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID                 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type         verification_type    NOT NULL,
    status       verification_status  NOT NULL DEFAULT 'PENDING',
    notes        TEXT,
    admin_notes  TEXT,
    reviewed_by  UUID                 REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_verifications_user   ON user_verifications(user_id);
CREATE INDEX idx_user_verifications_status ON user_verifications(status);

ALTER TABLE users
    ADD COLUMN is_verified        BOOLEAN           NOT NULL DEFAULT FALSE,
    ADD COLUMN verification_type  verification_type;
