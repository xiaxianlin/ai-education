package teacher

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"strings"
	"time"

	"github.com/google/uuid"

	"ai-education/server-go/internal/auth"
)

type PasswordHasher interface {
	Hash(plain string) (string, error)
}

type Service struct {
	repo             Repository
	passwordHasher   PasswordHasher
	now              func() int64
	generateID       func() string
	generatePassword func() (string, error)
}

func NewService(repo Repository) *Service {
	return &Service{
		repo:             repo,
		passwordHasher:   auth.NewPythonPasswordHasher(),
		now:              func() int64 { return time.Now().Unix() },
		generateID:       func() string { return uuid.NewString() },
		generatePassword: generatePassword,
	}
}

func (s *Service) SearchTeachers(ctx context.Context, req SearchTeachersRequest) (SearchTeachersResult, error) {
	if err := s.ensureRepository(); err != nil {
		return SearchTeachersResult{}, err
	}
	req.Page = normalizePage(req.Page)
	req.Size = normalizePageSize(req.Size)
	req.Keywords = strings.TrimSpace(req.Keywords)
	req.Subject = strings.TrimSpace(req.Subject)
	return s.repo.SearchTeachers(ctx, req)
}

func (s *Service) CreateTeacher(ctx context.Context, req SaveTeacherRequest) (string, error) {
	if err := s.ensureRepository(); err != nil {
		return "", err
	}
	teacher, err := s.normalizeTeacher(req)
	if err != nil {
		return "", err
	}
	exists, err := s.repo.TeacherExistsByAccountOrPhone(ctx, teacher.Account, teacher.Phone, "")
	if err != nil {
		return "", err
	}
	if exists {
		return "", ErrDuplicateTeacher
	}
	password := strings.TrimSpace(req.Password)
	if password == "" {
		password, err = s.generatePassword()
		if err != nil {
			return "", err
		}
	}
	passwordHash, err := s.passwordHasher.Hash(password)
	if err != nil {
		return "", err
	}
	now := s.now()
	teacher.ID = s.generateID()
	teacher.CreateTime = now
	teacher.UpdateTime = now
	if err := s.repo.CreateTeacher(ctx, teacher, passwordHash); err != nil {
		return "", err
	}
	return password, nil
}

func (s *Service) UpdateTeacher(ctx context.Context, teacherID string, req SaveTeacherRequest) error {
	if err := s.ensureRepository(); err != nil {
		return err
	}
	teacherID = strings.TrimSpace(teacherID)
	if teacherID == "" {
		return ErrInvalidArgument
	}
	current, err := s.repo.GetTeacher(ctx, teacherID)
	if err != nil {
		return err
	}
	merged := SaveTeacherRequest{
		Account: current.Account,
		Name:    current.Name,
		Phone:   current.Phone,
		Subject: current.Subject,
		School:  current.School,
		Status:  &current.Status,
	}
	if strings.TrimSpace(req.Account) != "" {
		merged.Account = req.Account
	}
	if strings.TrimSpace(req.Name) != "" {
		merged.Name = req.Name
	}
	if strings.TrimSpace(req.Phone) != "" {
		merged.Phone = req.Phone
	}
	if strings.TrimSpace(req.Subject) != "" {
		merged.Subject = req.Subject
	}
	if strings.TrimSpace(req.School) != "" {
		merged.School = req.School
	}
	if req.Status != nil {
		merged.Status = req.Status
	}
	teacher, err := s.normalizeTeacher(merged)
	if err != nil {
		return err
	}
	exists, err := s.repo.TeacherExistsByAccountOrPhone(ctx, teacher.Account, teacher.Phone, teacherID)
	if err != nil {
		return err
	}
	if exists {
		return ErrDuplicateTeacher
	}
	return s.repo.UpdateTeacher(ctx, teacherID, teacher, s.now())
}

func (s *Service) DeleteTeacher(ctx context.Context, teacherID string) error {
	if err := s.ensureRepository(); err != nil {
		return err
	}
	teacherID = strings.TrimSpace(teacherID)
	if teacherID == "" {
		return ErrInvalidArgument
	}
	return s.repo.DeleteTeacher(ctx, teacherID)
}

