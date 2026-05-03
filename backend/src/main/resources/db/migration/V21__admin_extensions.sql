-- V21: Admin extensions — ban metadata on users
ALTER TABLE users
    ADD COLUMN ban_reason  VARCHAR(500),
    ADD COLUMN banned_at   TIMESTAMPTZ,
    ADD COLUMN banned_by   UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_users_banned ON users(is_banned) WHERE is_banned = TRUE;
