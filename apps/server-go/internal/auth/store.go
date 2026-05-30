package auth

import (
	"context"
	"errors"
	"time"

	"ai-education/server-go/internal/db"
)

var errAuthRepositoryMissing = errors.New("auth repository is nil")

type SQLAuthRepository interface {
	FindManagerByUsername(ctx context.Context, username string) (*db.ManagerAuthRecord, error)
	FindManagerByToken(ctx context.Context, token string) (*db.ManagerTokenRecord, error)
	SaveManagerToken(ctx context.Context, managerID string, token string, updateTime time.Time) error
	GetManagerByID(ctx context.Context, managerID string) (*db.ManagerRecord, error)
	ManagerUsernameExists(ctx context.Context, username string) (bool, error)
	CreateManager(ctx context.Context, manager db.ManagerRecord) error
	UpdateManager(ctx context.Context, managerID string, managerType *int, status *int, updateTime int64) error
	DeleteManager(ctx context.Context, managerID string) error
	UpdateManagerPassword(ctx context.Context, managerID string, passwordHash string, token *string, updateTime int64) error
	ListManagers(ctx context.Context) ([]db.ManagerRecord, error)
	FindStudentByPhone(ctx context.Context, phone string) (*db.StudentAuthRecord, error)
	FindStudentByToken(ctx context.Context, token string) (*db.StudentTokenRecord, error)
	SaveStudentToken(ctx context.Context, studentID string, token string, updateTime time.Time) error
}

type DatabaseStore struct {
	repository SQLAuthRepository
}

func NewDatabaseStore(repository SQLAuthRepository) *DatabaseStore {
	return &DatabaseStore{repository: repository}
}

func (s *DatabaseStore) FindManagerByUsername(ctx context.Context, username string) (*Manager, error) {
	if s == nil || s.repository == nil {
		return nil, errAuthRepositoryMissing
	}
	record, err := s.repository.FindManagerByUsername(ctx, username)
	if err != nil {
		return nil, normalizeManagerError(err)
	}
	return managerFromAuthRecord(record), nil
}

func (s *DatabaseStore) FindManagerByToken(ctx context.Context, token string) (*Manager, error) {
	if s == nil || s.repository == nil {
		return nil, errAuthRepositoryMissing
	}
	record, err := s.repository.FindManagerByToken(ctx, token)
	if err != nil {
		return nil, normalizeManagerError(err)
	}
	return managerFromTokenRecord(record), nil
}

func (s *DatabaseStore) SaveManagerToken(ctx context.Context, managerID string, token string, updateTime time.Time) error {
	if s == nil || s.repository == nil {
		return errAuthRepositoryMissing
	}
	return s.repository.SaveManagerToken(ctx, managerID, token, updateTime)
}

func (s *DatabaseStore) GetManagerByID(ctx context.Context, managerID string) (*Manager, error) {
	if s == nil || s.repository == nil {
		return nil, errAuthRepositoryMissing
	}
	record, err := s.repository.GetManagerByID(ctx, managerID)
	if err != nil {
		return nil, normalizeManagerError(err)
	}
	return managerFromRecord(record), nil
}

func (s *DatabaseStore) ManagerUsernameExists(ctx context.Context, username string) (bool, error) {
	if s == nil || s.repository == nil {
		return false, errAuthRepositoryMissing
	}
	return s.repository.ManagerUsernameExists(ctx, username)
}

func (s *DatabaseStore) CreateManager(ctx context.Context, manager Manager) error {
	if s == nil || s.repository == nil {
		return errAuthRepositoryMissing
	}
	updateTime := manager.UpdateTime
	return normalizeManagerError(s.repository.CreateManager(ctx, db.ManagerRecord{
		ID:         manager.ID,
		Username:   manager.Username,
		Password:   manager.PasswordHash,
		Type:       manager.Type,
		Status:     manager.Status,
		CreateTime: manager.CreateTime,
		UpdateTime: &updateTime,
	}))
}

func (s *DatabaseStore) UpdateManager(ctx context.Context, managerID string, managerType *int, status *int, updateTime int64) error {
	if s == nil || s.repository == nil {
		return errAuthRepositoryMissing
	}
	return normalizeManagerError(s.repository.UpdateManager(ctx, managerID, managerType, status, updateTime))
}

func (s *DatabaseStore) DeleteManager(ctx context.Context, managerID string) error {
	if s == nil || s.repository == nil {
		return errAuthRepositoryMissing
	}
	return normalizeManagerError(s.repository.DeleteManager(ctx, managerID))
}

