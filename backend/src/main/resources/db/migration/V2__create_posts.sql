-- V2: Posts, Comments, Likes, Tags

CREATE TYPE post_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE tags (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE,
    color      VARCHAR(7),  -- hex color
    usage_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE posts (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(300) NOT NULL,
    content      TEXT         NOT NULL,
    preview      VARCHAR(500),
    cover_url    VARCHAR(500),
    status       post_status  NOT NULL DEFAULT 'PUBLISHED',
    views_count  INTEGER      NOT NULL DEFAULT 0,
    likes_count  INTEGER      NOT NULL DEFAULT 0,
    comments_count INTEGER    NOT NULL DEFAULT 0,
    is_pinned    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE post_tags (
    post_id UUID      NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  BIGINT    NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE post_likes (
    post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE comments (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id      UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id    UUID        REFERENCES comments(id) ON DELETE CASCADE,
    content      TEXT        NOT NULL,
    likes_count  INTEGER     NOT NULL DEFAULT 0,
    is_deleted   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comment_likes (
    comment_id UUID        NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (comment_id, user_id)
);

-- Saved posts (bookmarks)
CREATE TABLE post_bookmarks (
    post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- Indexes
CREATE INDEX idx_posts_author      ON posts(author_id);
CREATE INDEX idx_posts_status      ON posts(status);
CREATE INDEX idx_posts_created     ON posts(created_at DESC);
CREATE INDEX idx_posts_likes       ON posts(likes_count DESC);
CREATE INDEX idx_posts_search      ON posts USING gin(
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))
);
CREATE INDEX idx_post_tags_tag     ON post_tags(tag_id);
CREATE INDEX idx_comments_post     ON comments(post_id);
CREATE INDEX idx_comments_author   ON comments(author_id);
CREATE INDEX idx_comments_parent   ON comments(parent_id);
CREATE INDEX idx_comments_created  ON comments(created_at);
CREATE INDEX idx_tags_name         ON tags(name);
CREATE INDEX idx_tags_usage        ON tags(usage_count DESC);
