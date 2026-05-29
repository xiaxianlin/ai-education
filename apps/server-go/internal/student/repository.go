package student

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

var (
	ErrStudentNotFound       = errors.New("student not found")
	ErrRepositoryUnavailable = errors.New("student repository is not configured")
)

type Repository interface {
	GetProfile(ctx context.Context, studentID string) (*Profile, error)
	UpdateSettings(ctx context.Context, studentID string, settings UpdateSettings) error
}

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

type SQLRepository struct {
	store QueryExecer
}

func NewSQLRepository(store QueryExecer) *SQLRepository {
	return &SQLRepository{store: store}
}

const studentProfileColumns = "name, phone, grade, semester, subject"

func (r *SQLRepository) GetProfile(ctx context.Context, studentID string) (*Profile, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}

	profile, err := scanProfile(r.store.QueryRowContext(
		ctx,
		"SELECT "+studentProfileColumns+" FROM ah_student WHERE id = ? LIMIT 1",
		studentID,
	))
	if err != nil {
		return nil, err
	}

	textbooks, err := r.listTextbooks(ctx, studentID)
	if err != nil {
		return nil, err
	}
	profile.Textbooks = textbooks
	return profile, nil
}

func (r *SQLRepository) UpdateSettings(ctx context.Context, studentID string, settings UpdateSettings) error {
	if err := r.ensureStore(); err != nil {
		return err
	}

	result, err := r.store.ExecContext(
		ctx,
		`UPDATE ah_student
SET grade = ?, semester = ?, subject = ?, update_time = ?
WHERE id = ?`,
		settings.Grade,
		settings.Semester,
		settings.Subject,
		time.Now().Unix(),
		studentID,
	)
	if err != nil {
		return fmt.Errorf("update student settings: %w", err)
	}
	if affectedRows(result) == 0 {
		return ErrStudentNotFound
	}
	return nil
}

func (r *SQLRepository) GetAdminStudent(ctx context.Context, studentID string) (*AdminStudent, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	return scanAdminStudent(r.store.QueryRowContext(
		ctx,
		`SELECT id, name, phone, grade, semester, subject, status, create_time, update_time
FROM ah_student
WHERE id = ?
LIMIT 1`,
		studentID,
	))
}

func (r *SQLRepository) SearchStudents(ctx context.Context, req SearchStudentsRequest) (SearchStudentsResult, error) {
	if err := r.ensureStore(); err != nil {
		return SearchStudentsResult{}, err
	}

	where, args := buildStudentSearchWhere(req)
	var total int
	if err := r.store.QueryRowContext(ctx, "SELECT COUNT(id) FROM ah_student "+where, args...).Scan(&total); err != nil {
		return SearchStudentsResult{}, fmt.Errorf("count students: %w", err)
	}

	offset := (req.Page - 1) * req.Size
	query := `SELECT id, name, phone, grade, semester, subject, status, create_time, update_time
FROM ah_student ` + where + `
ORDER BY create_time DESC
LIMIT ? OFFSET ?`
	args = append(args, req.Size, offset)
	rows, err := r.store.QueryContext(ctx, query, args...)
	if err != nil {
		return SearchStudentsResult{}, fmt.Errorf("search students: %w", err)
	}
	defer rows.Close()

	items := make([]AdminStudent, 0)
	for rows.Next() {
		item, err := scanAdminStudent(rows)
		if err != nil {
			return SearchStudentsResult{}, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return SearchStudentsResult{}, fmt.Errorf("iterate students: %w", err)
	}
	return SearchStudentsResult{Total: total, Data: items}, nil
}

func (r *SQLRepository) PhoneExists(ctx context.Context, phone string, excludeStudentID string) (bool, error) {
	if err := r.ensureStore(); err != nil {
		return false, err
	}
	query := "SELECT id FROM ah_student WHERE phone = ?"
	args := []any{phone}
	if excludeStudentID != "" {
		query += " AND id != ?"
		args = append(args, excludeStudentID)
	}
	query += " LIMIT 1"
	var id string
	err := r.store.QueryRowContext(ctx, query, args...).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check student phone: %w", err)
	}
	return true, nil
}