func (s *Service) ResetTeacherPassword(ctx context.Context, teacherID string) (string, error) {
	if err := s.ensureRepository(); err != nil {
		return "", err
	}
	teacherID = strings.TrimSpace(teacherID)
	if teacherID == "" {
		return "", ErrInvalidArgument
	}
	password, err := s.generatePassword()
	if err != nil {
		return "", err
	}
	hash, err := s.passwordHasher.Hash(password)
	if err != nil {
		return "", err
	}
	return password, s.repo.UpdateTeacherPassword(ctx, teacherID, hash, s.now())
}

func (s *Service) GetTeacherDetail(ctx context.Context, teacherID string) (TeacherDetail, error) {
	if err := s.ensureRepository(); err != nil {
		return TeacherDetail{}, err
	}
	teacherID = strings.TrimSpace(teacherID)
	if teacherID == "" {
		return TeacherDetail{}, ErrInvalidArgument
	}
	return s.repo.GetTeacherDetail(ctx, teacherID)
}

func (s *Service) AssignStudentTeacher(ctx context.Context, studentID string, req AssignStudentTeacherRequest) error {
	if err := s.ensureRepository(); err != nil {
		return err
	}
	studentID = strings.TrimSpace(studentID)
	teacherID := strings.TrimSpace(req.TeacherID)
	if studentID == "" || teacherID == "" {
		return ErrInvalidArgument
	}
	return s.repo.AssignStudentTeacher(ctx, studentID, teacherID, s.now())
}

func (s *Service) CreateTeacherClaim(ctx context.Context, studentID string, req CreateTeacherClaimRequest) (*StudentTeacherClaim, error) {
	if err := s.ensureRepository(); err != nil {
		return nil, err
	}
	studentID = strings.TrimSpace(studentID)
	teacherID := strings.TrimSpace(req.TeacherID)
	if studentID == "" || teacherID == "" {
		return nil, ErrInvalidArgument
	}
	return s.repo.CreateTeacherClaim(ctx, studentID, teacherID, s.now())
}

func (s *Service) UpdateTeacherClaim(ctx context.Context, claimID int64, req UpdateTeacherClaimRequest) (*StudentTeacherClaim, error) {
	if err := s.ensureRepository(); err != nil {
		return nil, err
	}
	status := strings.TrimSpace(req.Status)
	if claimID <= 0 || (status != "pending" && status != "approved" && status != "rejected") {
		return nil, ErrInvalidArgument
	}
	return s.repo.UpdateTeacherClaim(ctx, claimID, status, s.now())
}

func (s *Service) ListTeacherClaims(ctx context.Context, status string) ([]StudentTeacherClaim, error) {
	if err := s.ensureRepository(); err != nil {
		return nil, err
	}
	status = strings.TrimSpace(status)
	if status != "" && status != "pending" && status != "approved" && status != "rejected" {
		return nil, ErrInvalidArgument
	}
	return s.repo.ListTeacherClaims(ctx, status)
}

func (s *Service) ListStudentTeacherClaims(ctx context.Context, studentID string) ([]StudentTeacherClaim, error) {
	if err := s.ensureRepository(); err != nil {
		return nil, err
	}
	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		return nil, ErrInvalidArgument
	}
	return s.repo.ListStudentTeacherClaims(ctx, studentID)
}

func (s *Service) normalizeTeacher(req SaveTeacherRequest) (Teacher, error) {
	account := strings.TrimSpace(req.Account)
	name := strings.TrimSpace(req.Name)
	phone := strings.TrimSpace(req.Phone)
	subject := strings.TrimSpace(req.Subject)
	school := strings.TrimSpace(req.School)
	status := 1
	if req.Status != nil {
		status = *req.Status
	}
	if account == "" || name == "" || phone == "" || subject == "" || school == "" || (status != 0 && status != 1) {
		return Teacher{}, ErrInvalidArgument
	}
	return Teacher{Account: account, Name: name, Phone: phone, Subject: subject, School: school, Status: status}, nil
}

func (s *Service) ensureRepository() error {
	if s == nil || s.repo == nil || s.passwordHasher == nil {
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

func generatePassword() (string, error) {
	buf := make([]byte, 9)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}
