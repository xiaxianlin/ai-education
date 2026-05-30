package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

type fakeHasher struct{}

func (fakeHasher) Hash(plain string) (string, error) {
	return "hash:" + plain, nil
}

func (fakeHasher) Compare(plain string, hashed string) bool {
	return hashed == "hash:"+plain
}

type fakeManagerResolver struct {
	claims map[string]ManagerTokenClaims
}

func (r *fakeManagerResolver) Issue(claims ManagerTokenClaims) (string, error) {
	token := "manager:" + claims.ID
	r.claims[token] = claims
	return token, nil
}

func (r *fakeManagerResolver) Resolve(token string) (ManagerTokenClaims, error) {
	claims, ok := r.claims[token]
	if !ok {
		return ManagerTokenClaims{}, errors.New("unknown token")
	}
	return claims, nil
}

type fakeStudentResolver struct {
	claims map[string]StudentTokenClaims
}

func (r *fakeStudentResolver) Issue(claims StudentTokenClaims) (string, error) {
	token := "student:" + claims.ID
	r.claims[token] = claims
	return token, nil
}

func (r *fakeStudentResolver) Resolve(token string) (StudentTokenClaims, error) {
	claims, ok := r.claims[token]
	if !ok {
		return StudentTokenClaims{}, errors.New("unknown token")
	}
	return claims, nil
}

type fakeManagerStore struct {
	byUsername map[string]*Manager
	byToken    map[string]*Manager
}

func (s *fakeManagerStore) FindManagerByUsername(_ context.Context, username string) (*Manager, error) {
	manager, ok := s.byUsername[username]
	if !ok {
		return nil, errors.New("not found")
	}
	return manager, nil
}

func (s *fakeManagerStore) FindManagerByToken(_ context.Context, token string) (*Manager, error) {
	manager, ok := s.byToken[token]
	if !ok {
		return nil, errors.New("not found")
	}
	return manager, nil
}

func (s *fakeManagerStore) SaveManagerToken(_ context.Context, managerID string, token string, updateTime time.Time) error {
	for _, manager := range s.byUsername {
		if manager.ID == managerID {
			manager.Token = token
			manager.UpdateTime = updateTime.Unix()
			s.byToken[token] = manager
			return nil
		}
	}
	return errors.New("not found")
}

func (s *fakeManagerStore) GetManagerByID(_ context.Context, managerID string) (*Manager, error) {
	for _, manager := range s.byUsername {
		if manager.ID == managerID {
			return manager, nil
		}
	}
	return nil, ErrManagerNotFound
}

func (s *fakeManagerStore) ManagerUsernameExists(_ context.Context, username string) (bool, error) {
	_, ok := s.byUsername[username]
	return ok, nil
}

func (s *fakeManagerStore) CreateManager(_ context.Context, manager Manager) error {
	if _, ok := s.byUsername[manager.Username]; ok {
		return ErrDuplicateManager
	}
	copy := manager
	s.byUsername[manager.Username] = &copy
	return nil
}

func (s *fakeManagerStore) UpdateManager(_ context.Context, managerID string, managerType *int, status *int, updateTime int64) error {
	manager, err := s.GetManagerByID(context.Background(), managerID)
	if err != nil {
		return err
	}
	if managerType != nil {
		manager.Type = *managerType
	}
	if status != nil {
		manager.Status = *status
	}
	manager.UpdateTime = updateTime
	return nil
}

func (s *fakeManagerStore) DeleteManager(_ context.Context, managerID string) error {
	for username, manager := range s.byUsername {
		if manager.ID == managerID {
			delete(s.byUsername, username)
			if manager.Token != "" {
				delete(s.byToken, manager.Token)
			}
			return nil
		}
	}
	return ErrManagerNotFound
}

func (s *fakeManagerStore) UpdateManagerPassword(_ context.Context, managerID string, passwordHash string, token *string, updateTime int64) error {
	manager, err := s.GetManagerByID(context.Background(), managerID)
	if err != nil {
		return err
	}
	manager.PasswordHash = passwordHash
	if token != nil {
		if manager.Token != "" {
			delete(s.byToken, manager.Token)
		}
		manager.Token = *token
		s.byToken[*token] = manager
	}
	manager.UpdateTime = updateTime
	return nil
}

func (s *fakeManagerStore) ListManagers(_ context.Context) ([]Manager, error) {
	managers := make([]Manager, 0, len(s.byUsername))
	for _, manager := range s.byUsername {
		managers = append(managers, *manager)
	}
	return managers, nil
}

type fakeStudentStore struct {
	byPhone map[string]*Student
	byToken map[string]*Student
}

func (s *fakeStudentStore) FindStudentByPhone(_ context.Context, phone string) (*Student, error) {
	student, ok := s.byPhone[phone]
	if !ok {
		return nil, errors.New("not found")
	}
	return student, nil
}

func (s *fakeStudentStore) FindStudentByToken(_ context.Context, token string) (*Student, error) {
	student, ok := s.byToken[token]
	if !ok {
		return nil, errors.New("not found")
	}
	return student, nil
}

