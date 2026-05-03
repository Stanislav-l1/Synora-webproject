-- V19: Git Repository Integration — GitHub/GitLab import, contribution graph

CREATE TYPE git_provider AS ENUM ('GITHUB', 'GITLAB', 'BITBUCKET');

CREATE TABLE git_repositories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        git_provider  NOT NULL,
    external_id     VARCHAR(100)  NOT NULL,
    name            VARCHAR(200)  NOT NULL,
    full_name       VARCHAR(300),
    description     TEXT,
    url             VARCHAR(500)  NOT NULL,
    homepage_url    VARCHAR(500),
    language        VARCHAR(80),
    topics          TEXT[]        DEFAULT '{}',
    stars_count     INT           NOT NULL DEFAULT 0,
    forks_count     INT           NOT NULL DEFAULT 0,
    watchers_count  INT           NOT NULL DEFAULT 0,
    open_issues     INT           NOT NULL DEFAULT 0,
    is_private      BOOLEAN       NOT NULL DEFAULT FALSE,
    is_fork         BOOLEAN       NOT NULL DEFAULT FALSE,
    is_featured     BOOLEAN       NOT NULL DEFAULT FALSE,
    last_pushed_at  TIMESTAMPTZ,
    synced_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, provider, external_id)
);

CREATE TABLE contribution_data (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider   git_provider NOT NULL,
    year       SMALLINT    NOT NULL,
    data       JSONB       NOT NULL DEFAULT '{}',
    synced_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, provider, year)
);

CREATE TABLE git_oauth_tokens (
    user_id       UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    provider      git_provider NOT NULL,
    access_token  TEXT        NOT NULL,
    scope         VARCHAR(200),
    token_type    VARCHAR(50),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_git_repos_user     ON git_repositories(user_id);
CREATE INDEX idx_git_repos_provider ON git_repositories(provider);
CREATE INDEX idx_git_repos_featured ON git_repositories(user_id) WHERE is_featured = TRUE;
CREATE INDEX idx_contrib_user_year  ON contribution_data(user_id, year);
