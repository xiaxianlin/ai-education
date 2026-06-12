-- Auth SQL drafts for the Go migration.
-- These queries preserve the existing ah_* MySQL tables and use database/sql
-- positional placeholders.

-- name: FindManagerByToken
SELECT id, username, type, status, create_time, update_time
FROM ah_manager
WHERE token = ?
LIMIT 1;

-- name: FindManagerByUsername
SELECT id, username, password, token, type, status, create_time, update_time
FROM ah_manager
WHERE username = ?
LIMIT 1;

-- name: UpdateManagerLoginToken
UPDATE ah_manager
SET token = ?, update_time = ?
WHERE id = ?;
