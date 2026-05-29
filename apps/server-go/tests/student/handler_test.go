package student_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"ai-education/server-go/internal/middleware"
	"ai-education/server-go/internal/student"
)

func TestStudentProfileRoutesUseInjectedCurrentStudent(t *testing.T) {
	grade := 4
	semester := "上学期"
	subject := "数学"
	repo := &fakeRepository{
		profile: &student.Profile{
			Name:     "小明",
			Phone:    "13800138000",
			Grade:    &grade,
			Semester: &semester,
			Subject:  &subject,
			Textbooks: []student.Textbook{
				{ID: 7, Subject: "数学", Version: "人教版", Grade: 4, Semester: "上学期", IsParsed: 1},
			},
		},
	}

	mux := http.NewServeMux()
	student.RegisterStudentRoutes(mux, student.NewService(repo), student.CurrentStudentFunc(func(ctx context.Context, r *http.Request) (string, error) {
		return "student-1", nil
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/student/profile", nil)
	req.Header.Set(middleware.AccessTokenHeader, "token")
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", rec.Code, rec.Body.String())
	}

	var envelope struct {
		Status int             `json:"status"`
		Data   student.Profile `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if envelope.Status != 0 || envelope.Data.Name != "小明" || len(envelope.Data.Textbooks) != 1 {
		t.Fatalf("unexpected profile response: %+v", envelope)
	}
	if repo.profileStudentID != "student-1" {
		t.Fatalf("profile student id = %q, want student-1", repo.profileStudentID)
	}
}

func TestUpdateProfileRoute(t *testing.T) {
	repo := &fakeRepository{profile: &student.Profile{}}
	mux := http.NewServeMux()
	student.RegisterStudentRoutes(mux, student.NewService(repo), student.CurrentStudentFunc(func(ctx context.Context, r *http.Request) (string, error) {
		return "student-1", nil
	}))

	body := strings.NewReader(`{"grade":5,"semester":"下学期","subject":"语文"}`)
	req := httptest.NewRequest(http.MethodPut, "/api/student/profile", body)
	req.Header.Set(middleware.AccessTokenHeader, "token")
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", rec.Code, rec.Body.String())
	}

	var envelope struct {
		Status int `json:"status"`
		Data   struct {
			Message string `json:"message"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if envelope.Status != 0 || envelope.Data.Message != "设置更新成功" {
		t.Fatalf("unexpected update response: %+v", envelope)
	}
	if repo.settingsStudentID != "student-1" || repo.settings.Grade != 5 || repo.settings.Subject != "语文" {
		t.Fatalf("unexpected stored settings: studentID=%q settings=%+v", repo.settingsStudentID, repo.settings)
	}
}

func TestStudentProfileRouteRequiresToken(t *testing.T) {
	mux := http.NewServeMux()
	student.RegisterStudentRoutes(mux, student.NewService(&fakeRepository{}), student.CurrentStudentFunc(func(ctx context.Context, r *http.Request) (string, error) {
		return "student-1", nil
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/student/profile", nil)
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	var envelope struct {
		Status int `json:"status"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if envelope.Status != http.StatusUnauthorized {
		t.Fatalf("envelope status = %d, want 401", envelope.Status)
	}
}

func TestAdminStudentRoutesSearchAndMasterySummary(t *testing.T) {
	mux := http.NewServeMux()
	repo := &fakeAdminRepository{}
	service := student.NewAdminServiceWithOptions(repo, fakePasswordHasher{}, nil, nil, nil)
	student.RegisterAdminRoutes(mux, service, func(next http.Handler) http.Handler { return next })

	searchReq := httptest.NewRequest(http.MethodGet, "/api/admin/student/search?keywords=小明&page=2&size=10", nil)
	searchRec := httptest.NewRecorder()
	mux.ServeHTTP(searchRec, searchReq)

	var searchEnvelope struct {
		Status int `json:"status"`
		Data   struct {
			Total int `json:"total"`
		} `json:"data"`
	}
	if err := json.Unmarshal(searchRec.Body.Bytes(), &searchEnvelope); err != nil {
		t.Fatalf("decode search response: %v", err)
	}
	if searchEnvelope.Status != 0 {
		t.Fatalf("unexpected search response: %+v body=%s", searchEnvelope, searchRec.Body.String())
	}

	summaryReq := httptest.NewRequest(http.MethodGet, "/api/admin/student/student-1/mastery/summary", nil)
	summaryRec := httptest.NewRecorder()
	mux.ServeHTTP(summaryRec, summaryReq)

	var summaryEnvelope struct {
		Status int                           `json:"status"`
		Data   student.StudentMasterySummary `json:"data"`
	}
	if err := json.Unmarshal(summaryRec.Body.Bytes(), &summaryEnvelope); err != nil {
		t.Fatalf("decode summary response: %v", err)
	}
	if summaryEnvelope.Status != 0 || summaryEnvelope.Data.TotalAbilities != 1 || summaryEnvelope.Data.LevelDistribution["mastered"] != 1 {
		t.Fatalf("unexpected summary response: %+v", summaryEnvelope)
	}
}

func TestAdminStudentTextbookConfigRoute(t *testing.T) {
	mux := http.NewServeMux()
	repo := &fakeAdminRepository{}
	service := student.NewAdminServiceWithOptions(repo, fakePasswordHasher{}, func() int64 { return 456 }, nil, nil)
	student.RegisterAdminRoutes(mux, service, func(next http.Handler) http.Handler { return next })

	req := httptest.NewRequest(http.MethodPost, "/api/admin/student/student-1/textbook-config", strings.NewReader(`{"textbook_id":7}`))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	var envelope struct {
		Status int                           `json:"status"`
		Data   student.StudentTextbookConfig `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if envelope.Status != 0 || envelope.Data.StudentID != "student-1" || envelope.Data.TextbookID != 7 {
		t.Fatalf("unexpected config response: %+v body=%s", envelope, rec.Body.String())
	}
}
