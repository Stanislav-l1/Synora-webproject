-- Feature 30: Analytics Dashboard

CREATE TABLE page_views (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id   UUID NOT NULL,
    viewer_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address  VARCHAR(45),
    viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_views_entity    ON page_views(entity_type, entity_id);
CREATE INDEX idx_page_views_entity_dt ON page_views(entity_type, entity_id, viewed_at DESC);
CREATE INDEX idx_page_views_viewer    ON page_views(viewer_id) WHERE viewer_id IS NOT NULL;
