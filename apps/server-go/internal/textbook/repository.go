package textbook

import "context"

type Repository interface {
	ListUnitsByTextbook(ctx context.Context, textbookID int64) ([]Unit, error)

	CreateTextbook(ctx context.Context, textbook SaveTextbookRequest) (int64, error)
	UpdateTextbook(ctx context.Context, id int64, textbook SaveTextbookRequest) error
	DeleteTextbook(ctx context.Context, id int64) error
	GetTextbook(ctx context.Context, id int64) (*Textbook, error)
	SearchTextbooks(ctx context.Context, filter SearchTextbookRequest) ([]Textbook, error)
	ListTextbookUnits(ctx context.Context, textbookID int64) ([]Unit, error)

	CreateUnit(ctx context.Context, unit SaveUnitRequest) (int64, error)
	UpdateUnit(ctx context.Context, id int64, unit UpdateUnitRequest) error
	DeleteUnit(ctx context.Context, id int64) error

	CreateTextbookVersion(ctx context.Context, version SaveTextbookVersionRequest) (int64, error)
	UpdateTextbookVersion(ctx context.Context, id int64, version SaveTextbookVersionRequest) error
	DeleteTextbookVersion(ctx context.Context, id int64) error
	SetTextbookVersionEnabled(ctx context.Context, id int64, enabled bool) error
	GetTextbookVersion(ctx context.Context, id int64) (*TextbookVersion, error)
	SearchTextbookVersions(ctx context.Context, filter SearchTextbookVersionRequest) ([]TextbookVersion, error)

	CreateTeacherBook(ctx context.Context, teacherBook SaveTeacherBookRequest) (int64, error)
	UpdateTeacherBook(ctx context.Context, id int64, teacherBook SaveTeacherBookRequest) error
	DeleteTeacherBook(ctx context.Context, id int64) error
	GetTeacherBook(ctx context.Context, id int64) (*TeacherBook, error)
	SearchTeacherBooks(ctx context.Context, filter SearchTeacherBookRequest) ([]TeacherBook, error)
}

type NotImplementedRepository struct{}

func (NotImplementedRepository) ListUnitsByTextbook(ctx context.Context, textbookID int64) ([]Unit, error) {
	return nil, ErrNotImplemented
}

func (NotImplementedRepository) CreateTextbook(ctx context.Context, textbook SaveTextbookRequest) (int64, error) {
	return 0, ErrNotImplemented
}

func (NotImplementedRepository) UpdateTextbook(ctx context.Context, id int64, textbook SaveTextbookRequest) error {
	return ErrNotImplemented
}

func (NotImplementedRepository) DeleteTextbook(ctx context.Context, id int64) error {
	return ErrNotImplemented
}

func (NotImplementedRepository) GetTextbook(ctx context.Context, id int64) (*Textbook, error) {
	return nil, ErrNotImplemented
}

func (NotImplementedRepository) SearchTextbooks(ctx context.Context, filter SearchTextbookRequest) ([]Textbook, error) {
	return nil, ErrNotImplemented
}

func (NotImplementedRepository) ListTextbookUnits(ctx context.Context, textbookID int64) ([]Unit, error) {
	return nil, ErrNotImplemented
}

func (NotImplementedRepository) CreateUnit(ctx context.Context, unit SaveUnitRequest) (int64, error) {
	return 0, ErrNotImplemented
}

func (NotImplementedRepository) UpdateUnit(ctx context.Context, id int64, unit UpdateUnitRequest) error {
	return ErrNotImplemented
}

func (NotImplementedRepository) DeleteUnit(ctx context.Context, id int64) error {
	return ErrNotImplemented
}

func (NotImplementedRepository) CreateTextbookVersion(ctx context.Context, version SaveTextbookVersionRequest) (int64, error) {
	return 0, ErrNotImplemented
}

func (NotImplementedRepository) UpdateTextbookVersion(ctx context.Context, id int64, version SaveTextbookVersionRequest) error {
	return ErrNotImplemented
}

func (NotImplementedRepository) DeleteTextbookVersion(ctx context.Context, id int64) error {
	return ErrNotImplemented
}

func (NotImplementedRepository) SetTextbookVersionEnabled(ctx context.Context, id int64, enabled bool) error {
	return ErrNotImplemented
}

func (NotImplementedRepository) GetTextbookVersion(ctx context.Context, id int64) (*TextbookVersion, error) {
	return nil, ErrNotImplemented
}

func (NotImplementedRepository) SearchTextbookVersions(ctx context.Context, filter SearchTextbookVersionRequest) ([]TextbookVersion, error) {
	return nil, ErrNotImplemented
}

func (NotImplementedRepository) CreateTeacherBook(ctx context.Context, teacherBook SaveTeacherBookRequest) (int64, error) {
	return 0, ErrNotImplemented
}

func (NotImplementedRepository) UpdateTeacherBook(ctx context.Context, id int64, teacherBook SaveTeacherBookRequest) error {
	return ErrNotImplemented
}

func (NotImplementedRepository) DeleteTeacherBook(ctx context.Context, id int64) error {
	return ErrNotImplemented
}

func (NotImplementedRepository) GetTeacherBook(ctx context.Context, id int64) (*TeacherBook, error) {
	return nil, ErrNotImplemented
}

func (NotImplementedRepository) SearchTeacherBooks(ctx context.Context, filter SearchTeacherBookRequest) ([]TeacherBook, error) {
	return nil, ErrNotImplemented
}
