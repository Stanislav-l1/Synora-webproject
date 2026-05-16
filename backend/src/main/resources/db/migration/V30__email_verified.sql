ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Существующие юзеры считаются верифицированными (чтобы не блокировать живых пользователей)
UPDATE users SET email_verified = TRUE WHERE created_at < NOW();
