-- V10: Invitations + imported contacts for the People module.

CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

CREATE TABLE invitations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inviter_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email       VARCHAR(255) NOT NULL,
    token       VARCHAR(80)  NOT NULL UNIQUE,
    message     TEXT,
    status      invitation_status NOT NULL DEFAULT 'PENDING',
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    expires_at  TIMESTAMPTZ  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_inviter ON invitations(inviter_id);
CREATE INDEX idx_invitations_email   ON invitations(lower(email));
CREATE INDEX idx_invitations_status  ON invitations(status);

CREATE TABLE user_contacts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email      VARCHAR(255) NOT NULL,
    name       VARCHAR(150),
    source     VARCHAR(32)  NOT NULL DEFAULT 'MANUAL',
    matched_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, email)
);

CREATE INDEX idx_user_contacts_user    ON user_contacts(user_id);
CREATE INDEX idx_user_contacts_email   ON user_contacts(lower(email));
CREATE INDEX idx_user_contacts_matched ON user_contacts(matched_user_id);
