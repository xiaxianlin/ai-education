package mastery

import (
	"context"
	"errors"
	"math"
	"strings"
	"time"
)

const (
	defaultWeakThreshold = 60.0
	defaultWeakLimit     = 5
	maxWeakLimit         = 20
	recentStatisticsDays = 30
)

var ErrInvalidArgument = errors.New("invalid mastery argument")

type Clock func() time.Time

type Service struct {
	repo  Repository
	clock Clock
}

func NewService(repo Repository) *Service {
	return &Service{
		repo:  repo,
		clock: time.Now,
	}
}

func (s *Service) WithClock(clock Clock) *Service {
	if clock != nil {
		s.clock = clock
	}
	return s
}

func (s *Service) ListMastery(ctx context.Context, studentID string, filter MasteryFilter) ([]MasteryWithInfo, error) {
	if err := s.ensureRepository(); err != nil {
		return nil, err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return nil, ErrInvalidArgument
	}
	return s.repo.ListMastery(ctx, studentID, normalizeMasteryFilter(filter))
}

func (s *Service) ListWeakMastery(ctx context.Context, studentID string, threshold float64, limit int) ([]Mastery, error) {
	if err := s.ensureRepository(); err != nil {
		return nil, err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" || math.IsNaN(threshold) || math.IsInf(threshold, 0) || limit < 1 || limit > maxWeakLimit {
		return nil, ErrInvalidArgument
	}
	return s.repo.ListWeakMastery(ctx, studentID, threshold, limit)
}

func (s *Service) GetSummary(ctx context.Context, studentID string) (Summary, error) {
	if err := s.ensureRepository(); err != nil {
		return Summary{}, err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return Summary{}, ErrInvalidArgument
	}
	return s.repo.GetSummary(ctx, studentID)
}

func (s *Service) GetPracticeStatistics(ctx context.Context, studentID string) (StatisticsSummary, error) {
	if err := s.ensureRepository(); err != nil {
		return StatisticsSummary{}, err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return StatisticsSummary{}, ErrInvalidArgument
	}

	allTime, err := s.repo.GetPracticeStatistics(ctx, studentID, nil)
	if err != nil {
		return StatisticsSummary{}, err
	}

	now := time.Now()
	if s.clock != nil {
		now = s.clock()
	}
	recentStart := now.AddDate(0, 0, -recentStatisticsDays).Unix()
	recent30Days, err := s.repo.GetPracticeStatistics(ctx, studentID, &recentStart)
	if err != nil {
		return StatisticsSummary{}, err
	}

	return StatisticsSummary{
		AllTime:      allTime,
		Recent30Days: recent30Days,
	}, nil
}

func (s *Service) ensureRepository() error {
	if s == nil || s.repo == nil {
		return ErrRepositoryUnavailable
	}
	return nil
}

func normalizeMasteryFilter(filter MasteryFilter) MasteryFilter {
	if filter.Subject != nil {
		subject := strings.TrimSpace(*filter.Subject)
		if subject == "" {
			filter.Subject = nil
		} else {
			filter.Subject = &subject
		}
	}
	return filter
}

func DefaultWeakThreshold() float64 {
	return defaultWeakThreshold
}

func DefaultWeakLimit() int {
	return defaultWeakLimit
}
