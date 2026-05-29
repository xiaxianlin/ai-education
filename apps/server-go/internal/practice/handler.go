package practice

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"ai-education/server-go/internal/middleware"
	"ai-education/server-go/internal/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	if service == nil {
		service = NewService(nil, nil, nil)
	}
	return &Handler{service: service}
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	unitID, _ := strconv.ParseInt(r.URL.Query().Get("unit_id"), 10, 64)
	result, err := h.service.Get(
		r.Context(),
		studentIDFromRequest(r),
		r.URL.Query().Get("practice_type"),
		r.URL.Query().Get("ability_code"),
		unitID,
	)
	writeResult(w, result, err)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreatePracticeRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	result, err := h.service.Create(r.Context(), studentIDFromRequest(r), req)
	writeResult(w, result, err)
}

func (h *Handler) Records(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
	result, err := h.service.Records(r.Context(), PracticeListParams{
		StudentID: studentIDFromRequest(r),
		Subject:   r.URL.Query().Get("subject"),
		Grade:     atoiDefault(r.URL.Query().Get("grade"), 0),
		Page:      page,
		PageSize:  pageSize,
	})
	writeResult(w, result, err)
}

func (h *Handler) Detail(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.Detail(r.Context(), studentIDFromRequest(r), r.PathValue("session_id"))
	writeResult(w, result, err)
}

func (h *Handler) Begin(w http.ResponseWriter, r *http.Request) {
	err := h.service.Begin(r.Context(), studentIDFromRequest(r), r.PathValue("session_id"))
	writeResult(w, map[string]string{"message": "练习已开始"}, err)
}

func (h *Handler) Complete(w http.ResponseWriter, r *http.Request) {
	reportID, err := h.service.Complete(r.Context(), studentIDFromRequest(r), r.PathValue("session_id"))
	writeResult(w, map[string]int64{"report_id": reportID}, err)
}

func (h *Handler) SubmitAnswer(w http.ResponseWriter, r *http.Request) {
	var req SubmitAnswerRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	result, err := h.service.SubmitAnswer(r.Context(), studentIDFromRequest(r), req)
	writeResult(w, result, err)
}

func (h *Handler) Progress(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.Progress(r.Context(), studentIDFromRequest(r), r.PathValue("session_id"))
	writeResult(w, result, err)
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	defer r.Body.Close()
	if err := json.NewDecoder(r.Body).Decode(target); err != nil {
		response.Error(w, http.StatusBadRequest, "请求参数格式错误")
		return false
	}
	return true
}

func writeResult(w http.ResponseWriter, data any, err error) {
	if err == nil {
		response.OK(w, data)
		return
	}

	switch {
	case errors.Is(err, ErrInvalidArgument):
		response.Error(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, ErrNotFound):
		response.Error(w, http.StatusNotFound, "练习不存在")
	case errors.Is(err, ErrForbidden):
		response.Error(w, http.StatusForbidden, "无权操作此练习")
	case errors.Is(err, ErrConflict):
		response.Error(w, http.StatusConflict, err.Error())
	case errors.Is(err, ErrNotConfigured):
		response.Error(w, http.StatusNotImplemented, "练习模块尚未配置")
	default:
		response.Error(w, http.StatusInternalServerError, err.Error())
	}
}

func studentIDFromRequest(r *http.Request) string {
	studentID := r.Header.Get("x-student-id")
	if studentID != "" {
		return studentID
	}
	return r.Header.Get(middleware.AccessTokenHeader)
}

func atoiDefault(raw string, fallback int) int {
	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}
