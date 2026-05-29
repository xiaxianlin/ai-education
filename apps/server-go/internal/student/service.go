package student

import (
	"context"
	"errors"
	"strings"
)

var ErrInvalidArgument = errors.New("invalid student profile argument")

var allowedSubjects = map[string]struct{}{
	"语文": {},
	"数学": {},
	"英语": {},
}

var allowedSemesters = map[string]struct{}{
	"上学期": {},
	"下学期": {},
}

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetProfile(ctx context.Context, studentID string) (*Profile, error) {
	if err := s.ensureRepository(); err != nil {
		return nil, err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return nil, ErrInvalidArgument
	}
	return s.repo.GetProfile(ctx, studentID)
}

func (s *Service) UpdateSettings(ctx context.Context, studentID string, req UpdateSettingsRequest) error {
	if err := s.ensureRepository(); err != nil {
		return err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return ErrInvalidArgument
	}

	settings, err := normalizeSettings(req)
	if err != nil {
		return err
	}
	return s.repo.UpdateSettings(ctx, studentID, settings)
}

func (s *Service) ensureRepository() error {
	if s == nil || s.repo == nil {
		return ErrRepositoryUnavailable
	}
	return nil
}

func normalizeSettings(req UpdateSettingsRequest) (UpdateSettings, error) {
	if req.Grade < 1 || req.Grade > 12 {
		return UpdateSettings{}, ErrInvalidArgument
	}

	semester := strings.TrimSpace(req.Semester)
	if _, ok := allowedSemesters[semester]; !ok {
		return UpdateSettings{}, ErrInvalidArgument
	}

	subject := strings.TrimSpace(req.Subject)
	if _, ok := allowedSubjects[subject]; !ok {
		return UpdateSettings{}, ErrInvalidArgument
	}

	return UpdateSettings{
		Grade:    req.Grade,
		Semester: semester,
		Subject:  subject,
	}, nil
}
