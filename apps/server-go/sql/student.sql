-- Student SQL drafts for the Go migration.
-- Keep these compatible with the Python SQLAlchemy model for ah_student.

-- name: FindStudentByToken
SELECT id, name, phone, grade, semester, subject, status, create_time, update_time
FROM ah_student
WHERE token = ?
LIMIT 1;

-- name: FindStudentByPhone
SELECT id, name, phone, password, token, grade, semester, subject, status, create_time, update_time
FROM ah_student
WHERE phone = ?
LIMIT 1;

-- name: UpdateStudentLoginToken
UPDATE ah_student
SET token = ?, update_time = ?
WHERE id = ?;