func (r *SQLRepository) CreateStudent(ctx context.Context, record CreateStudentRecord) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	_, err := r.store.ExecContext(ctx,
		`INSERT INTO ah_student (id, name, phone, password, grade, status, create_time, update_time)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		record.ID, record.Name, record.Phone, record.PasswordHash, record.Grade, record.Status, record.CreateTime, record.UpdateTime,
	)
	if err != nil {
		return fmt.Errorf("create student: %w", err)
	}
	return nil
}

func (r *SQLRepository) UpdateStudent(ctx context.Context, studentID string, record UpdateStudentRecord) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx,
		`UPDATE ah_student
SET name = ?, phone = ?, grade = ?, status = ?, update_time = ?
WHERE id = ?`,
		record.Name, record.Phone, record.Grade, record.Status, record.UpdateTime, studentID,
	)
	if err != nil {
		return fmt.Errorf("update student: %w", err)
	}
	if affectedRows(result) == 0 {
		return ErrStudentNotFound
	}
	return nil
}

func (r *SQLRepository) DeleteStudent(ctx context.Context, studentID string) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx, "DELETE FROM ah_student WHERE id = ?", studentID)
	if err != nil {
		return fmt.Errorf("delete student: %w", err)
	}
	if affectedRows(result) == 0 {
		return ErrStudentNotFound
	}
	return nil
}

func (r *SQLRepository) ResetStudentPassword(ctx context.Context, studentID string, passwordHash string, updateTime int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	result, err := r.store.ExecContext(ctx,
		"UPDATE ah_student SET password = ?, update_time = ? WHERE id = ?",
		passwordHash, updateTime, studentID,
	)
	if err != nil {
		return fmt.Errorf("reset student password: %w", err)
	}
	if affectedRows(result) == 0 {
		return ErrStudentNotFound
	}
	return nil
}

func (r *SQLRepository) ListUnusedTextbooks(ctx context.Context, studentID string) ([]Textbook, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	if _, err := r.GetAdminStudent(ctx, studentID); err != nil {
		return nil, err
	}
	rows, err := r.store.QueryContext(ctx,
		`SELECT t.id, t.subject, t.version, t.grade, t.semester, t.file, t.index_file_id, t.is_parsed
FROM ah_textbook t
WHERE NOT EXISTS (
	SELECT 1 FROM ah_student_textbook_config c
	WHERE c.student_id = ? AND c.textbook_id = t.id
)
ORDER BY t.id`,
		studentID,
	)
	if err != nil {
		return nil, fmt.Errorf("list unused textbooks: %w", err)
	}
	defer rows.Close()

	items := make([]Textbook, 0)
	for rows.Next() {
		item, err := scanTextbook(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate unused textbooks: %w", err)
	}
	return items, nil
}

func (r *SQLRepository) CreateStudentTextbookConfig(ctx context.Context, studentID string, textbookID int64, now int64) (*StudentTextbookConfig, error) {
	if err := r.validateTextbookConfigInput(ctx, studentID, textbookID, 0); err != nil {
		return nil, err
	}
	result, err := r.store.ExecContext(ctx,
		`INSERT INTO ah_student_textbook_config (student_id, textbook_id, create_time, update_time)
VALUES (?, ?, ?, ?)`,
		studentID, textbookID, now, now,
	)
	if err != nil {
		return nil, fmt.Errorf("create student textbook config: %w", err)
	}
	id, _ := result.LastInsertId()
	return r.getStudentTextbookConfig(ctx, studentID, id)
}

func (r *SQLRepository) UpdateStudentTextbookConfig(ctx context.Context, studentID string, configID int64, textbookID int64, now int64) (*StudentTextbookConfig, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	if exists, err := r.studentTextbookConfigExists(ctx, studentID, configID); err != nil {
		return nil, err
	} else if !exists {
		return nil, ErrTextbookConfigNotFound
	}
	if err := r.validateTextbookConfigInput(ctx, studentID, textbookID, configID); err != nil {
		return nil, err
	}
	result, err := r.store.ExecContext(ctx,
		`UPDATE ah_student_textbook_config
SET textbook_id = ?, update_time = ?
WHERE id = ? AND student_id = ?`,
		textbookID, now, configID, studentID,
	)
	if err != nil {
		return nil, fmt.Errorf("update student textbook config: %w", err)
	}
	if affectedRows(result) == 0 {
		return nil, ErrTextbookConfigNotFound
	}
	return r.getStudentTextbookConfig(ctx, studentID, configID)
}

func (r *SQLRepository) DeleteStudentTextbookConfig(ctx context.Context, studentID string, configID int64) (bool, error) {
	if err := r.ensureStore(); err != nil {
		return false, err
	}
	result, err := r.store.ExecContext(ctx,
		"DELETE FROM ah_student_textbook_config WHERE id = ? AND student_id = ?",
		configID, studentID,
	)
	if err != nil {
		return false, fmt.Errorf("delete student textbook config: %w", err)
	}
	return affectedRows(result) > 0, nil
}

func (r *SQLRepository) ListStudentTextbookConfigs(ctx context.Context, studentID string, req ListStudentTextbookConfigsRequest) (ListStudentTextbookConfigsResult, error) {
	if err := r.ensureStore(); err != nil {
		return ListStudentTextbookConfigsResult{}, err
	}
	where, args := buildStudentTextbookConfigWhere(studentID, req)
	var total int
	if err := r.store.QueryRowContext(ctx,
		`SELECT COUNT(c.id)
FROM ah_student_textbook_config c
LEFT JOIN ah_textbook t ON c.textbook_id = t.id `+where,
		args...,
	).Scan(&total); err != nil {
		return ListStudentTextbookConfigsResult{}, fmt.Errorf("count student textbook configs: %w", err)
	}

	offset := (req.Page - 1) * req.Size
	query := `SELECT c.id, c.student_id, c.textbook_id, c.create_time, c.update_time,
t.id, t.subject, t.version, t.grade, t.semester, t.file, t.index_file_id, t.is_parsed
FROM ah_student_textbook_config c
LEFT JOIN ah_textbook t ON c.textbook_id = t.id ` + where + `
ORDER BY c.id DESC
LIMIT ? OFFSET ?`
	args = append(args, req.Size, offset)
	rows, err := r.store.QueryContext(ctx, query, args...)
	if err != nil {
		return ListStudentTextbookConfigsResult{}, fmt.Errorf("list student textbook configs: %w", err)
	}
	defer rows.Close()

	items := make([]StudentTextbookConfig, 0)
	for rows.Next() {
		item, err := scanStudentTextbookConfig(rows)
		if err != nil {
			return ListStudentTextbookConfigsResult{}, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return ListStudentTextbookConfigsResult{}, fmt.Errorf("iterate student textbook configs: %w", err)
	}
	return ListStudentTextbookConfigsResult{Items: items, Total: total, Page: req.Page, PageSize: req.Size}, nil
}

func (r *SQLRepository) SetStudentTextbookConfigs(ctx context.Context, studentID string, textbookIDs []int64, now int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	if _, err := r.GetAdminStudent(ctx, studentID); err != nil {
		return err
	}
	for _, textbookID := range textbookIDs {
		exists, err := r.textbookExists(ctx, textbookID)
		if err != nil {
			return err
		}
		if !exists {
			return ErrTextbookNotFound
		}
	}
	if _, err := r.store.ExecContext(ctx, "DELETE FROM ah_student_textbook_config WHERE student_id = ?", studentID); err != nil {
		return fmt.Errorf("clear student textbook configs: %w", err)
	}
	for _, textbookID := range textbookIDs {
		if _, err := r.store.ExecContext(ctx,
			`INSERT INTO ah_student_textbook_config (student_id, textbook_id, create_time, update_time)
VALUES (?, ?, ?, ?)`,
			studentID, textbookID, now, now,
		); err != nil {
			return fmt.Errorf("insert student textbook config: %w", err)
		}
	}
	return nil
}

func (r *SQLRepository) ListStudentMastery(ctx context.Context, studentID string, subject string) ([]StudentMastery, error) {
	if err := r.ensureStore(); err != nil {
		return nil, err
	}
	query := `SELECT m.id, m.student_id, m.ability_code, m.mastery_score, m.mastery_level,
m.correct_count, m.wrong_count, m.last_practice_time, m.create_time, m.update_time,
a.name, a.subject, a.grade
FROM ah_student_ability_mastery m
LEFT JOIN ah_ability a ON m.ability_code = a.code
WHERE m.student_id = ?`
	args := []any{studentID}
	if subject != "" {
		query += " AND a.subject = ?"
		args = append(args, subject)
	}
	query += " ORDER BY m.mastery_score ASC"

	rows, err := r.store.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list student mastery: %w", err)
	}
	defer rows.Close()

	items := make([]StudentMastery, 0)
	for rows.Next() {
		item, err := scanStudentMastery(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate student mastery: %w", err)
	}
	return items, nil
}

func (r *SQLRepository) GetStudentMasterySummary(ctx context.Context, studentID string) (StudentMasterySummary, error) {
	if err := r.ensureStore(); err != nil {
		return StudentMasterySummary{}, err
	}
	var total int
	var avg sql.NullFloat64
	if err := r.store.QueryRowContext(ctx,
		"SELECT COUNT(id), AVG(mastery_score) FROM ah_student_ability_mastery WHERE student_id = ?",
		studentID,
	).Scan(&total, &avg); err != nil {
		return StudentMasterySummary{}, fmt.Errorf("get student mastery summary totals: %w", err)
	}
	rows, err := r.store.QueryContext(ctx,
		"SELECT mastery_level, COUNT(id) FROM ah_student_ability_mastery WHERE student_id = ? GROUP BY mastery_level",
		studentID,
	)
	if err != nil {
		return StudentMasterySummary{}, fmt.Errorf("get student mastery summary levels: %w", err)
	}
	defer rows.Close()

	distribution := make(map[string]int)
	for rows.Next() {
		var level string
		var count int
		if err := rows.Scan(&level, &count); err != nil {
			return StudentMasterySummary{}, fmt.Errorf("scan student mastery summary level: %w", err)
		}
		distribution[level] = count
	}
	if err := rows.Err(); err != nil {
		return StudentMasterySummary{}, fmt.Errorf("iterate student mastery summary levels: %w", err)
	}
	avgScore := 0.0
	if avg.Valid {
		avgScore = round2(avg.Float64)
	}
	return StudentMasterySummary{TotalAbilities: total, AvgMasteryScore: avgScore, LevelDistribution: distribution}, nil
}

func (r *SQLRepository) listTextbooks(ctx context.Context, studentID string) ([]Textbook, error) {
	rows, err := r.store.QueryContext(
		ctx,
		`SELECT t.id, t.subject, t.version, t.grade, t.semester, t.file, t.index_file_id, t.is_parsed
FROM ah_textbook t
INNER JOIN ah_student_textbook_config c ON c.textbook_id = t.id
WHERE c.student_id = ?
ORDER BY t.id`,
		studentID,
	)
	if err != nil {
		return nil, fmt.Errorf("list student textbooks: %w", err)
	}
	defer rows.Close()

	items := make([]Textbook, 0)
	for rows.Next() {
		item, err := scanTextbook(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate student textbooks: %w", err)
	}
	return items, nil
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

func scanProfile(scanner scanner) (*Profile, error) {
	var profile Profile
	var grade sql.NullInt64
	var semester sql.NullString
	var subject sql.NullString
	if err := scanner.Scan(
		&profile.Name,
		&profile.Phone,
		&grade,
		&semester,
		&subject,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrStudentNotFound
		}
		return nil, fmt.Errorf("scan student profile: %w", err)
	}
	profile.Grade = intPointer(grade)
	profile.Semester = stringPointer(semester)
	profile.Subject = stringPointer(subject)
	profile.Textbooks = []Textbook{}
	return &profile, nil
}

func scanTextbook(scanner scanner) (*Textbook, error) {
	var item Textbook
	var file sql.NullString
	var indexFileID sql.NullString
	if err := scanner.Scan(
		&item.ID,
		&item.Subject,
		&item.Version,
		&item.Grade,
		&item.Semester,
		&file,
		&indexFileID,
		&item.IsParsed,
	); err != nil {
		return nil, fmt.Errorf("scan student textbook: %w", err)
	}
	item.File = stringPointer(file)
	item.IndexFileID = stringPointer(indexFileID)
	return &item, nil
}

func scanAdminStudent(scanner scanner) (*AdminStudent, error) {
	var item AdminStudent
	var grade sql.NullInt64
	var semester sql.NullString
	var subject sql.NullString
	if err := scanner.Scan(
		&item.ID,
		&item.Name,
		&item.Phone,
		&grade,
		&semester,
		&subject,
		&item.Status,
		&item.CreateTime,
		&item.UpdateTime,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrStudentNotFound
		}
		return nil, fmt.Errorf("scan admin student: %w", err)
	}
	if grade.Valid {
		item.Grade = int(grade.Int64)
	}
	item.Semester = stringPointer(semester)
	item.Subject = stringPointer(subject)
	return &item, nil
}

func scanStudentTextbookConfig(scanner scanner) (*StudentTextbookConfig, error) {
	var item StudentTextbookConfig
	var textbookID sql.NullInt64
	var subject sql.NullString
	var version sql.NullString
	var grade sql.NullInt64
	var semester sql.NullString
	var file sql.NullString
	var indexFileID sql.NullString
	var isParsed sql.NullInt64
	if err := scanner.Scan(
		&item.ID,
		&item.StudentID,
		&item.TextbookID,
		&item.CreateTime,
		&item.UpdateTime,
		&textbookID,
		&subject,
		&version,
		&grade,
		&semester,
		&file,
		&indexFileID,
		&isParsed,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrTextbookConfigNotFound
		}
		return nil, fmt.Errorf("scan student textbook config: %w", err)
	}
	if textbookID.Valid {
		textbook := Textbook{
			ID:          textbookID.Int64,
			Subject:     subject.String,
			Version:     version.String,
			Grade:       int(grade.Int64),
			Semester:    semester.String,
			File:        stringPointer(file),
			IndexFileID: stringPointer(indexFileID),
			IsParsed:    int(isParsed.Int64),
		}
		item.Textbook = &textbook
	}
	return &item, nil
}

func scanStudentMastery(scanner scanner) (*StudentMastery, error) {
	var item StudentMastery
	var lastPracticeTime sql.NullInt64
	var abilityName sql.NullString
	var subject sql.NullString
	var grade sql.NullInt64
	if err := scanner.Scan(
		&item.ID,
		&item.StudentID,
		&item.AbilityCode,
		&item.MasteryScore,
		&item.MasteryLevel,
		&item.CorrectCount,
		&item.WrongCount,
		&lastPracticeTime,
		&item.CreateTime,
		&item.UpdateTime,
		&abilityName,
		&subject,
		&grade,
	); err != nil {
		return nil, fmt.Errorf("scan student mastery: %w", err)
	}
	item.LastPracticeTime = int64Pointer(lastPracticeTime)
	item.AbilityName = stringPointer(abilityName)
	item.Subject = stringPointer(subject)
	item.Grade = intPointer(grade)
	return &item, nil
}

func buildStudentSearchWhere(req SearchStudentsRequest) (string, []any) {
	conditions := make([]string, 0, 4)
	args := make([]any, 0, 4)
	if req.Name != "" {
		conditions = append(conditions, "name LIKE ?")
		args = append(args, "%"+req.Name+"%")
	}
	if req.Phone != "" {
		conditions = append(conditions, "phone = ?")
		args = append(args, req.Phone)
	}
	if req.Keywords != "" {
		conditions = append(conditions, "(name LIKE ? OR phone LIKE ?)")
		keyword := "%" + req.Keywords + "%"
		args = append(args, keyword, keyword)
	}
	if req.Status != nil {
		conditions = append(conditions, "status = ?")
		args = append(args, *req.Status)
	}
	if len(conditions) == 0 {
		return "", args
	}
	where := "WHERE " + conditions[0]
	for _, condition := range conditions[1:] {
		where += " AND " + condition
	}
	return where, args
}

func buildStudentTextbookConfigWhere(studentID string, req ListStudentTextbookConfigsRequest) (string, []any) {
	where := "WHERE c.student_id = ?"
	args := []any{studentID}
	if req.Subject != "" {
		where += " AND t.subject = ?"
		args = append(args, req.Subject)
	}
	if req.Grade != nil {
		where += " AND t.grade = ?"
		args = append(args, *req.Grade)
	}
	return where, args
}

func (r *SQLRepository) validateTextbookConfigInput(ctx context.Context, studentID string, textbookID int64, excludeConfigID int64) error {
	if err := r.ensureStore(); err != nil {
		return err
	}
	if _, err := r.GetAdminStudent(ctx, studentID); err != nil {
		return err
	}
	exists, err := r.textbookExists(ctx, textbookID)
	if err != nil {
		return err
	}
	if !exists {
		return ErrTextbookNotFound
	}
	duplicate, err := r.studentTextbookConfigDuplicate(ctx, studentID, textbookID, excludeConfigID)
	if err != nil {
		return err
	}
	if duplicate {
		return ErrTextbookConfigured
	}
	return nil
}

func (r *SQLRepository) textbookExists(ctx context.Context, textbookID int64) (bool, error) {
	var id int64
	err := r.store.QueryRowContext(ctx, "SELECT id FROM ah_textbook WHERE id = ? LIMIT 1", textbookID).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check textbook: %w", err)
	}
	return true, nil
}

func (r *SQLRepository) studentTextbookConfigExists(ctx context.Context, studentID string, configID int64) (bool, error) {
	var id int64
	err := r.store.QueryRowContext(ctx,
		"SELECT id FROM ah_student_textbook_config WHERE id = ? AND student_id = ? LIMIT 1",
		configID, studentID,
	).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check student textbook config: %w", err)
	}
	return true, nil
}

func (r *SQLRepository) studentTextbookConfigDuplicate(ctx context.Context, studentID string, textbookID int64, excludeConfigID int64) (bool, error) {
	query := "SELECT id FROM ah_student_textbook_config WHERE student_id = ? AND textbook_id = ?"
	args := []any{studentID, textbookID}
	if excludeConfigID > 0 {
		query += " AND id != ?"
		args = append(args, excludeConfigID)
	}
	query += " LIMIT 1"
	var id int64
	err := r.store.QueryRowContext(ctx, query, args...).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check duplicate student textbook config: %w", err)
	}
	return true, nil
}

func (r *SQLRepository) getStudentTextbookConfig(ctx context.Context, studentID string, configID int64) (*StudentTextbookConfig, error) {
	return scanStudentTextbookConfig(r.store.QueryRowContext(ctx,
		`SELECT c.id, c.student_id, c.textbook_id, c.create_time, c.update_time,
t.id, t.subject, t.version, t.grade, t.semester, t.file, t.index_file_id, t.is_parsed
FROM ah_student_textbook_config c
LEFT JOIN ah_textbook t ON c.textbook_id = t.id
WHERE c.id = ? AND c.student_id = ?
LIMIT 1`,
		configID, studentID,
	))
}

func affectedRows(result sql.Result) int64 {
	rows, err := result.RowsAffected()
	if err != nil {
		return 0
	}
	return rows
}

func intPointer(value sql.NullInt64) *int {
	if !value.Valid {
		return nil
	}
	v := int(value.Int64)
	return &v
}

func stringPointer(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	return &value.String
}

func int64Pointer(value sql.NullInt64) *int64 {
	if !value.Valid {
		return nil
	}
	return &value.Int64
}
