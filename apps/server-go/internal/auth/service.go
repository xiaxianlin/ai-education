package auth

import (
	"context"
	"errors"
	"strings"
	"time"
)

const (
	statusDisabled = 0
)

type Clock func() time.Time

type Service struct {
	managerStore    ManagerStore
	studentStore    StudentStore
	passwordHasher  PasswordHasher
	managerResolver TokenResolver[ManagerTokenClaims]
	studentResolver TokenResolver[StudentTokenClaims]
	clock           Clock
}

type ServiceConfig struct {
	ManagerStore    ManagerStore
	StudentStore    StudentStore
	PasswordHasher  PasswordHasher
	ManagerResolver TokenResolver[ManagerTokenClaims]
	StudentResolver TokenResolver[StudentTokenClaims]
	Clock           Clock
}

func NewService(cfg ServiceConfig) *Service {
	clock := cfg.Clock
	if clock == nil {
		clock = time.Now
	}

	return &Service{
		managerStore:    cfg.ManagerStore,
		studentStore:    cfg.StudentStore,
		passwordHasher:  cfg.PasswordHasher,
		managerResolver: cfg.ManagerResolver,
		studentResolver: cfg.StudentResolver,
		clock:           clock,
	}
}

func (s *Service) AdminLogin(ctx context.Context, username string, password string) (string, error) {
	if strings.TrimSpace(username) == "" || password == "" {
		return "", newBadRequestError("用户名或密码错误", ErrInvalidCredentials)
	}
	if s.managerStore == nil || s.passwordHasher == nil || s.managerResolver == nil {
		return "", newInternalError("认证服务未配置", nil)
	}

	manager, err := s.managerStore.FindManagerByUsername(ctx, username)
	if err != nil || manager == nil {
		return "", newAuthError("用户名或密码错误", errors.Join(ErrInvalidCredentials, err))
	}
	if !s.passwordHasher.Compare(password, manager.PasswordHash) {
		return "", newAuthError("用户名或密码错误", ErrInvalidCredentials)
	}
	if manager.Status == statusDisabled {
		return "", newAuthError("账号被禁用", ErrAccountDisabled)
	}

	now := s.clock()
	claims := ManagerTokenClaims{
		ID:         manager.ID,
		UpdateTime: now.Unix(),
	}
	token, err := s.managerResolver.Issue(claims)
	if err != nil {
		return "", newInternalError("生成登录凭证失败", err)
	}
	if err := s.managerStore.SaveManagerToken(ctx, manager.ID, token, now); err != nil {
		return "", newInternalError("保存登录凭证失败", err)
	}

	return token, nil
}

func (s *Service) StudentLogin(ctx context.Context, phone string, password string) (string, error) {
	if strings.TrimSpace(phone) == "" || password == "" {
		return "", newBadRequestError("手机号或密码错误", ErrInvalidCredentials)
	}
	if s.studentStore == nil || s.passwordHasher == nil || s.studentResolver == nil {
		return "", newInternalError("认证服务未配置", nil)
	}

	student, err := s.studentStore.FindStudentByPhone(ctx, phone)
	if err != nil || student == nil {
		return "", newAuthError("手机号或密码错误", errors.Join(ErrInvalidCredentials, err))
	}
	if !s.passwordHasher.Compare(password, student.PasswordHash) {
		return "", newAuthError("手机号或密码错误", ErrInvalidCredentials)
	}
	if student.Status == statusDisabled {
		return "", newAuthError("账号被禁用", ErrAccountDisabled)
	}

	now := s.clock()
	claims := StudentTokenClaims{
		ID:         student.ID,
		UpdateTime: now.Unix(),
	}
	token, err := s.studentResolver.Issue(claims)
	if err != nil {
		return "", newInternalError("生成登录凭证失败", err)
	}
	if err := s.studentStore.SaveStudentToken(ctx, student.ID, token, now); err != nil {
		return "", newInternalError("保存登录凭证失败", err)
	}

	return token, nil
}

func (s *Service) CheckAdmin(ctx context.Context, token string) (*Manager, error) {
	if strings.TrimSpace(token) == "" {
		return nil, newAuthError("登录失效", ErrMissingToken)
	}
	if s.managerStore == nil || s.managerResolver == nil {
		return nil, newInternalError("认证服务未配置", nil)
	}

	claims, err := s.managerResolver.Resolve(token)
	if err != nil || claims.ID == "" {
		return nil, newAuthError("登录失效", errors.Join(ErrInvalidToken, err))
	}

	manager, err := s.managerStore.FindManagerByToken(ctx, token)
	if err != nil || manager == nil || manager.ID != claims.ID {
		return nil, newAuthError("登录失效", errors.Join(ErrInvalidToken, err))
	}
	if manager.Status == statusDisabled {
		return nil, newAuthError("账号被禁用", ErrAccountDisabled)
	}

	return manager, nil
}

func (s *Service) CheckStudent(ctx context.Context, token string) (*Student, error) {
	if strings.TrimSpace(token) == "" {
		return nil, newAuthError("登录失效", ErrMissingToken)
	}
	if s.studentStore == nil || s.studentResolver == nil {
		return nil, newInternalError("认证服务未配置", nil)
	}

	claims, err := s.studentResolver.Resolve(token)
	if err != nil || claims.ID == "" {
		return nil, newAuthError("登录失效", errors.Join(ErrInvalidToken, err))
	}

	student, err := s.studentStore.FindStudentByToken(ctx, token)
	if err != nil || student == nil || student.ID != claims.ID {
		return nil, newAuthError("登录失效", errors.Join(ErrInvalidToken, err))
	}
	if student.Status == statusDisabled {
		return nil, newAuthError("账号被禁用", ErrAccountDisabled)
	}

	return student, nil
}
