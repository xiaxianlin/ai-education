package teacher

import "errors"

var (
	ErrInvalidArgument       = errors.New("invalid teacher argument")
	ErrRepositoryUnavailable = errors.New("teacher repository is not configured")
	ErrTeacherNotFound       = errors.New("teacher not found")
	ErrDuplicateTeacher      = errors.New("teacher account or phone already exists")
	ErrStudentNotFound       = errors.New("student not found")
	ErrClaimNotFound         = errors.New("teacher claim not found")
)
