package ability_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"ai-education/server-go/internal/ability"
	"ai-education/server-go/internal/middleware"
	"ai-education/server-go/internal/response"
)

func TestStudentAtomicsHandler(t *testing.T) {
	repo := newFakeRepository()
	repo.seed(ability.Ability{ID: 1, Subject: "数学", Grade: 4, Code: "calc", Name: "计算", Difficulty: 1, IsActive: 1})
	repo.seed(ability.Ability{ID: 2, Subject: "数学", Grade: 4, Code: "inactive", Name: "未启用", Difficulty: 1, IsActive: 0})

	mux := http.NewServeMux()
	ability.RegisterStudentRoutes(mux, ability.NewService(repo))

	req := httptest.NewRequest(http.MethodGet, "/api/student/ability/atomics?subject=数学&grade=4", nil)
	req.Header.Set(middleware.AccessTokenHeader, "student-token")
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", rec.Code, rec.Body.String())
	}

	var envelope response.Envelope
	if err := json.Unmarshal(rec.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("response JSON error: %v", err)
	}
	if envelope.Status != 0 {
		t.Fatalf("envelope status = %d, want 0", envelope.Status)
	}

	items, ok := envelope.Data.([]any)
	if !ok {
		t.Fatalf("data type = %T, want []any", envelope.Data)
	}
	if len(items) != 1 {
		t.Fatalf("handler returned %d items, want 1", len(items))
	}
}
