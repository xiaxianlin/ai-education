package auth

import (
	"context"
	"crypto/rand"
	"errors"
	"math/big"
	"strings"
	"time"
)

const (
	statusDisabled = 0
	statusEnabled  = 1

	adminManagerType = 1
)

type Clock func() time.Time

type Service struct {
	managerStore    ManagerStore
	managerAdmin    ManagerAdminStore
	studentStore    StudentStore
	passwordHasher  PasswordHasher
	managerResolver TokenResolver[ManagerTokenClaims]
	studentResolver TokenResolver[StudentTokenClaims]
	clock           Clock
	idGenerator     func() (string, error)
	passwordGen     func() (string, error)
}

type ServiceConfig struct {
	ManagerStore    ManagerStore
	ManagerAdmin    ManagerAdminStore
	StudentStore    StudentStore
	PasswordHasher  PasswordHasher
	ManagerResolver TokenResolver[ManagerTokenClaims]
	StudentResolver TokenResolver[StudentTokenClaims]
	Clock           Clock
	IDGenerator     func() (string, error)
	PasswordGen     func() (string, error)
}

func NewService(cfg ServiceConfig) *Service {
	clock := cfg.Clock
	if clock == nil {
		clock = time.Now
	}
	managerAdmin := cfg.ManagerAdmin
	if managerAdmin == nil {
		if store, ok := cfg.ManagerStore.(ManagerAdminStore); ok {
			managerAdmin = store
		}
	}
	idGenerator := cfg.IDGenerator
	if idGenerator == nil {
		idGenerator = newUUIDString
	}
	passwordGen := cfg.PasswordGen
	if passwordGen == nil {
		passwordGen = generateRandomPassword
	}

	return &Service{
		managerStore:    cfg.ManagerStore,
		managerAdmin:    managerAdmin,
		studentStore:    cfg.StudentStore,
		passwordHasher:  cfg.PasswordHasher,
		managerResolver: cfg.ManagerResolver,
		studentResolver: cfg.StudentResolver,
		clock:           clock,
		idGenerator:     idGenerator,
		passwordGen:     passwordGen,
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

func (s *Service) CreateManager(ctx context.Context, req CreateManagerRequest) (string, error) {
	if err := s.ensureManagerAdmin(); err != nil {
		return "", err
	}
	username := strings.TrimSpace(req.Username)
	if username == "" || req.Type < adminManagerType {
		return "", newBadRequestError("请求参数错误", ErrInvalidArgument)
	}
	exists, err := s.managerAdmin.ManagerUsernameExists(ctx, username)
	if err != nil {
		return "", newInternalError("检查账号失败", err)
	}
	if exists {
		return "", newBadRequestError("账号已经存在", ErrDuplicateManager)
	}
	password, err := s.passwordGen()
	if err != nil {
		return "", newInternalError("生成密码失败", err)
	}
	passwordHash, err := s.passwordHasher.Hash(password)
	if err != nil {
		return "", newInternalError("生成密码失败", err)
	}
	id, err := s.idGenerator()
	if err != nil {
		return "", newInternalError("生成账号失败", err)
	}
	now := s.clock().Unix()
	err = s.managerAdmin.CreateManager(ctx, Manager{
		ID:           id,
		Username:     username,
		PasswordHash: passwordHash,
		Type:         req.Type,
		Status:       statusEnabled,
		CreateTime:   now,
		UpdateTime:   now,
	})
	if err != nil {
		return "", newInternalError("创建账号失败", err)
	}
	return password, nil
}

func (s *Service) ListManagers(ctx context.Context) ([]Manager, error) {
	if err := s.ensureManagerAdmin(); err != nil {
		return nil, err
	}
	managers, err := s.managerAdmin.ListManagers(ctx)
	if err != nil {
		return nil, newInternalError("查询账号失败", err)
	}
	return managers, nil
}

func (s *Service) UpdateManager(ctx context.Context, managerID string, req UpdateManagerRequest) error {
	if err := s.ensureManagerAdmin(); err != nil {
		return err
	}
	manager, err := s.getManagerForAdmin(ctx, managerID, "管理员不存在")
	if err != nil {
		return err
	}
	if manager.Type == superManagerType {
		return newForbiddenError("不能修改超级管理员", ErrProtectedManager)
	}
	if req.Type == nil && req.Status == nil {
		return nil
	}
	if req.Type != nil && *req.Type < adminManagerType {
		return newBadRequestError("请求参数错误", ErrInvalidArgument)
	}
	if req.Status != nil && *req.Status != statusDisabled && *req.Status != statusEnabled {
		return newBadRequestError("请求参数错误", ErrInvalidArgument)
	}
	if err := s.managerAdmin.UpdateManager(ctx, manager.ID, req.Type, req.Status, s.clock().Unix()); err != nil {
		if errors.Is(err, ErrManagerNotFound) {
			return newNotFoundError("管理员不存在", err)
		}
		return newInternalError("更新账号失败", err)
	}
	return nil
}

func (s *Service) DeleteManager(ctx context.Context, managerID string) error {
	if err := s.ensureManagerAdmin(); err != nil {
		return err
	}
	manager, err := s.getManagerForAdmin(ctx, managerID, "管理员不存在")
	if err != nil {
		return err
	}
	if manager.Type == superManagerType {
		return newForbiddenError("不能删除超级管理员", ErrProtectedManager)
	}
	if err := s.managerAdmin.DeleteManager(ctx, manager.ID); err != nil {
		if errors.Is(err, ErrManagerNotFound) {
			return newNotFoundError("管理员不存在", err)
		}
		return newInternalError("删除账号失败", err)
	}
	return nil
}

func (s *Service) ResetManagerPassword(ctx context.Context, managerID string) (string, error) {
	if err := s.ensureManagerAdmin(); err != nil {
		return "", err
	}
	manager, err := s.getManagerForAdmin(ctx, managerID, "账号不存在")
	if err != nil {
		return "", err
	}
	if manager.Type == superManagerType {
		return "", newForbiddenError("不能重置超级管理员密码", ErrProtectedManager)
	}
	password, err := s.passwordGen()
	if err != nil {
		return "", newInternalError("生成密码失败", err)
	}
	passwordHash, err := s.passwordHasher.Hash(password)
	if err != nil {
		return "", newInternalError("生成密码失败", err)
	}
	if err := s.managerAdmin.UpdateManagerPassword(ctx, manager.ID, passwordHash, nil, s.clock().Unix()); err != nil {
		if errors.Is(err, ErrManagerNotFound) {
			return "", newNotFoundError("账号不存在", err)
		}
		return "", newInternalError("重置密码失败", err)
	}
	return password, nil
}

func (s *Service) ModifyManagerPassword(ctx context.Context, managerID string, req ModifyPasswordRequest) error {
	if err := s.ensureManagerAdmin(); err != nil {
		return err
	}
	if s.managerResolver == nil {
		return newInternalError("认证服务未配置", nil)
	}
	if req.Origin == "" || req.Password == "" {
		return newBadRequestError("请求参数错误", ErrInvalidArgument)
	}
	manager, err := s.getManagerForAdmin(ctx, managerID, "账号不存在")
	if err != nil {
		return err
	}
	if !s.passwordHasher.Compare(req.Origin, manager.PasswordHash) {
		return newBadRequestError("旧密码错误", ErrInvalidCredentials)
	}
	now := s.clock()
	passwordHash, err := s.passwordHasher.Hash(req.Password)
	if err != nil {
		return newInternalError("生成密码失败", err)
	}
	claims := ManagerTokenClaims{
		ID:         manager.ID,
		UpdateTime: now.Unix(),
	}
	token, err := s.managerResolver.Issue(claims)
	if err != nil {
		return newInternalError("生成登录凭证失败", err)
	}
	if err := s.managerAdmin.UpdateManagerPassword(ctx, manager.ID, passwordHash, &token, now.Unix()); err != nil {
		if errors.Is(err, ErrManagerNotFound) {
			return newNotFoundError("账号不存在", err)
		}
		return newInternalError("修改密码失败", err)
	}
	return nil
}

func (s *Service) ensureManagerAdmin() error {
	if s.managerAdmin == nil || s.passwordHasher == nil {
		return newInternalError("管理员服务未配置", nil)
	}
	return nil
}

func (s *Service) IsManagerAdmin(manager *Manager) bool {
	if manager == nil {
		return false
	}
	return manager.Type == superManagerType || manager.Type == adminManagerType
}

func (s *Service) getManagerForAdmin(ctx context.Context, managerID string, notFoundMessage string) (*Manager, error) {
	managerID = strings.TrimSpace(managerID)
	if managerID == "" {
		return nil, newBadRequestError("请求参数错误", ErrInvalidArgument)
	}
	manager, err := s.managerAdmin.GetManagerByID(ctx, managerID)
	if err != nil || manager == nil {
		if errors.Is(err, ErrManagerNotFound) {
			return nil, newNotFoundError(notFoundMessage, err)
		}
		return nil, newInternalError("查询账号失败", err)
	}
	return manager, nil
}

func generateRandomPassword() (string, error) {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*"
	const length = 12

	password := make([]byte, length)
	max := big.NewInt(int64(len(alphabet)))
	for i := range password {
		n, err := rand.Int(rand.Reader, max)
		if err != nil {
			return "", err
		}
		password[i] = alphabet[n.Int64()]
	}
	return string(password), nil
}
