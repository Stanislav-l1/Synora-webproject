-- V16: News items (admin-curated, optionally tagged)

CREATE TABLE news_items (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title        VARCHAR(255) NOT NULL,
    summary      TEXT,
    url          VARCHAR(500),
    source       VARCHAR(100),
    image_url    VARCHAR(500),
    published_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_items_published_at ON news_items(published_at DESC);

CREATE TABLE news_item_tags (
    news_id UUID   NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
    tag_id  BIGINT NOT NULL REFERENCES tags(id)       ON DELETE CASCADE,
    PRIMARY KEY (news_id, tag_id)
);

CREATE INDEX idx_news_item_tags_tag ON news_item_tags(tag_id);
