ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id VARCHAR(64) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;
