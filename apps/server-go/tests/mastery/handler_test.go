package mastery_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"ai-education/server-go/internal/mastery"
	"ai-education/server-go/internal/middleware"
)

func TestStudentMasteryRoutesUseInjectedCurrentStudent(t *testing.T) {
	repo := &fakeRepository{}
	service := mastery.NewService(repo)
	currentStudent := mastery.CurrentStudentFunc(func(ctx context.Context, r *http.Request) (string, error) {
		return "student-1", nil
	})

	mux := http.NewServeMux()
	mastery.RegisterStudentRoutes(mux, service, currentStudent)

	req := httptest.NewRequest(http.MethodGet, "/api/student/mastery/weak?threshold=70&limit=3", nil)
	req.Header.Set(middleware.AccessTokenHeader, "token")
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", rec.Code, rec.Body.String())
	}

	var envelope struct {
		Status  int             `json:"status"`
		Message string          `json:"message"`
		Data    json.RawMessage `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("decode envelope: %v", err)
	}
	if envelope.Status != 0 {
		t.Fatalf("status field = %d, want 0", envelope.Status)
	}
	if repo.weakThreshold != 70 || repo.weakLimit != 3 {
		t.Fatalf("weak params = (%v, %d), want (70, 3)", repo.weakThreshold, repo.weakLimit)
	}
}

func TestPracticeStatisticsRoute(t *testing.T) {
	repo := &fakeRepository{}
	service := mastery.NewService(repo)
	currentStudent := mastery.CurrentStudentFunc(func(ctx context.Context, r *http.Request) (string, error) {
		return "student-1", nil
	})

	mux := http.NewServeMux()
	mastery.RegisterStudentRoutes(mux, service, currentStudent)

	req := httptest.NewRequest(http.MethodGet, "/api/student/practice/statistics", nil)
	req.Header.Set(middleware.AccessTokenHeader, "token")
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", rec.Code, rec.Body.String())
	}

	var envelope struct {
		Status int `json:"status"`
		Data   struct {
			AllTime      mastery.Statistics `json:"all_time"`
			Recent30Days mastery.Statistics `json:"recent_30_days"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("decode envelope: %v", err)
	}
	if envelope.Status != 0 {
		t.Fatalf("status field = %d, want 0", envelope.Status)
	}
	if envelope.Data.AllTime.TotalPractices != 1 || envelope.Data.Recent30Days.TotalPractices != 2 {
		t.Fatalf("unexpected statistics payload: %+v", envelope.Data)
	}
}