func (s *fakeStudentStore) SaveStudentToken(_ context.Context, studentID string, token string, updateTime time.Time) error {
	for _, student := range s.byPhone {
		if student.ID == studentID {
			student.Token = token
			student.UpdateTime = updateTime.Unix()
			s.byToken[token] = student
			return nil
		}
	}
	return errors.New("not found")
}

func TestAdminLoginAndCheck(t *testing.T) {
	t.Parallel()

	service := testService()

	token, err := service.AdminLogin(context.Background(), "admin", "Secret123!")
	if err != nil {
		t.Fatalf("AdminLogin returned error: %v", err)
	}
	if token != "manager:manager-1" {
		t.Fatalf("unexpected token: %s", token)
	}

	manager, err := service.CheckAdmin(context.Background(), token)
	if err != nil {
		t.Fatalf("CheckAdmin returned error: %v", err)
	}
	if manager.ID != "manager-1" || manager.Username != "admin" {
		t.Fatalf("unexpected manager: %#v", manager)
	}
}

func TestStudentLoginAndCheck(t *testing.T) {
	t.Parallel()

	service := testService()

	token, err := service.StudentLogin(context.Background(), "13800138000", "Secret123!")
	if err != nil {
		t.Fatalf("StudentLogin returned error: %v", err)
	}
	if token != "student:student-1" {
		t.Fatalf("unexpected token: %s", token)
	}

	student, err := service.CheckStudent(context.Background(), token)
	if err != nil {
		t.Fatalf("CheckStudent returned error: %v", err)
	}
	if student.ID != "student-1" || student.Phone != "13800138000" {
		t.Fatalf("unexpected student: %#v", student)
	}
}

func TestRegisterRoutesUseEnvelopeAndAccessTokenHeader(t *testing.T) {
	t.Parallel()

	mux := http.NewServeMux()
	handler := NewHandler(testService())
	RegisterAdminRoutes(mux, handler)
	RegisterStudentRoutes(mux, handler)

	loginReq := httptest.NewRequest(http.MethodPost, "/api/admin/login", bytes.NewBufferString(`{"username":"admin","password":"Secret123!"}`))
	loginReq.Header.Set("Content-Type", "application/json")
	loginRec := httptest.NewRecorder()
	mux.ServeHTTP(loginRec, loginReq)

	if loginRec.Code != http.StatusOK {
		t.Fatalf("unexpected HTTP status: %d", loginRec.Code)
	}

	var loginEnvelope struct {
		Status  int    `json:"status"`
		Message string `json:"message"`
		Data    string `json:"data"`
	}
	if err := json.NewDecoder(loginRec.Body).Decode(&loginEnvelope); err != nil {
		t.Fatalf("decode login envelope: %v", err)
	}
	if loginEnvelope.Status != 0 || loginEnvelope.Data != "manager:manager-1" {
		t.Fatalf("unexpected login envelope: %#v", loginEnvelope)
	}

	checkReq := httptest.NewRequest(http.MethodGet, "/api/admin/check", nil)
	checkReq.Header.Set("x-access-token", loginEnvelope.Data)
	checkRec := httptest.NewRecorder()
	mux.ServeHTTP(checkRec, checkReq)

	var checkEnvelope struct {
		Status int     `json:"status"`
		Data   Manager `json:"data"`
	}
	if err := json.NewDecoder(checkRec.Body).Decode(&checkEnvelope); err != nil {
		t.Fatalf("decode check envelope: %v", err)
	}
	if checkEnvelope.Status != 0 || checkEnvelope.Data.ID != "manager-1" {
		t.Fatalf("unexpected check envelope: %#v", checkEnvelope)
	}
}

func TestMissingTokenReturnsEnvelopeUnauthorized(t *testing.T) {
	t.Parallel()

	mux := http.NewServeMux()
	RegisterStudentRoutes(mux, NewHandler(testService()))

	req := httptest.NewRequest(http.MethodGet, "/api/student/check", nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("unexpected HTTP status: %d", rec.Code)
	}

	var envelope struct {
		Status  int    `json:"status"`
		Message string `json:"message"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&envelope); err != nil {
		t.Fatalf("decode envelope: %v", err)
	}
	if envelope.Status != statusUnauthorized || envelope.Message != "登录失效" {
		t.Fatalf("unexpected envelope: %#v", envelope)
	}
}

func TestTeacherCannotUseManagerAdminRoutes(t *testing.T) {
	t.Parallel()

	service, managerStore, _ := testServiceWithStores()
	managerStore.byUsername["teacher"] = &Manager{
		ID:           "teacher-1",
		Username:     "teacher",
		PasswordHash: "hash:Secret123!",
		Type:         2,
		Status:       statusEnabled,
		CreateTime:   100,
	}

	token, err := service.AdminLogin(context.Background(), "teacher", "Secret123!")
	if err != nil {
		t.Fatalf("AdminLogin returned error: %v", err)
	}

	mux := http.NewServeMux()
	RegisterAdminRoutes(mux, NewHandler(service))

	req := httptest.NewRequest(http.MethodGet, "/api/admin/manager/all", nil)
	req.Header.Set("x-access-token", token)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("unexpected HTTP status: %d", rec.Code)
	}

	var envelope struct {
		Status  int    `json:"status"`
		Message string `json:"message"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&envelope); err != nil {
		t.Fatalf("decode envelope: %v", err)
	}
	if envelope.Status != statusForbidden || envelope.Message != "权限不足" {
		t.Fatalf("unexpected envelope: %#v", envelope)
	}
}

