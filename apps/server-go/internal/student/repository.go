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
