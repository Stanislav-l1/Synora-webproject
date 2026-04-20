-- V8: Project chats
-- Step 1 of 2: add enum value + nullable project link column.
-- We cannot USE the new enum value ('PROJECT') in the same transaction that
-- added it, so the partial unique index is created in V9.

ALTER TYPE chat_type ADD VALUE IF NOT EXISTS 'PROJECT';

ALTER TABLE chats
    ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

CREATE INDEX idx_chats_project ON chats(project_id) WHERE project_id IS NOT NULL;
