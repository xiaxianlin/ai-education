package mastery

import (
	"context"
	"errors"
)

var (
	ErrRepositoryUnavailable = errors.New("mastery repository is not configured")
	ErrNotImplemented        = errors.New("mastery repository is not implemented")
)

type Repository interface {
	ListMastery(ctx context.Context, studentID string, filter MasteryFilter) ([]MasteryWithInfo, error)
	ListWeakMastery(ctx context.Context, studentID string, threshold float64, limit int) ([]Mastery, error)
	GetSummary(ctx context.Context, studentID string) (Summary, error)
	GetPracticeStatistics(ctx context.Context, studentID string, startTime *int64) (Statistics, error)
}

type NotImplementedRepository struct{}

func (NotImplementedRepository) ListMastery(ctx context.Context, studentID string, filter MasteryFilter) ([]MasteryWithInfo, error) {
	return nil, ErrNotImplemented
}

func (NotImplementedRepository) ListWeakMastery(ctx context.Context, studentID string, threshold float64, limit int) ([]Mastery, error) {
	return nil, ErrNotImplemented
}

func (NotImplementedRepository) GetSummary(ctx context.Context, studentID string) (Summary, error) {
	return Summary{}, ErrNotImplemented
}

func (NotImplementedRepository) GetPracticeStatistics(ctx context.Context, studentID string, startTime *int64) (Statistics, error) {
	return Statistics{}, ErrNotImplemented
}
