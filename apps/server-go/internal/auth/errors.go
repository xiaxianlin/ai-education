package auth

import (
	"errors"
	"fmt"
)

const (
	statusBadRequest   = 400
	statusUnauthorized = 401
	statusInternal     = 500
)

var (
	ErrMissingToken       = errors.New("missing access token")
	ErrInvalidToken       = errors.New("invalid access token")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrAccountDisabled    = errors.New("account disabled")
)

type Error struct {
	Status  int
	Message string
	Err     error
}

func (e *Error) Error() string {
	if e.Err == nil {
		return e.Message
	}
	return fmt.Sprintf("%s: %v", e.Message, e.Err)
}

func (e *Error) Unwrap() error {
	return e.Err
}

func newAuthError(message string, err error) *Error {
	return &Error{
		Status:  statusUnauthorized,
		Message: message,
		Err:     err,
	}
}

func newBadRequestError(message string, err error) *Error {
	return &Error{
		Status:  statusBadRequest,
		Message: message,
		Err:     err,
	}
}

func newInternalError(message string, err error) *Error {
	return &Error{
		Status:  statusInternal,
		Message: message,
		Err:     err,
	}
}

func mapError(err error) (int, string) {
	if err == nil {
		return 0, ""
	}

	var appErr *Error
	if errors.As(err, &appErr) {
		return appErr.Status, appErr.Message
	}

	return statusInternal, "服务器内部错误"
}
