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

-- name: AdminGetStudent
SELECT id, name, phone, grade, semester, subject, status, create_time, update_time
FROM ah_student
WHERE id = ?
LIMIT 1;

-- name: AdminSearchStudents
SELECT id, name, phone, grade, semester, subject, status, create_time, update_time
FROM ah_student
WHERE (? = '' OR name LIKE ?)
  AND (? = '' OR phone = ?)
  AND (? = '' OR name LIKE ? OR phone LIKE ?)
  AND (? IS NULL OR status = ?)
ORDER BY create_time DESC
LIMIT ? OFFSET ?;

-- name: AdminCountStudents
SELECT COUNT(id)
FROM ah_student
WHERE (? = '' OR name LIKE ?)
  AND (? = '' OR phone = ?)
  AND (? = '' OR name LIKE ? OR phone LIKE ?)
  AND (? IS NULL OR status = ?);

-- name: AdminCreateStudent
INSERT INTO ah_student (id, name, phone, password, grade, status, create_time, update_time)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- name: AdminUpdateStudent
UPDATE ah_student
SET name = ?, phone = ?, grade = ?, status = ?, update_time = ?
WHERE id = ?;

-- name: AdminDeleteStudent
DELETE FROM ah_student
WHERE id = ?;

-- name: AdminResetStudentPassword
UPDATE ah_student
SET password = ?, update_time = ?
WHERE id = ?;

-- name: AdminListUnusedTextbooks
SELECT t.id, t.subject, t.version, t.grade, t.semester, t.file, t.index_file_id, t.is_parsed
FROM ah_textbook t
WHERE NOT EXISTS (
  SELECT 1 FROM ah_student_textbook_config c
  WHERE c.student_id = ? AND c.textbook_id = t.id
)
ORDER BY t.id;

-- name: AdminListStudentTextbookConfigs
SELECT c.id, c.student_id, c.textbook_id, c.create_time, c.update_time,
       t.id, t.subject, t.version, t.grade, t.semester, t.file, t.index_file_id, t.is_parsed
FROM ah_student_textbook_config c
LEFT JOIN ah_textbook t ON c.textbook_id = t.id
WHERE c.student_id = ?
ORDER BY c.id DESC
LIMIT ? OFFSET ?;

-- name: AdminCreateStudentTextbookConfig
INSERT INTO ah_student_textbook_config (student_id, textbook_id, create_time, update_time)
VALUES (?, ?, ?, ?);

-- name: AdminUpdateStudentTextbookConfig
UPDATE ah_student_textbook_config
SET textbook_id = ?, update_time = ?
WHERE id = ? AND student_id = ?;

-- name: AdminDeleteStudentTextbookConfig
DELETE FROM ah_student_textbook_config
WHERE id = ? AND student_id = ?;

-- name: AdminSetStudentTextbookConfigsClear
DELETE FROM ah_student_textbook_config
WHERE student_id = ?;

-- name: AdminListStudentMastery
SELECT m.id, m.student_id, m.ability_code, m.mastery_score, m.mastery_level,
       m.correct_count, m.wrong_count, m.last_practice_time, m.create_time, m.update_time,
       a.name, a.subject, a.grade
FROM ah_student_ability_mastery m
LEFT JOIN ah_ability a ON m.ability_code = a.code
WHERE m.student_id = ?
ORDER BY m.mastery_score ASC;

-- name: AdminGetStudentMasterySummaryTotals
SELECT COUNT(id), AVG(mastery_score)
FROM ah_student_ability_mastery
WHERE student_id = ?;

-- name: AdminGetStudentMasterySummaryLevels
SELECT mastery_level, COUNT(id)
FROM ah_student_ability_mastery
WHERE student_id = ?
GROUP BY mastery_level;
