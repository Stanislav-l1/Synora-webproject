-- V6: File uploads + Reputation + Reports (Admin)

-- Файлы
CREATE TABLE file_uploads (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    s3_key      VARCHAR(500) NOT NULL UNIQUE,
    original_name VARCHAR(255) NOT NULL,
    mime_type   VARCHAR(100),
    size_bytes  BIGINT,
    entity_id   UUID,         -- привязка к посту / проекту / etc
    entity_type VARCHAR(50),
    is_public   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Репутация: история событий
CREATE TYPE reputation_event_type AS ENUM (
    'POST_PUBLISHED',
    'POST_LIKED',
    'COMMENT_LIKED',
    'PROJECT_CREATED',
    'TASK_COMPLETED',
    'RECEIVED_FOLLOW',
    'MILESTONE_BONUS',
    'PENALTY'
);

CREATE TABLE reputation_events (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID                    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        reputation_event_type   NOT NULL,
    delta       SMALLINT                NOT NULL,  -- +5, -10, etc.
    entity_id   UUID,
    entity_type VARCHAR(50),
    description VARCHAR(255),
    created_at  TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

-- Жалобы (для модерации)
CREATE TYPE report_type   AS ENUM ('POST', 'COMMENT', 'USER', 'PROJECT', 'MESSAGE');
CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

CREATE TABLE reports (
    id           BIGSERIAL PRIMARY KEY,
    reporter_id  UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_id    UUID          NOT NULL,
    entity_type  report_type   NOT NULL,
    reason       VARCHAR(100)  NOT NULL,
    description  TEXT,
    status       report_status NOT NULL DEFAULT 'PENDING',
    reviewer_id  UUID          REFERENCES users(id),
    reviewed_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Audit log для админ-действий
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    actor_id    UUID         NOT NULL REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    entity_id   UUID,
    entity_type VARCHAR(50),
    details     JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_file_uploads_uploader ON file_uploads(uploader_id);
CREATE INDEX idx_file_uploads_entity   ON file_uploads(entity_id, entity_type);
CREATE INDEX idx_reputation_user       ON reputation_events(user_id, created_at DESC);
CREATE INDEX idx_reputation_type       ON reputation_events(type);
CREATE INDEX idx_reports_status        ON reports(status);
CREATE INDEX idx_reports_entity        ON reports(entity_id, entity_type);
CREATE INDEX idx_audit_logs_actor      ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created    ON audit_logs(created_at DESC);
