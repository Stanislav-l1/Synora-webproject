-- V9: Project chats — uniqueness.
-- Runs after V8 so the new 'PROJECT' enum value is already committed
-- and safe to reference in a predicate.

CREATE UNIQUE INDEX idx_chats_project_unique
    ON chats(project_id)
    WHERE type = 'PROJECT';
