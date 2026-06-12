package db

const QueryManagerByToken = `
SELECT id, username, type, status, create_time, update_time
FROM ah_manager
WHERE token = ?
LIMIT 1`

const QueryStudentByToken = `
SELECT id, name, phone, grade, semester, subject, status, create_time, update_time
FROM ah_student
WHERE token = ?
LIMIT 1`
