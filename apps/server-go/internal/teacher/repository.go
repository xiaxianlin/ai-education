package teacher

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

type Queryer interface {
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

type Execer interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
}

type QueryExecer interface {
	Queryer
	Execer
}

type Repository interface {
	CreateTeacher(ctx context.Context, teacher Teacher, passwordHash string) error
	UpdateTeacher(ctx context.Context, teacherID string, teacher Teacher, updateTime int64) error
	DeleteTeacher(ctx context.Context, teacherID string) error
	UpdateTeacherPassword(ctx context.Context, teacherID string, passwordHash string, updateTime int64) error
	GetTeacher(ctx context.Context, teacherID string) (*Teacher, error)
	SearchTeachers(ctx context.Context, req SearchTeachersRequest) (SearchTeachersResult, error)
	TeacherExistsByAccountOrPhone(ctx context.Context, account string, phone string, excludeID string) (bool, error)
	GetTeacherDetail(ctx context.Context, teacherID string) (TeacherDetail, error)
	AssignStudentTeacher(ctx context.Context, studentID string, teacherID string, updateTime int64) error
	CreateTeacherClaim(ctx context.Context, studentID string, teacherID string, now int64) (*StudentTeacherClaim, error)
	UpdateTeacherClaim(ctx context.Context, claimID int64, status string, now int64) (*StudentTeacherClaim, error)
	ListTeacherClaims(ctx context.Context, status string) ([]StudentTeacherClaim, error)
	ListStudentTeacherClaims(ctx context.Context, studentID string) ([]StudentTeacherClaim, error)
}

type SQLRepository struct {
	store QueryExecer
}

func NewSQLRepository(store QueryExecer) *SQLRepository {
	return &SQLRepository{store: store}
}

const teacherColumns = "id, account, name, phone, subject, school, status, create_time, update_time"