func TestManagerAdminServiceLifecycle(t *testing.T) {
	service, managerStore, _ := testServiceWithStores()

	password, err := service.CreateManager(context.Background(), CreateManagerRequest{
		Username: "teacher",
		Type:     2,
	})
	if err != nil {
		t.Fatalf("CreateManager returned error: %v", err)
	}
	if password != "Generated123!" {
		t.Fatalf("unexpected generated password: %q", password)
	}
	teacher := managerStore.byUsername["teacher"]
	if teacher == nil || teacher.Status != statusEnabled || teacher.PasswordHash != "hash:Generated123!" {
		t.Fatalf("unexpected created manager: %#v", teacher)
	}

	managers, err := service.ListManagers(context.Background())
	if err != nil {
		t.Fatalf("ListManagers returned error: %v", err)
	}
	if len(managers) != 2 {
		t.Fatalf("unexpected manager count: %d", len(managers))
	}

	disabled := statusDisabled
	if err := service.UpdateManager(context.Background(), teacher.ID, UpdateManagerRequest{Status: &disabled}); err != nil {
		t.Fatalf("disable manager: %v", err)
	}
	if teacher.Status != statusDisabled {
		t.Fatalf("manager was not disabled: %#v", teacher)
	}
	enabled := statusEnabled
	if err := service.UpdateManager(context.Background(), teacher.ID, UpdateManagerRequest{Status: &enabled}); err != nil {
		t.Fatalf("enable manager: %v", err)
	}
	if teacher.Status != statusEnabled {
		t.Fatalf("manager was not enabled: %#v", teacher)
	}

	resetPassword, err := service.ResetManagerPassword(context.Background(), teacher.ID)
	if err != nil {
		t.Fatalf("ResetManagerPassword returned error: %v", err)
	}
	if resetPassword != "Generated123!" || teacher.PasswordHash != "hash:Generated123!" {
		t.Fatalf("unexpected reset password state: password=%q manager=%#v", resetPassword, teacher)
	}

	err = service.ModifyManagerPassword(context.Background(), "manager-1", ModifyPasswordRequest{
		Origin:   "Secret123!",
		Password: "NewSecret123!",
	})
	if err != nil {
		t.Fatalf("ModifyManagerPassword returned error: %v", err)
	}
	admin := managerStore.byUsername["admin"]
	if admin.PasswordHash != "hash:NewSecret123!" || admin.Token == "" {
		t.Fatalf("unexpected modified admin: %#v", admin)
	}
}

func TestManagerTypeZeroIsProtectedFromAdminMutations(t *testing.T) {
	service := testService()

	status := statusDisabled
	if err := service.UpdateManager(context.Background(), "manager-1", UpdateManagerRequest{Status: &status}); err == nil {
		t.Fatal("UpdateManager expected protected manager error")
	}
	if err := service.DeleteManager(context.Background(), "manager-1"); err == nil {
		t.Fatal("DeleteManager expected protected manager error")
	}
	if _, err := service.ResetManagerPassword(context.Background(), "manager-1"); err == nil {
		t.Fatal("ResetManagerPassword expected protected manager error")
	}
}

func testService() *Service {
	service, _, _ := testServiceWithStores()
	return service
}

func testServiceWithStores() (*Service, *fakeManagerStore, *fakeStudentStore) {
	managerStore := &fakeManagerStore{
		byUsername: map[string]*Manager{
			"admin": {
				ID:           "manager-1",
				Username:     "admin",
				PasswordHash: "hash:Secret123!",
				Type:         0,
				Status:       1,
				CreateTime:   100,
			},
		},
		byToken: map[string]*Manager{},
	}
	studentStore := &fakeStudentStore{
		byPhone: map[string]*Student{
			"13800138000": {
				ID:           "student-1",
				Name:         "张三",
				Phone:        "13800138000",
				PasswordHash: "hash:Secret123!",
				Status:       1,
				CreateTime:   100,
			},
		},
		byToken: map[string]*Student{},
	}
	return NewService(ServiceConfig{
		ManagerStore:    managerStore,
		ManagerAdmin:    managerStore,
		StudentStore:    studentStore,
		PasswordHasher:  fakeHasher{},
		ManagerResolver: &fakeManagerResolver{claims: map[string]ManagerTokenClaims{}},
		StudentResolver: &fakeStudentResolver{claims: map[string]StudentTokenClaims{}},
		Clock: func() time.Time {
			return time.Unix(1234567890, 0)
		},
		IDGenerator: func() (string, error) {
			return "manager-2", nil
		},
		PasswordGen: func() (string, error) {
			return "Generated123!", nil
		},
	}), managerStore, studentStore
}
