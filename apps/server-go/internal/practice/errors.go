package practice

import "errors"

var (
	ErrInvalidArgument = errors.New("invalid argument")
	ErrNotFound        = errors.New("practice not found")
	ErrForbidden       = errors.New("practice forbidden")
	ErrConflict        = errors.New("practice conflict")
	ErrNotConfigured   = errors.New("practice dependency not configured")
)

type validationError struct {
	message string
}

func (err validationError) Error() string {
	return err.message
}

func (err validationError) Unwrap() error {
	return ErrInvalidArgument
}

func newValidationError(message string) error {
	return validationError{message: message}
}

type conflictError struct {
	message string
}

func (err conflictError) Error() string {
	return err.message
}

func (err conflictError) Unwrap() error {
	return ErrConflict
}

func newConflictError(message string) error {
	return conflictError{message: message}
}
