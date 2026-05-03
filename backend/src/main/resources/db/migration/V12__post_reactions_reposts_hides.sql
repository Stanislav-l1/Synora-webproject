-- V12: Post reactions, reposts, hides

CREATE TYPE reaction_type AS ENUM ('LIKE','LOVE','FIRE','CLAP','THINKING','LAUGH');

CREATE TABLE post_reactions (
    post_id    UUID          NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       reaction_type NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);
CREATE INDEX idx_post_reactions_user ON post_reactions(user_id);
CREATE INDEX idx_post_reactions_type ON post_reactions(post_id, type);

CREATE TABLE post_hides (
    post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);
CREATE INDEX idx_post_hides_user ON post_hides(user_id);

ALTER TABLE posts
    ADD COLUMN repost_of_id   UUID REFERENCES posts(id) ON DELETE SET NULL,
    ADD COLUMN reposts_count  INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_posts_repost_of ON posts(repost_of_id);
