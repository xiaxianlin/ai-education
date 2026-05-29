package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

var (
	ErrEmptyToken = errors.New("token is required")
	ErrNotFound   = errors.New("record not found")
)

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

type rowQuerier interface {
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

type TokenRepository struct {
	queryer rowQuerier
}

func NewTokenRepository(queryer rowQuerier) *TokenRepository {
	return &TokenRepository{queryer: queryer}
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
