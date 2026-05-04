-- Feature 31: Security Layer

CREATE TABLE login_history (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address     VARCHAR(45),
    user_agent     TEXT,
    device_type    VARCHAR(20) NOT NULL DEFAULT 'DESKTOP',
    success        BOOLEAN NOT NULL DEFAULT true,
    failure_reason VARCHAR(200),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_login_history_user ON login_history(user_id, created_at DESC);

CREATE TABLE user_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash  VARCHAR(64) NOT NULL,
    device_name         VARCHAR(200),
    device_type         VARCHAR(20) NOT NULL DEFAULT 'DESKTOP',
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    last_active_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ NOT NULL,
    revoked             BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user  ON user_sessions(user_id, revoked, expires_at);
CREATE UNIQUE INDEX idx_user_sessions_token ON user_sessions(refresh_token_hash);

ALTER TABLE users
    ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN totp_secret        VARCHAR(64),
    ADD COLUMN totp_backup_codes  TEXT,
    ADD COLUMN profile_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    ADD COLUMN show_email         BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN show_activity      BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN show_online_status BOOLEAN NOT NULL DEFAULT true;
