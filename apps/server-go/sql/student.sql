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

-- name: GetStudentProfile
SELECT name, phone, grade, semester, subject
FROM ah_student
WHERE id = ?
LIMIT 1;

-- name: ListStudentTextbooks
SELECT t.id, t.subject, t.version, t.grade, t.semester, t.file, t.index_file_id, t.is_parsed
FROM ah_textbook t
INNER JOIN ah_student_textbook_config c ON c.textbook_id = t.id
WHERE c.student_id = ?
ORDER BY t.id;

-- name: UpdateStudentSettings
UPDATE ah_student
SET grade = ?, semester = ?, subject = ?, update_time = ?
WHERE id = ?;