func (s *DatabaseStore) UpdateManagerPassword(ctx context.Context, managerID string, passwordHash string, token *string, updateTime int64) error {
	if s == nil || s.repository == nil {
		return errAuthRepositoryMissing
	}
	return normalizeManagerError(s.repository.UpdateManagerPassword(ctx, managerID, passwordHash, token, updateTime))
}

func (s *DatabaseStore) ListManagers(ctx context.Context) ([]Manager, error) {
	if s == nil || s.repository == nil {
		return nil, errAuthRepositoryMissing
	}
	records, err := s.repository.ListManagers(ctx)
	if err != nil {
		return nil, normalizeManagerError(err)
	}
	managers := make([]Manager, 0, len(records))
	for i := range records {
		if manager := managerFromRecord(&records[i]); manager != nil {
			managers = append(managers, *manager)
		}
	}
	return managers, nil
}

func (s *DatabaseStore) FindStudentByPhone(ctx context.Context, phone string) (*Student, error) {
	if s == nil || s.repository == nil {
		return nil, errAuthRepositoryMissing
	}
	record, err := s.repository.FindStudentByPhone(ctx, phone)
	if err != nil {
		return nil, err
	}
	return studentFromAuthRecord(record), nil
}

func (s *DatabaseStore) FindStudentByToken(ctx context.Context, token string) (*Student, error) {
	if s == nil || s.repository == nil {
		return nil, errAuthRepositoryMissing
	}
	record, err := s.repository.FindStudentByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	return studentFromTokenRecord(record), nil
}

func (s *DatabaseStore) SaveStudentToken(ctx context.Context, studentID string, token string, updateTime time.Time) error {
	if s == nil || s.repository == nil {
		return errAuthRepositoryMissing
	}
	return s.repository.SaveStudentToken(ctx, studentID, token, updateTime)
}

func managerFromAuthRecord(record *db.ManagerAuthRecord) *Manager {
	if record == nil {
		return nil
	}
	manager := &Manager{
		ID:           record.ID,
		Username:     record.Username,
		PasswordHash: record.Password,
		Type:         record.Type,
		Status:       record.Status,
		CreateTime:   record.CreateTime,
	}
	if record.Token != nil {
		manager.Token = *record.Token
	}
	if record.UpdateTime != nil {
		manager.UpdateTime = *record.UpdateTime
	}
	return manager
}

func managerFromTokenRecord(record *db.ManagerTokenRecord) *Manager {
	if record == nil {
		return nil
	}
	manager := &Manager{
		ID:         record.ID,
		Username:   record.Username,
		Type:       record.Type,
		Status:     record.Status,
		CreateTime: record.CreateTime,
	}
	if record.UpdateTime != nil {
		manager.UpdateTime = *record.UpdateTime
	}
	return manager
}

func managerFromRecord(record *db.ManagerRecord) *Manager {
	if record == nil {
		return nil
	}
	manager := &Manager{
		ID:           record.ID,
		Username:     record.Username,
		PasswordHash: record.Password,
		Type:         record.Type,
		Status:       record.Status,
		CreateTime:   record.CreateTime,
	}
	if record.Token != nil {
		manager.Token = *record.Token
	}
	if record.UpdateTime != nil {
		manager.UpdateTime = *record.UpdateTime
	}
	return manager
}

func normalizeManagerError(err error) error {
	if errors.Is(err, db.ErrNotFound) {
		return ErrManagerNotFound
	}
	return err
}

func studentFromAuthRecord(record *db.StudentAuthRecord) *Student {
	if record == nil {
		return nil
	}
	student := &Student{
		ID:           record.ID,
		Name:         record.Name,
		Phone:        record.Phone,
		PasswordHash: record.Password,
		Grade:        record.Grade,
		Semester:     record.Semester,
		Subject:      record.Subject,
		Status:       record.Status,
		CreateTime:   record.CreateTime,
	}
	if record.Token != nil {
		student.Token = *record.Token
	}
	if record.UpdateTime != nil {
		student.UpdateTime = *record.UpdateTime
	}
	return student
}

func studentFromTokenRecord(record *db.StudentTokenRecord) *Student {
	if record == nil {
		return nil
	}
	student := &Student{
		ID:         record.ID,
		Name:       record.Name,
		Phone:      record.Phone,
		Grade:      record.Grade,
		Semester:   record.Semester,
		Subject:    record.Subject,
		Status:     record.Status,
		CreateTime: record.CreateTime,
	}
	if record.UpdateTime != nil {
		student.UpdateTime = *record.UpdateTime
	}
	return student
}
