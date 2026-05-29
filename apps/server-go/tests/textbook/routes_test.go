package textbook_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"ai-education/server-go/internal/textbook"
)

type fakeRepository struct {
	textbook.NotImplementedRepository
	units []textbook.Unit
}

func (f fakeRepository) ListUnitsByTextbook(ctx context.Context, textbookID int64) ([]textbook.Unit, error) {
	return f.units, nil
}

func TestStudentUnitsRoute(t *testing.T) {
	mux := http.NewServeMux()
	textbook.RegisterRoutes(mux, fakeRepository{
		units: []textbook.Unit{
			{ID: 1, TextbookID: 12, Name: "第一单元", Content: "内容"},
		},
	})

	req := httptest.NewRequest(http.MethodGet, "/api/student/textbook/12/units", nil)
	req.Header.Set("x-access-token", "token")
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
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

	var units []textbook.Unit
	if err := json.Unmarshal(envelope.Data, &units); err != nil {
		t.Fatalf("decode units: %v", err)
	}
	if len(units) != 1 || units[0].Name != "第一单元" {
		t.Fatalf("unexpected units: %+v", units)
	}
}

func TestUploadRouteReturnsNotImplemented(t *testing.T) {
	mux := http.NewServeMux()
	textbook.RegisterRoutes(mux, fakeRepository{})

	req := httptest.NewRequest(http.MethodPost, "/api/admin/textbook/1/upload", nil)
	req.Header.Set("x-access-token", "token")
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}

	var envelope struct {
		Status  int    `json:"status"`
		Message string `json:"message"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("decode envelope: %v", err)
	}
	if envelope.Status != http.StatusNotImplemented {
		t.Fatalf("status field = %d, want %d", envelope.Status, http.StatusNotImplemented)
	}
}
