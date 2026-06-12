package student

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"

	"ai-education/server-go/internal/auth"
)

var (
	ErrDuplicateStudentPhone = errors.New("student phone already exists")
)

type AdminRepository interface {
	GetAdminStudent(ctx context.Context, studentID string) (*AdminStudent, error)
	SearchStudents(ctx context.Context, req SearchStudentsRequest) (SearchStudentsResult, error)
	PhoneExists(ctx context.Context, phone string, excludeStudentID string) (bool, error)
	CreateStudent(ctx context.Context, record CreateStudentRecord) error
	UpdateStudent(ctx context.Context, studentID string, record UpdateStudentRecord) error
	DeleteStudent(ctx context.Context, studentID string) error
	ResetStudentPassword(ctx context.Context, studentID string, passwordHash string, updateTime int64) error
	ListStudentMastery(ctx context.Context, studentID string, subject string) ([]StudentMastery, error)
	GetStudentMasterySummary(ctx context.Context, studentID string) (StudentMasterySummary, error)
}

type PasswordHasher interface {
	Hash(plain string) (string, error)
}

type AdminService struct {
	repo             AdminRepository
	passwordHasher   PasswordHasher
	now              func() int64
	generateID       func() string
	generatePassword func() (string, error)
}

func NewAdminService(repo AdminRepository) *AdminService {
	return &AdminService{
		repo:             repo,
		passwordHasher:   auth.NewPythonPasswordHasher(),
		now:              func() int64 { return time.Now().Unix() },
		generateID:       func() string { return uuid.NewString() },
		generatePassword: generateStudentPassword,
	}
}

func NewAdminServiceWithOptions(repo AdminRepository, hasher PasswordHasher, now func() int64, generateID func() string, generatePassword func() (string, error)) *AdminService {
	service := NewAdminService(repo)
	if hasher != nil {
		service.passwordHasher = hasher
	}
	if now != nil {
		service.now = now
	}
	if generateID != nil {
		service.generateID = generateID
	}
	if generatePassword != nil {
		service.generatePassword = generatePassword
	}
	return service
}

func (s *AdminService) SearchStudents(ctx context.Context, req SearchStudentsRequest) (SearchStudentsResult, error) {
	if err := s.ensureAdminRepository(); err != nil {
		return SearchStudentsResult{}, err
	}
	req.Page = normalizePage(req.Page)
	req.Size = normalizePageSize(req.Size)
	req.Name = strings.TrimSpace(req.Name)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Keywords = strings.TrimSpace(req.Keywords)
	return s.repo.SearchStudents(ctx, req)
}

func (s *AdminService) CreateStudent(ctx context.Context, req SaveStudentRequest) (string, error) {
	if err := s.ensureAdminRepository(); err != nil {
		return "", err
	}
	record, err := s.normalizeStudentRecord(req)
	if err != nil {
		return "", err
	}
	exists, err := s.repo.PhoneExists(ctx, record.Phone, "")
	if err != nil {
		return "", err
	}
	if exists {
		return "", ErrDuplicateStudentPhone
	}
	password, err := s.generatePassword()
	if err != nil {
		return "", err
	}
	passwordHash, err := s.passwordHasher.Hash(password)
	if err != nil {
		return "", err
	}
	now := s.now()
	err = s.repo.CreateStudent(ctx, CreateStudentRecord{
		ID:           s.generateID(),
		Name:         record.Name,
		Phone:        record.Phone,
		PasswordHash: passwordHash,
		Grade:        record.Grade,
		TeacherID:    record.TeacherID,
		Status:       record.Status,
		CreateTime:   now,
		UpdateTime:   now,
	})
	return password, err
}

func (s *AdminService) GetStudent(ctx context.Context, studentID string) (*AdminStudent, error) {
	if err := s.ensureAdminRepository(); err != nil {
		return nil, err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return nil, ErrInvalidArgument
	}
	return s.repo.GetAdminStudent(ctx, studentID)
}

func (s *AdminService) UpdateStudent(ctx context.Context, studentID string, req SaveStudentRequest) error {
	if err := s.ensureAdminRepository(); err != nil {
		return err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return ErrInvalidArgument
	}
	record, err := s.normalizeStudentRecord(req)
	if err != nil {
		return err
	}
	exists, err := s.repo.PhoneExists(ctx, record.Phone, studentID)
	if err != nil {
		return err
	}
	if exists {
		return ErrDuplicateStudentPhone
	}
	return s.repo.UpdateStudent(ctx, studentID, UpdateStudentRecord{
		Name:       record.Name,
		Phone:      record.Phone,
		Grade:      record.Grade,
		TeacherID:  record.TeacherID,
		Status:     record.Status,
		UpdateTime: s.now(),
	})
}

func (s *AdminService) DeleteStudent(ctx context.Context, studentID string) error {
	if err := s.ensureAdminRepository(); err != nil {
		return err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return ErrInvalidArgument
	}
	return s.repo.DeleteStudent(ctx, studentID)
}

func (s *AdminService) ResetStudentPassword(ctx context.Context, studentID string) (string, error) {
	if err := s.ensureAdminRepository(); err != nil {
		return "", err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return "", ErrInvalidArgument
	}
	password, err := s.generatePassword()
	if err != nil {
		return "", err
	}
	passwordHash, err := s.passwordHasher.Hash(password)
	if err != nil {
		return "", err
	}
	return password, s.repo.ResetStudentPassword(ctx, studentID, passwordHash, s.now())
}

func (s *AdminService) ListMastery(ctx context.Context, studentID string, subject string) ([]StudentMastery, error) {
	if err := s.ensureAdminRepository(); err != nil {
		return nil, err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return nil, ErrInvalidArgument
	}
	return s.repo.ListStudentMastery(ctx, studentID, strings.TrimSpace(subject))
}

func (s *AdminService) GetMasterySummary(ctx context.Context, studentID string) (StudentMasterySummary, error) {
	if err := s.ensureAdminRepository(); err != nil {
		return StudentMasterySummary{}, err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return StudentMasterySummary{}, ErrInvalidArgument
	}
	return s.repo.GetStudentMasterySummary(ctx, studentID)
}

func (s *AdminService) normalizeStudentRecord(req SaveStudentRequest) (UpdateStudentRecord, error) {
	name := strings.TrimSpace(req.Name)
	phone := strings.TrimSpace(req.Phone)
	status := 1
	if req.Status != nil {
		status = *req.Status
	}
	if name == "" || phone == "" || req.Grade < 1 || req.Grade > 12 || (status != 0 && status != 1) {
		return UpdateStudentRecord{}, ErrInvalidArgument
	}
	var teacherID *string
	if req.TeacherID != nil {
		trimmed := strings.TrimSpace(*req.TeacherID)
		if trimmed != "" {
			teacherID = &trimmed
		}
	}
	return UpdateStudentRecord{Name: name, Phone: phone, Grade: req.Grade, TeacherID: teacherID, Status: status}, nil
}

func (s *AdminService) ensureAdminRepository() error {
	if s == nil || s.repo == nil {
		return ErrRepositoryUnavailable
	}
	if s.passwordHasher == nil {
		return ErrRepositoryUnavailable
	}
	return nil
}

func normalizePage(page int) int {
	if page < 1 {
		return 1
	}
	return page
}

func normalizePageSize(size int) int {
	if size < 1 {
		return 20
	}
	if size > 100 {
		return 100
	}
	return size
}

func generateStudentPassword() (string, error) {
	buf := make([]byte, 9)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func round2(value float64) float64 {
	return math.Round(value*100) / 100
}
