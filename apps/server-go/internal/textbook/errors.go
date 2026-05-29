package textbook

import "errors"

var (
	ErrNotImplemented           = errors.New("textbook repository method not implemented")
	ErrRepositoryUnavailable    = errors.New("textbook repository is not configured")
	ErrTextbookNotFound         = errors.New("教材不存在")
	ErrUnitNotFound             = errors.New("课程单元不存在")
	ErrTextbookVersionNotFound  = errors.New("教材版本不存在")
	ErrTeacherBookNotFound      = errors.New("教师用书不存在")
	ErrDuplicateTextbook        = errors.New("教材已存在")
	ErrDuplicateTextbookVersion = errors.New("该版本已存在")
	ErrDuplicateTeacherBook     = errors.New("教师用书已存在")
	ErrTextbookVersionInUse     = errors.New("该版本正在被使用，无法删除")
)
