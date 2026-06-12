package textbook

import "errors"

var (
	ErrNotImplemented        = errors.New("textbook repository method not implemented")
	ErrRepositoryUnavailable = errors.New("textbook repository is not configured")
	ErrTextbookNotFound      = errors.New("教材不存在")
	ErrUnitNotFound          = errors.New("课程单元不存在")
	ErrDuplicateTextbook     = errors.New("教材已存在")
)
