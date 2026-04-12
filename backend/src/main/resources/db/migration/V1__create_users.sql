-- V1: Users table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100),
    avatar_url    VARCHAR(500),
    bio           TEXT,
    github_url    VARCHAR(255),
    website_url   VARCHAR(255),
    location      VARCHAR(100),
    role          user_role    NOT NULL DEFAULT 'USER',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    is_banned     BOOLEAN      NOT NULL DEFAULT FALSE,
    reputation_score INTEGER   NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE user_skills (
    id         BIGSERIAL PRIMARY KEY,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    level      SMALLINT     CHECK (level BETWEEN 1 AND 5),
    UNIQUE (user_id, skill_name)
);

CREATE TABLE user_social_links (
    id       BIGSERIAL PRIMARY KEY,
    user_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url      VARCHAR(500) NOT NULL,
    UNIQUE (user_id, platform)
);

CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_username     ON users(username);
CREATE INDEX idx_users_role         ON users(role);
CREATE INDEX idx_users_reputation   ON users(reputation_score DESC);
CREATE INDEX idx_users_search       ON users USING gin(
    to_tsvector('english', coalesce(username,'') || ' ' || coalesce(display_name,'') || ' ' || coalesce(bio,''))
);
CREATE INDEX idx_user_skills_user   ON user_skills(user_id);
CREATE INDEX idx_refresh_token      ON refresh_tokens(token);
CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_id);
