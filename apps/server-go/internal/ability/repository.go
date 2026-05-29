package ability

import (
	"context"
	"errors"
)

var (
	ErrAbilityNotFound       = errors.New("能力不存在")
	ErrDuplicateAbility      = errors.New("该科目、年级下已存在相同代码的能力")
	ErrRepositoryUnavailable = errors.New("ability repository is not configured")
)

type Repository interface {
	Create(ctx context.Context, data CreateAbility) (int64, error)
	BatchCreate(ctx context.Context, items []CreateAbility) ([]Ability, error)
	Get(ctx context.Context, id int64) (*Ability, error)
	FindByUnique(ctx context.Context, subject string, grade int, code string) (*Ability, error)
	List(ctx context.Context, params SearchAbilityParams) ([]Ability, error)
	Update(ctx context.Context, id int64, patch UpdateAbilityPatch) error
	Delete(ctx context.Context, id int64) error
	BatchDelete(ctx context.Context, ids []int64) (int, error)
	DeleteBySubjectGrade(ctx context.Context, subject string, grade int) (int, error)
}

type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}

func newValidationError(message string) error {
	return &ValidationError{Message: message}
}

func IsValidationError(err error) bool {
	var validationErr *ValidationError
	return errors.As(err, &validationErr)
}
