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

func testService() *Service {
	return NewService(ServiceConfig{
		ManagerStore: &fakeManagerStore{
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
		},
		StudentStore: &fakeStudentStore{
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
		},
		PasswordHasher:  fakeHasher{},
		ManagerResolver: &fakeManagerResolver{claims: map[string]ManagerTokenClaims{}},
		StudentResolver: &fakeStudentResolver{claims: map[string]StudentTokenClaims{}},
		Clock: func() time.Time {
			return time.Unix(1234567890, 0)
		},
	})
}
