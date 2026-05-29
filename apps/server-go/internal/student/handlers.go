package student

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"ai-education/server-go/internal/response"
)

var ErrCurrentStudentUnavailable = errors.New("current student provider is not configured")

type CurrentStudentProvider interface {
	CurrentStudentID(ctx context.Context, r *http.Request) (string, error)
}

type CurrentStudentFunc func(ctx context.Context, r *http.Request) (string, error)

func (f CurrentStudentFunc) CurrentStudentID(ctx context.Context, r *http.Request) (string, error) {
	if f == nil {
		return "", ErrCurrentStudentUnavailable
	}
	return f(ctx, r)
}

type Handler struct {
	service        *Service
	currentStudent CurrentStudentProvider
}

func NewHandler(service *Service, currentStudent CurrentStudentProvider) *Handler {
	return &Handler{
		service:        service,
		currentStudent: currentStudent,
	}
}

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	studentID, ok := h.currentStudentID(w, r)
	if !ok {
		return
	}

	profile, err := h.service.GetProfile(r.Context(), studentID)
	writeStudentResult(w, profile, err)
}

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	studentID, ok := h.currentStudentID(w, r)
	if !ok {
		return
	}

	var req UpdateSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "请求参数错误")
		return
	}

	err := h.service.UpdateSettings(r.Context(), studentID, req)
	writeStudentResult(w, map[string]string{"message": "设置更新成功"}, err)
}

func (h *Handler) currentStudentID(w http.ResponseWriter, r *http.Request) (string, bool) {
	if h == nil || h.currentStudent == nil {
		response.Error(w, http.StatusNotImplemented, "current student provider 尚未配置")
		return "", false
	}

	studentID, err := h.currentStudent.CurrentStudentID(r.Context(), r)
	if err != nil {
		if errors.Is(err, ErrCurrentStudentUnavailable) {
			response.Error(w, http.StatusNotImplemented, "current student provider 尚未配置")
			return "", false
		}
		response.Error(w, http.StatusUnauthorized, "未登录或登录已过期")
		return "", false
	}

	studentID = strings.TrimSpace(studentID)
	if studentID == "" {
		response.Error(w, http.StatusUnauthorized, "未登录或登录已过期")
		return "", false
	}
	return studentID, true
}

func writeStudentResult(w http.ResponseWriter, data any, err error) {
	if err == nil {
		response.OK(w, data)
		return
	}

	switch {
	case errors.Is(err, ErrInvalidArgument):
		response.Error(w, http.StatusBadRequest, "请求参数错误")
	case errors.Is(err, ErrStudentNotFound):
		response.Error(w, http.StatusNotFound, "学生不存在")
	case errors.Is(err, ErrRepositoryUnavailable):
		response.Error(w, http.StatusNotImplemented, "学生资料模块数据源尚未配置")
	default:
		response.Error(w, http.StatusInternalServerError, err.Error())
	}
}
