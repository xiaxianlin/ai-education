package auth

import (
	"context"
	"time"
)

type TokenResolver[T any] interface {
	Issue(claims T) (string, error)
	Resolve(token string) (T, error)
}

type PasswordHasher interface {
	Hash(plain string) (string, error)
	Compare(plain string, hashed string) bool
}

type ManagerStore interface {
	FindManagerByUsername(ctx context.Context, username string) (*Manager, error)
	FindManagerByToken(ctx context.Context, token string) (*Manager, error)
	SaveManagerToken(ctx context.Context, managerID string, token string, updateTime time.Time) error
}

type StudentStore interface {
	FindStudentByPhone(ctx context.Context, phone string) (*Student, error)
	FindStudentByToken(ctx context.Context, token string) (*Student, error)
	SaveStudentToken(ctx context.Context, studentID string, token string, updateTime time.Time) error
}
