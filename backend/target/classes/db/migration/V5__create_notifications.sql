-- V5: Notifications

CREATE TYPE notification_type AS ENUM (
    'POST_LIKE',
    'POST_COMMENT',
    'COMMENT_REPLY',
    'COMMENT_LIKE',
    'PROJECT_INVITE',
    'PROJECT_JOIN',
    'TASK_ASSIGNED',
    'TASK_COMPLETED',
    'MESSAGE_RECEIVED',
    'FOLLOW',
    'REPUTATION_MILESTONE',
    'SYSTEM'
);

CREATE TABLE notifications (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id     UUID              REFERENCES users(id) ON DELETE SET NULL, -- кто вызвал
    type         notification_type NOT NULL,
    entity_id    UUID,             -- ID поста/проекта/задачи etc.
    entity_type  VARCHAR(50),      -- 'POST', 'PROJECT', 'TASK' etc.
    payload      JSONB,            -- дополнительные данные
    is_read      BOOLEAN           NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- User follow system
CREATE TABLE user_follows (
    follower_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Indexes
CREATE INDEX idx_notifications_user     ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread   ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type     ON notifications(type);
CREATE INDEX idx_notifications_entity   ON notifications(entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_user_follows_follower  ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
