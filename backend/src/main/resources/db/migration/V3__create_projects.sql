-- V3: Projects, Members, Tasks (Kanban)

CREATE TYPE project_status   AS ENUM ('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
CREATE TYPE member_role       AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE task_status       AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
CREATE TYPE task_priority     AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE projects (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id      UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          VARCHAR(200)   NOT NULL,
    description   TEXT,
    cover_url     VARCHAR(500),
    status        project_status NOT NULL DEFAULT 'OPEN',
    is_public     BOOLEAN        NOT NULL DEFAULT TRUE,
    repo_url      VARCHAR(500),
    website_url   VARCHAR(500),
    members_count INTEGER        NOT NULL DEFAULT 1,
    stars_count   INTEGER        NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE project_tags (
    project_id UUID   NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tag_id     BIGINT NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

CREATE TABLE project_members (
    project_id UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    role       member_role NOT NULL DEFAULT 'MEMBER',
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE project_stars (
    project_id UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

-- Kanban columns (customizable per project)
CREATE TABLE kanban_columns (
    id         BIGSERIAL PRIMARY KEY,
    project_id UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    color      VARCHAR(7),
    order_index SMALLINT    NOT NULL DEFAULT 0,
    wip_limit  SMALLINT     -- Work In Progress limit
);

CREATE TABLE tasks (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id   UUID          NOT NULL REFERENCES projects(id)     ON DELETE CASCADE,
    column_id    BIGINT        REFERENCES kanban_columns(id)        ON DELETE SET NULL,
    assignee_id  UUID          REFERENCES users(id)                 ON DELETE SET NULL,
    reporter_id  UUID          NOT NULL REFERENCES users(id),
    title        VARCHAR(500)  NOT NULL,
    description  TEXT,
    status       task_status   NOT NULL DEFAULT 'TODO',
    priority     task_priority NOT NULL DEFAULT 'MEDIUM',
    order_index  INTEGER       NOT NULL DEFAULT 0,
    due_date     DATE,
    story_points SMALLINT,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE task_labels (
    task_id    UUID        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label_name VARCHAR(50) NOT NULL,
    color      VARCHAR(7),
    PRIMARY KEY (task_id, label_name)
);

CREATE TABLE task_comments (
    id         BIGSERIAL PRIMARY KEY,
    task_id    UUID        NOT NULL REFERENCES tasks(id)  ON DELETE CASCADE,
    author_id  UUID        NOT NULL REFERENCES users(id),
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_owner    ON projects(owner_id);
CREATE INDEX idx_projects_status   ON projects(status);
CREATE INDEX idx_projects_public   ON projects(is_public);
CREATE INDEX idx_projects_created  ON projects(created_at DESC);
CREATE INDEX idx_projects_search   ON projects USING gin(
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,''))
);
CREATE INDEX idx_project_members_user    ON project_members(user_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_tasks_project     ON tasks(project_id);
CREATE INDEX idx_tasks_assignee    ON tasks(assignee_id);
CREATE INDEX idx_tasks_status      ON tasks(status);
CREATE INDEX idx_tasks_column      ON tasks(column_id, order_index);
CREATE INDEX idx_tasks_due_date    ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_kanban_columns_project ON kanban_columns(project_id, order_index);
