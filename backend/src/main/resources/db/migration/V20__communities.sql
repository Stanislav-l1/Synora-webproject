-- V20: Communities system

CREATE TYPE community_role    AS ENUM ('OWNER', 'MODERATOR', 'MEMBER');
CREATE TYPE community_privacy AS ENUM ('PUBLIC', 'PRIVATE', 'INVITE_ONLY');

CREATE TABLE communities (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL UNIQUE,
    slug          VARCHAR(100) NOT NULL UNIQUE,
    description   TEXT,
    avatar_url    VARCHAR(500),
    banner_url    VARCHAR(500),
    privacy       community_privacy NOT NULL DEFAULT 'PUBLIC',
    owner_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    members_count INT          NOT NULL DEFAULT 1,
    posts_count   INT          NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE community_members (
    community_id UUID          NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id      UUID          NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    role         community_role NOT NULL DEFAULT 'MEMBER',
    joined_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    PRIMARY KEY (community_id, user_id)
);

-- Posts can optionally belong to a community
ALTER TABLE posts ADD COLUMN community_id UUID REFERENCES communities(id) ON DELETE SET NULL;

CREATE INDEX idx_communities_slug    ON communities(slug);
CREATE INDEX idx_communities_owner   ON communities(owner_id);
CREATE INDEX idx_community_members_u ON community_members(user_id);
CREATE INDEX idx_posts_community     ON posts(community_id);
CREATE INDEX idx_communities_name_gin ON communities USING GIN (name gin_trgm_ops);
