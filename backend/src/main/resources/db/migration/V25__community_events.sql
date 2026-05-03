-- V25: Community Events — public events with registration

CREATE TYPE community_event_type AS ENUM (
    'MEETUP',
    'WEBINAR',
    'CONFERENCE',
    'HACKATHON',
    'WORKSHOP',
    'OTHER'
);

CREATE TYPE community_event_status AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'CANCELLED',
    'COMPLETED'
);

CREATE TYPE event_registration_status AS ENUM (
    'REGISTERED',
    'WAITLISTED',
    'CANCELLED',
    'ATTENDED'
);

CREATE TABLE community_events (
    id              UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id    UUID                    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id    UUID                    REFERENCES communities(id) ON DELETE SET NULL,
    type            community_event_type    NOT NULL DEFAULT 'MEETUP',
    status          community_event_status  NOT NULL DEFAULT 'DRAFT',
    title           VARCHAR(200)            NOT NULL,
    slug            VARCHAR(220)            NOT NULL UNIQUE,
    description     TEXT,
    cover_url       VARCHAR(500),
    starts_at       TIMESTAMPTZ             NOT NULL,
    ends_at         TIMESTAMPTZ             NOT NULL,
    timezone        VARCHAR(64)             NOT NULL DEFAULT 'UTC',
    location        VARCHAR(255),
    venue_name      VARCHAR(200),
    online_url      VARCHAR(500),
    is_online       BOOLEAN                 NOT NULL DEFAULT FALSE,
    capacity        INT,
    tags            TEXT[]                  NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    CHECK (ends_at >= starts_at)
);

CREATE INDEX idx_community_events_organizer ON community_events(organizer_id);
CREATE INDEX idx_community_events_community ON community_events(community_id) WHERE community_id IS NOT NULL;
CREATE INDEX idx_community_events_status    ON community_events(status);
CREATE INDEX idx_community_events_starts_at ON community_events(starts_at);
CREATE INDEX idx_community_events_type      ON community_events(type);

CREATE TABLE event_registrations (
    id          UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID                        NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
    user_id     UUID                        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      event_registration_status   NOT NULL DEFAULT 'REGISTERED',
    registered_at TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id, status);
CREATE INDEX idx_event_registrations_user  ON event_registrations(user_id);
