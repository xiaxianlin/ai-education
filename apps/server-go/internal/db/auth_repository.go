package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

var (
	ErrEmptyToken = errors.New("token is required")
	ErrNotFound   = errors.New("record not found")
)

const queryManagerByUsername = `
SELECT id, username, password, token, type, status, create_time, update_time
FROM ah_manager
WHERE username = ?
LIMIT 1`

const updateManagerLoginToken = `
UPDATE ah_manager
SET token = ?, update_time = ?
WHERE id = ?`

const queryStudentByPhone = `
SELECT id, name, phone, password, token, grade, semester, subject, status, create_time, update_time
FROM ah_student
WHERE phone = ?
LIMIT 1`

const updateStudentLoginToken = `
UPDATE ah_student
SET token = ?, update_time = ?
WHERE id = ?`

type ManagerAuthRecord struct {
	ID         string
	Username   string
	Password   string
	Token      *string
	Type       int
	Status     int
	CreateTime int64
	UpdateTime *int64
}

type StudentAuthRecord struct {
	ID         string
	Name       string
	Phone      string
	Password   string
	Token      *string
	Grade      *int
	Semester   *string
	Subject    *string
	Status     int
	CreateTime int64
	UpdateTime *int64
}

type ManagerTokenLookup interface {
	FindManagerByToken(ctx context.Context, token string) (*ManagerTokenRecord, error)
}

type StudentTokenLookup interface {
	FindStudentByToken(ctx context.Context, token string) (*StudentTokenRecord, error)
}

type TokenLookupStore interface {
	ManagerTokenLookup
	StudentTokenLookup
}

type authQuerier interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

type TokenRepository struct {
	queryer authQuerier
}

func NewTokenRepository(queryer authQuerier) *TokenRepository {
	return &TokenRepository{queryer: queryer}
}

func (r *TokenRepository) FindManagerByUsername(ctx context.Context, username string) (*ManagerAuthRecord, error) {
	if username == "" {
		return nil, ErrNotFound
	}
	if r == nil || r.queryer == nil {
		return nil, errors.New("token repository queryer is nil")
	}

	var record ManagerAuthRecord
	var token sql.NullString
	var updateTime sql.NullInt64
	err := r.queryer.QueryRowContext(ctx, queryManagerByUsername, username).Scan(
		&record.ID,
		&record.Username,
		&record.Password,
		&token,
		&record.Type,
		&record.Status,
		&record.CreateTime,
		&updateTime,
	)
	if err != nil {
		return nil, wrapLookupError("manager", err)
	}
	record.Token = stringPointer(token)
	record.UpdateTime = int64Pointer(updateTime)
	return &record, nil
}

func (r *TokenRepository) FindManagerByToken(ctx context.Context, token string) (*ManagerTokenRecord, error) {
	if token == "" {
		return nil, ErrEmptyToken
	}
	if r == nil || r.queryer == nil {
		return nil, errors.New("token repository queryer is nil")
	}

	var record ManagerTokenRecord
	var updateTime sql.NullInt64
	err := r.queryer.QueryRowContext(ctx, QueryManagerByToken, token).Scan(
		&record.ID,
		&record.Username,
		&record.Type,
		&record.Status,
		&record.CreateTime,
		&updateTime,
	)
	if err != nil {
		return nil, wrapLookupError("manager", err)
	}
	record.UpdateTime = int64Pointer(updateTime)
	return &record, nil
}

func (r *TokenRepository) SaveManagerToken(ctx context.Context, managerID string, token string, updateTime time.Time) error {
	if managerID == "" {
		return ErrNotFound
	}
	if token == "" {
		return ErrEmptyToken
	}
	if r == nil || r.queryer == nil {
		return errors.New("token repository queryer is nil")
	}

	_, err := r.queryer.ExecContext(ctx, updateManagerLoginToken, token, updateTime.Unix(), managerID)
	if err != nil {
		return fmt.Errorf("save manager token: %w", err)
	}
	return nil
}

func (r *TokenRepository) FindStudentByPhone(ctx context.Context, phone string) (*StudentAuthRecord, error) {
	if phone == "" {
		return nil, ErrNotFound
	}
	if r == nil || r.queryer == nil {
		return nil, errors.New("token repository queryer is nil")
	}

	var record StudentAuthRecord
	var token sql.NullString
	var grade sql.NullInt64
	var semester sql.NullString
	var subject sql.NullString
	var updateTime sql.NullInt64
	err := r.queryer.QueryRowContext(ctx, queryStudentByPhone, phone).Scan(
		&record.ID,
		&record.Name,
		&record.Phone,
		&record.Password,
		&token,
		&grade,
		&semester,
		&subject,
		&record.Status,
		&record.CreateTime,
		&updateTime,
	)
	if err != nil {
		return nil, wrapLookupError("student", err)
	}
	record.Token = stringPointer(token)
	record.Grade = intPointer(grade)
	record.Semester = stringPointer(semester)
	record.Subject = stringPointer(subject)
	record.UpdateTime = int64Pointer(updateTime)
	return &record, nil
}

func (r *TokenRepository) FindStudentByToken(ctx context.Context, token string) (*StudentTokenRecord, error) {
	if token == "" {
		return nil, ErrEmptyToken
	}
	if r == nil || r.queryer == nil {
		return nil, errors.New("token repository queryer is nil")
	}

	var record StudentTokenRecord
	var grade sql.NullInt64
	var semester sql.NullString
	var subject sql.NullString
	var updateTime sql.NullInt64
	err := r.queryer.QueryRowContext(ctx, QueryStudentByToken, token).Scan(
		&record.ID,
		&record.Name,
		&record.Phone,
		&grade,
		&semester,
		&subject,
		&record.Status,
		&record.CreateTime,
		&updateTime,
	)
	if err != nil {
		return nil, wrapLookupError("student", err)
	}
	record.Grade = intPointer(grade)
	record.Semester = stringPointer(semester)
	record.Subject = stringPointer(subject)
	record.UpdateTime = int64Pointer(updateTime)
	return &record, nil
}

func (r *TokenRepository) SaveStudentToken(ctx context.Context, studentID string, token string, updateTime time.Time) error {
	if studentID == "" {
		return ErrNotFound
	}
	if token == "" {
		return ErrEmptyToken
	}
	if r == nil || r.queryer == nil {
		return errors.New("token repository queryer is nil")
	}

	_, err := r.queryer.ExecContext(ctx, updateStudentLoginToken, token, updateTime.Unix(), studentID)
	if err != nil {
		return fmt.Errorf("save student token: %w", err)
	}
	return nil
}

func wrapLookupError(kind string, err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	}
	return fmt.Errorf("lookup %s token: %w", kind, err)
}

func intPointer(value sql.NullInt64) *int {
	if !value.Valid {
		return nil
	}
	v := int(value.Int64)
	return &v
}

func int64Pointer(value sql.NullInt64) *int64 {
	if !value.Valid {
		return nil
	}
	v := value.Int64
	return &v
}

func stringPointer(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	return &value.String
}
