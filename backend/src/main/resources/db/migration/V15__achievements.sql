-- V15: User achievements

CREATE TABLE user_achievements (
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code       VARCHAR(60)  NOT NULL,
    awarded_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, code)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_awarded_at ON user_achievements(awarded_at);