func (r *SQLRepository) CreateTeacher(ctx context.Context, teacher Teacher, passwordHash string) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	_, err := r.store.ExecContext(ctx,
		`INSERT INTO ah_teacher (id, account, password, name, phone, subject, school, status, create_time, update_time)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		teacher.ID, teacher.Account, passwordHash, teacher.Name, teacher.Phone, teacher.Subject, teacher.School,
		teacher.Status, teacher.CreateTime, teacher.UpdateTime,
	)
	if err != nil {
		return wrapDuplicateError("create teacher", err)
	}
	return nil
}

func (r *SQLRepository) UpdateTeacher(ctx context.Context, teacherID string, teacher Teacher, updateTime int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx,
		`UPDATE ah_teacher
SET account = ?, name = ?, phone = ?, subject = ?, school = ?, status = ?, update_time = ?
WHERE id = ?`,
		teacher.Account, teacher.Name, teacher.Phone, teacher.Subject, teacher.School, teacher.Status, updateTime, teacherID,
	)
	if err != nil {
		return wrapDuplicateError("update teacher", err)
	}
	return requireAffectedRow(result, ErrTeacherNotFound)
}

func (r *SQLRepository) DeleteTeacher(ctx context.Context, teacherID string) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	if _, err := r.store.ExecContext(ctx, "UPDATE ah_student SET teacher_id = NULL WHERE teacher_id = ?", teacherID); err != nil {
		return fmt.Errorf("clear teacher students: %w", err)
	}
	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_teacher WHERE id = ?", teacherID)
	if err != nil {
		return fmt.Errorf("delete teacher: %w", err)
	}
	return requireAffectedRow(result, ErrTeacherNotFound)
}

func (r *SQLRepository) UpdateTeacherPassword(ctx context.Context, teacherID string, passwordHash string, updateTime int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx, "UPDATE ah_teacher SET password = ?, update_time = ? WHERE id = ?", passwordHash, updateTime, teacherID)
	if err != nil {
		return fmt.Errorf("update teacher password: %w", err)
	}
	return requireAffectedRow(result, ErrTeacherNotFound)
}

func (r *SQLRepository) GetTeacher(ctx context.Context, teacherID string) (*Teacher, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	return scanTeacherRow(r.store.QueryRowContext(ctx, "SELECT "+teacherColumns+" FROM ah_teacher WHERE id = ? LIMIT 1", teacherID))
}

func (r *SQLRepository) SearchTeachers(ctx context.Context, req SearchTeachersRequest) (SearchTeachersResult, error) {
	if err := r.ensureStore(); err != nil {
		return SearchTeachersResult{}, err
	}
	where, args := buildTeacherSearchWhere(req)
	var total int
	if err := r.store.QueryRowContext(ctx, "SELECT COUNT(id) FROM ah_teacher "+where, args...).Scan(&total); err != nil {
		return SearchTeachersResult{}, fmt.Errorf("count teachers: %w", err)
	}

	offset := (req.Page - 1) * req.Size
	query := "SELECT " + teacherColumns + " FROM ah_teacher " + where + " ORDER BY create_time DESC LIMIT ? OFFSET ?"
	args = append(args, req.Size, offset)
	rows, err := r.store.QueryContext(ctx, query, args...)
	if err != nil {
		return SearchTeachersResult{}, fmt.Errorf("search teachers: %w", err)
	}
	defer rows.Close()
	items := make([]Teacher, 0)
	for rows.Next() {
		item, err := scanTeacher(rows)
		if err != nil {
			return SearchTeachersResult{}, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return SearchTeachersResult{}, fmt.Errorf("iterate teachers: %w", err)
	}
	return SearchTeachersResult{Total: total, Data: items}, nil
}

func (r *SQLRepository) TeacherExistsByAccountOrPhone(ctx context.Context, account string, phone string, excludeID string) (bool, error) {
	if err := r.ensureStore(); err != nil {
		return false, err
	}
	query := "SELECT id FROM ah_teacher WHERE (account = ? OR phone = ?)"
	args := []any{account, phone}
	if excludeID != "" {
		query += " AND id != ?"
		args = append(args, excludeID)
	}
	query += " LIMIT 1"
	var id string
	err := r.store.QueryRowContext(ctx, query, args...).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check teacher duplicate: %w", err)
	}
	return true, nil
}

func (r *SQLRepository) GetTeacherDetail(ctx context.Context, teacherID string) (TeacherDetail, error) {
	teacher, err := r.GetTeacher(ctx, teacherID)
	if err != nil {
		return TeacherDetail{}, err
	}
	stats, err := r.getTeacherStats(ctx, teacherID)
	if err != nil {
		return TeacherDetail{}, err
	}
	students, err := r.listTeacherStudents(ctx, teacherID)
	if err != nil {
		return TeacherDetail{}, err
	}
	textbooks, err := r.listTeacherTextbooks(ctx, teacherID)
	if err != nil {
		return TeacherDetail{}, err
	}
	abilities, err := r.listTeacherAbilities(ctx, teacherID)
	if err != nil {
		return TeacherDetail{}, err
	}
	questions, err := r.listTeacherQuestions(ctx, teacherID)
	if err != nil {
		return TeacherDetail{}, err
	}
	return TeacherDetail{
		Teacher:   *teacher,
		Stats:     stats,
		Students:  students,
		Textbooks: textbooks,
		Abilities: abilities,
		Questions: questions,
	}, nil
}

func (r *SQLRepository) AssignStudentTeacher(ctx context.Context, studentID string, teacherID string, updateTime int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	if _, err := r.GetTeacher(ctx, teacherID); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx, "UPDATE ah_student SET teacher_id = ?, update_time = ? WHERE id = ?", teacherID, updateTime, studentID)
	if err != nil {
		return fmt.Errorf("assign student teacher: %w", err)
	}
	return requireAffectedRow(result, ErrStudentNotFound)
}

func (r *SQLRepository) CreateTeacherClaim(ctx context.Context, studentID string, teacherID string, now int64) (*StudentTeacherClaim, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	if _, err := r.GetTeacher(ctx, teacherID); err != nil {
		return nil, err
	}
	if exists, err := r.studentExists(ctx, studentID); err != nil {
		return nil, err
	} else if !exists {
		return nil, ErrStudentNotFound
	}
	result, err := r.store.ExecContext(ctx,
		`INSERT INTO ah_student_teacher_claim (student_id, teacher_id, status, create_time, update_time)
VALUES (?, ?, 'pending', ?, ?)`,
		studentID, teacherID, now, now,
	)
	if err != nil {
		return nil, fmt.Errorf("create teacher claim: %w", err)
	}
	id, _ := result.LastInsertId()
	return r.getTeacherClaim(ctx, id)
}

func (r *SQLRepository) UpdateTeacherClaim(ctx context.Context, claimID int64, status string, now int64) (*StudentTeacherClaim, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	result, err := r.store.ExecContext(ctx, "UPDATE ah_student_teacher_claim SET status = ?, update_time = ? WHERE id = ?", status, now, claimID)
	if err != nil {
		return nil, fmt.Errorf("update teacher claim: %w", err)
	}
	if err := requireAffectedRow(result, ErrClaimNotFound); err != nil {
		return nil, err
	}
	claim, err := r.getTeacherClaim(ctx, claimID)
	if err != nil {
		return nil, err
	}
	if status == "approved" {
		if err := r.AssignStudentTeacher(ctx, claim.StudentID, claim.TeacherID, now); err != nil {
			return nil, err
		}
		return r.getTeacherClaim(ctx, claimID)
	}
	return claim, nil
}

func (r *SQLRepository) ListTeacherClaims(ctx context.Context, status string) ([]StudentTeacherClaim, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	query := teacherClaimQuery
	args := make([]any, 0, 1)
	if status != "" {
		query += " WHERE c.status = ?"
		args = append(args, status)
	}
	query += " ORDER BY c.create_time DESC"
	return r.queryTeacherClaims(ctx, query, args...)
}

func (r *SQLRepository) ListStudentTeacherClaims(ctx context.Context, studentID string) ([]StudentTeacherClaim, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	return r.queryTeacherClaims(ctx, teacherClaimQuery+" WHERE c.student_id = ? ORDER BY c.create_time DESC", studentID)
}

func (r *SQLRepository) getTeacherStats(ctx context.Context, teacherID string) (TeacherStats, error) {
	var stats TeacherStats
	queries := []struct {
		dest  *int
		query string
	}{
		{&stats.StudentCount, "SELECT COUNT(id) FROM ah_student WHERE teacher_id = ?"},
		{&stats.TextbookCount, "SELECT COUNT(id) FROM ah_textbook WHERE teacher_id = ?"},
		{&stats.AbilityCount, "SELECT COUNT(id) FROM ah_ability WHERE teacher_id = ?"},
		{&stats.QuestionCount, "SELECT COUNT(id) FROM ah_question WHERE teacher_id = ?"},
	}
	for _, item := range queries {
		if err := r.store.QueryRowContext(ctx, item.query, teacherID).Scan(item.dest); err != nil {
			return TeacherStats{}, fmt.Errorf("get teacher stats: %w", err)
		}
	}
	return stats, nil
}

func (r *SQLRepository) listTeacherStudents(ctx context.Context, teacherID string) ([]TeacherStudent, error) {
	rows, err := r.store.QueryContext(ctx,
		"SELECT id, name, phone, COALESCE(grade, 0), COALESCE(subject, ''), COALESCE(semester, ''), status FROM ah_student WHERE teacher_id = ? ORDER BY create_time DESC LIMIT 50",
		teacherID,
	)
	if err != nil {
		return nil, fmt.Errorf("list teacher students: %w", err)
	}
	defer rows.Close()
	items := make([]TeacherStudent, 0)
	for rows.Next() {
		var item TeacherStudent
		if err := rows.Scan(&item.ID, &item.Name, &item.Phone, &item.Grade, &item.Subject, &item.Semester, &item.Status); err != nil {
			return nil, fmt.Errorf("scan teacher student: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *SQLRepository) listTeacherTextbooks(ctx context.Context, teacherID string) ([]TeacherTextbook, error) {
	rows, err := r.store.QueryContext(ctx,
		"SELECT id, subject, version, grade, semester FROM ah_textbook WHERE teacher_id = ? ORDER BY id DESC LIMIT 50",
		teacherID,
	)
	if err != nil {
		return nil, fmt.Errorf("list teacher textbooks: %w", err)
	}
	defer rows.Close()
	items := make([]TeacherTextbook, 0)
	for rows.Next() {
		var item TeacherTextbook
		if err := rows.Scan(&item.ID, &item.Subject, &item.Version, &item.Grade, &item.Semester); err != nil {
			return nil, fmt.Errorf("scan teacher textbook: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *SQLRepository) listTeacherAbilities(ctx context.Context, teacherID string) ([]TeacherAbility, error) {
	rows, err := r.store.QueryContext(ctx,
		"SELECT id, subject, grade, code, name, difficulty FROM ah_ability WHERE teacher_id = ? ORDER BY id DESC LIMIT 50",
		teacherID,
	)
	if err != nil {
		return nil, fmt.Errorf("list teacher abilities: %w", err)
	}
	defer rows.Close()
	items := make([]TeacherAbility, 0)
	for rows.Next() {
		var item TeacherAbility
		if err := rows.Scan(&item.ID, &item.Subject, &item.Grade, &item.Code, &item.Name, &item.Difficulty); err != nil {
			return nil, fmt.Errorf("scan teacher ability: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *SQLRepository) listTeacherQuestions(ctx context.Context, teacherID string) ([]TeacherQuestion, error) {
	rows, err := r.store.QueryContext(ctx,
		"SELECT id, question_type_code, subject, grade, COALESCE(difficulty, ''), create_time FROM ah_question WHERE teacher_id = ? ORDER BY create_time DESC LIMIT 50",
		teacherID,
	)
	if err != nil {
		return nil, fmt.Errorf("list teacher questions: %w", err)
	}
	defer rows.Close()
	items := make([]TeacherQuestion, 0)
	for rows.Next() {
		var item TeacherQuestion
		if err := rows.Scan(&item.ID, &item.QuestionTypeCode, &item.Subject, &item.Grade, &item.Difficulty, &item.CreateTime); err != nil {
			return nil, fmt.Errorf("scan teacher question: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *SQLRepository) studentExists(ctx context.Context, studentID string) (bool, error) {
	var id string
	err := r.store.QueryRowContext(ctx, "SELECT id FROM ah_student WHERE id = ? LIMIT 1", studentID).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check student: %w", err)
	}
	return true, nil
}

const teacherClaimQuery = `
SELECT c.id, c.student_id, c.teacher_id, c.status, c.create_time, c.update_time,
t.id, t.account, t.name, t.phone, t.subject, t.school, t.status, t.create_time, t.update_time,
s.id, s.name, s.phone, COALESCE(s.grade, 0), s.status
FROM ah_student_teacher_claim c
LEFT JOIN ah_teacher t ON c.teacher_id = t.id
LEFT JOIN ah_student s ON c.student_id = s.id`

func (r *SQLRepository) getTeacherClaim(ctx context.Context, claimID int64) (*StudentTeacherClaim, error) {
	items, err := r.queryTeacherClaims(ctx, teacherClaimQuery+" WHERE c.id = ? LIMIT 1", claimID)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, ErrClaimNotFound
	}
	return &items[0], nil
}

func (r *SQLRepository) queryTeacherClaims(ctx context.Context, query string, args ...any) ([]StudentTeacherClaim, error) {
	rows, err := r.store.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query teacher claims: %w", err)
	}
	defer rows.Close()
	items := make([]StudentTeacherClaim, 0)
	for rows.Next() {
		item, err := scanTeacherClaim(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate teacher claims: %w", err)
	}
	return items, nil
}

func scanTeacherClaim(scanner scanner) (*StudentTeacherClaim, error) {
	var item StudentTeacherClaim
	var teacher Teacher
	var student TeacherStudent
	var teacherID sql.NullString
	var teacherUpdate sql.NullInt64
	var studentID sql.NullString
	if err := scanner.Scan(
		&item.ID,
		&item.StudentID,
		&item.TeacherID,
		&item.Status,
		&item.CreateTime,
		&item.UpdateTime,
		&teacherID,
		&teacher.Account,
		&teacher.Name,
		&teacher.Phone,
		&teacher.Subject,
		&teacher.School,
		&teacher.Status,
		&teacher.CreateTime,
		&teacherUpdate,
		&studentID,
		&student.Name,
		&student.Phone,
		&student.Grade,
		&student.Status,
	); err != nil {
		return nil, fmt.Errorf("scan teacher claim: %w", err)
	}
	if teacherID.Valid {
		teacher.ID = teacherID.String
		if teacherUpdate.Valid {
			teacher.UpdateTime = teacherUpdate.Int64
		}
		item.Teacher = &teacher
	}
	if studentID.Valid {
		student.ID = studentID.String
		item.Student = &student
	}
	return &item, nil
}

func scanTeacherRow(row scanner) (*Teacher, error) {
	item, err := scanTeacher(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrTeacherNotFound
	}
	return item, err
}

func scanTeacher(scanner scanner) (*Teacher, error) {
	var item Teacher
	var updateTime sql.NullInt64
	if err := scanner.Scan(
		&item.ID,
		&item.Account,
		&item.Name,
		&item.Phone,
		&item.Subject,
		&item.School,
		&item.Status,
		&item.CreateTime,
		&updateTime,
	); err != nil {
		return nil, err
	}
	if updateTime.Valid {
		item.UpdateTime = updateTime.Int64
	}
	return &item, nil
}

func buildTeacherSearchWhere(req SearchTeachersRequest) (string, []any) {
	conditions := make([]string, 0, 3)
	args := make([]any, 0, 3)
	if req.Keywords != "" {
		conditions = append(conditions, "(account LIKE ? OR name LIKE ? OR phone LIKE ? OR school LIKE ?)")
		keyword := "%" + req.Keywords + "%"
		args = append(args, keyword, keyword, keyword, keyword)
	}
	if req.Subject != "" {
		conditions = append(conditions, "subject = ?")
		args = append(args, req.Subject)
	}
	if req.Status != nil {
		conditions = append(conditions, "status = ?")
		args = append(args, *req.Status)
	}
	if len(conditions) == 0 {
		return "", args
	}
	return "WHERE " + strings.Join(conditions, " AND "), args
}

func (r *SQLRepository) ensureStore() error {
	if r == nil || r.store == nil {
		return ErrRepositoryUnavailable
	}
	return nil
}

type scanner interface {
	Scan(dest ...any) error
}

func requireAffectedRow(result sql.Result, notFound error) error {
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("read affected rows: %w", err)
	}
	if rows == 0 {
		return notFound
	}
	return nil
}

func wrapDuplicateError(operation string, err error) error {
	if err == nil {
		return nil
	}
	message := strings.ToLower(err.Error())
	if strings.Contains(message, "1062") || strings.Contains(message, "duplicate") || strings.Contains(message, "unique constraint") {
		return ErrDuplicateTeacher
	}
	return fmt.Errorf("%s: %w", operation, err)
}
