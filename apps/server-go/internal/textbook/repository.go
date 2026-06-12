package textbook

import "context"

type Repository interface {
	ListUnitsByTextbook(ctx context.Context, textbookID int64) ([]Unit, error)

	CreateTextbook(ctx context.Context, textbook SaveTextbookRequest) (int64, error)
	UpdateTextbook(ctx context.Context, id int64, textbook SaveTextbookRequest) error
	DeleteTextbook(ctx context.Context, id int64) error
	GetTextbook(ctx context.Context, id int64) (*Textbook, error)
	SearchTextbooks(ctx context.Context, filter SearchTextbookRequest) (SearchTextbookResult, error)
	ListTextbookUnits(ctx context.Context, textbookID int64) ([]Unit, error)

	CreateUnit(ctx context.Context, unit SaveUnitRequest) (int64, error)
	UpdateUnit(ctx context.Context, id int64, unit UpdateUnitRequest) error
	DeleteUnit(ctx context.Context, id int64) error
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

func (NotImplementedRepository) SearchTextbooks(ctx context.Context, filter SearchTextbookRequest) (SearchTextbookResult, error) {
	return SearchTextbookResult{}, ErrNotImplemented
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
