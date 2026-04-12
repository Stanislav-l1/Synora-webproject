-- V4: Messages (Direct + Group chats)

CREATE TYPE chat_type AS ENUM ('DIRECT', 'GROUP');

CREATE TABLE chats (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type       chat_type   NOT NULL DEFAULT 'DIRECT',
    name       VARCHAR(100),  -- только для GROUP
    avatar_url VARCHAR(500),
    created_by UUID        NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_members (
    chat_id    UUID        NOT NULL REFERENCES chats(id)  ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    is_admin   BOOLEAN     NOT NULL DEFAULT FALSE,
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,          -- для счётчика непрочитанных
    is_muted   BOOLEAN     NOT NULL DEFAULT FALSE,
    PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id     UUID        NOT NULL REFERENCES chats(id)    ON DELETE CASCADE,
    sender_id   UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    reply_to_id UUID        REFERENCES messages(id)          ON DELETE SET NULL,
    content     TEXT,
    is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE,
    edited_at   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Вложения к сообщениям
CREATE TABLE message_attachments (
    id         BIGSERIAL PRIMARY KEY,
    message_id UUID        NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    s3_key     VARCHAR(500) NOT NULL,
    filename   VARCHAR(255) NOT NULL,
    mime_type  VARCHAR(100),
    size_bytes BIGINT
);

-- Реакции на сообщения
CREATE TABLE message_reactions (
    message_id UUID        NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    emoji      VARCHAR(10) NOT NULL,
    PRIMARY KEY (message_id, user_id, emoji)
);

-- Indexes
CREATE INDEX idx_messages_chat      ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender    ON messages(sender_id);
CREATE INDEX idx_messages_created   ON messages(created_at DESC);
CREATE INDEX idx_chat_members_user  ON chat_members(user_id);
CREATE INDEX idx_chat_members_chat  ON chat_members(chat_id);

-- Unique constraint: только один DIRECT чат между двумя пользователями
-- (enforced at application level via sorted user IDs)
