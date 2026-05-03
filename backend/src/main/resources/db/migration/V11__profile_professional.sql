-- V11: Professional profile fields

ALTER TABLE users
    ADD COLUMN headline       VARCHAR(120),
    ADD COLUMN pronouns       VARCHAR(30),
    ADD COLUMN available_for  VARCHAR(120);

CREATE INDEX idx_users_available_for ON users(available_for) WHERE available_for IS NOT NULL;
