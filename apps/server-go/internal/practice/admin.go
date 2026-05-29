package practice

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"ai-education/server-go/internal/middleware"
	"ai-education/server-go/internal/response"
)

type AdminRepository interface {
	ListPractices(ctx context.Context, params PracticeListParams) (PracticeListResult, error)
	GetPracticeDataByID(ctx context.Context, sessionID string) (PracticeData, error)
	DeletePractice(ctx context.Context, sessionID string) error
	ResetPractice(ctx context.Context, sessionID string) error
	ResetPracticeAnswer(ctx context.Context, sessionID string, questionID string) error
}

type AdminHandler struct {
	repo AdminRepository
}

func NewAdminHandler(repo AdminRepository) *AdminHandler {
	return &AdminHandler{repo: repo}
}

func RegisterAdminRoutes(mux *http.ServeMux, repo AdminRepository) {
	handler := NewAdminHandler(repo)

	mux.Handle("GET /api/admin/practice/search", adminProtected(handler.Search))
	mux.Handle("GET /api/admin/practice/{id}", adminProtected(handler.Detail))
	mux.Handle("DELETE /api/admin/practice/{id}", adminProtected(handler.Delete))
	mux.Handle("POST /api/admin/practice/{id}/reset", adminProtected(handler.Reset))
	mux.Handle("POST /api/admin/practice/{id}/answer/{question_id}/reset", adminProtected(handler.ResetAnswer))
}

func (h *AdminHandler) Search(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	size, _ := strconv.Atoi(r.URL.Query().Get("size"))
	status, hasStatus, ok := optionalIntQuery(w, r, "status")
	if !ok {
		return
	}

	params := PracticeListParams{
		StudentID:    r.URL.Query().Get("student_id"),
		PracticeType: r.URL.Query().Get("practice_type"),
		Page:         page,
		PageSize:     size,
	}
	if hasStatus {
		params.Status = &status
	}

	result, err := h.repo.ListPractices(r.Context(), params)
	writeAdminPracticeResult(w, result, err)
}

func (h *AdminHandler) Detail(w http.ResponseWriter, r *http.Request) {
	result, err := h.repo.GetPracticeDataByID(r.Context(), r.PathValue("id"))
	writeAdminPracticeResult(w, result, err)
}

func (h *AdminHandler) Delete(w http.ResponseWriter, r *http.Request) {
	err := h.repo.DeletePractice(r.Context(), r.PathValue("id"))
	writeAdminPracticeResult(w, true, err)
}

func (h *AdminHandler) Reset(w http.ResponseWriter, r *http.Request) {
	err := h.repo.ResetPractice(r.Context(), r.PathValue("id"))
	writeAdminPracticeResult(w, true, err)
}

func (h *AdminHandler) ResetAnswer(w http.ResponseWriter, r *http.Request) {
	err := h.repo.ResetPracticeAnswer(r.Context(), r.PathValue("id"), r.PathValue("question_id"))
	writeAdminPracticeResult(w, true, err)
}

func optionalIntQuery(w http.ResponseWriter, r *http.Request, name string) (int, bool, bool) {
	raw := r.URL.Query().Get(name)
	if raw == "" {
		return 0, false, true
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		response.Error(w, http.StatusBadRequest, name+" 必须是数字")
		return 0, false, false
	}
	return value, true, true
}

func writeAdminPracticeResult(w http.ResponseWriter, data any, err error) {
	if err == nil {
		response.OK(w, data)
		return
	}

	switch {
	case errors.Is(err, ErrInvalidArgument):
		response.Error(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, ErrNotFound):
		response.Error(w, http.StatusNotFound, "练习不存在")
	case errors.Is(err, ErrNotConfigured):
		response.Error(w, http.StatusNotImplemented, "练习模块尚未配置")
	default:
		response.Error(w, http.StatusInternalServerError, err.Error())
	}
}

func adminProtected(handler func(http.ResponseWriter, *http.Request)) http.Handler {
	return middleware.RequireToken(http.HandlerFunc(handler))
}
