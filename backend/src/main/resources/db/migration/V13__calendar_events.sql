-- V13: Calendar — events, attendees

CREATE TYPE calendar_event_type AS ENUM (
    'MEETING',
    'CALL',
    'DEADLINE',
    'TASK',
    'TEAM_EVENT',
    'REMINDER'
);

CREATE TYPE attendee_status AS ENUM (
    'INVITED',
    'ACCEPTED',
    'DECLINED',
    'TENTATIVE'
);

CREATE TABLE calendar_events (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id      UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id    UUID                REFERENCES projects(id) ON DELETE SET NULL,
    type          calendar_event_type NOT NULL DEFAULT 'MEETING',
    title         VARCHAR(200)        NOT NULL,
    description   TEXT,
    starts_at     TIMESTAMPTZ         NOT NULL,
    ends_at       TIMESTAMPTZ         NOT NULL,
    all_day       BOOLEAN             NOT NULL DEFAULT FALSE,
    location      VARCHAR(255),
    meeting_url   VARCHAR(500),
    color         VARCHAR(7),
    created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    CHECK (ends_at >= starts_at)
);

CREATE INDEX idx_calendar_events_owner       ON calendar_events(owner_id, starts_at);
CREATE INDEX idx_calendar_events_project     ON calendar_events(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_calendar_events_range       ON calendar_events(starts_at, ends_at);

CREATE TABLE calendar_event_attendees (
    event_id   UUID            NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id    UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status     attendee_status NOT NULL DEFAULT 'INVITED',
    created_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

CREATE INDEX idx_event_attendees_user ON calendar_event_attendees(user_id, status);
