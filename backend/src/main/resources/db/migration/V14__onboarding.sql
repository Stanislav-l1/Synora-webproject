-- V14: Onboarding — specialization, career goal, interests, completed flag

ALTER TABLE users
    ADD COLUMN onboarding_completed BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN specialization        VARCHAR(60),
    ADD COLUMN career_goal           VARCHAR(60);

CREATE TABLE user_interests (
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(60)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, name)
);
CREATE INDEX idx_user_interests_name ON user_interests(name);
