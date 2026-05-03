CREATE TYPE subscription_tier   AS ENUM ('FREE', 'PRO', 'TEAM', 'BUSINESS');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL');

ALTER TABLE users
    ADD COLUMN subscription_tier subscription_tier NOT NULL DEFAULT 'FREE';

CREATE TABLE user_subscriptions (
    id           UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID               NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier         subscription_tier  NOT NULL,
    status       subscription_status NOT NULL DEFAULT 'ACTIVE',
    started_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    expires_at   TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user   ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_active ON user_subscriptions(user_id, status);
