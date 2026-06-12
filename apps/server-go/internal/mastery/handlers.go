package mastery

import (
	"context"
	"errors"
	"net/http"
	"strconv"
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

func (h *Handler) ListMastery(w http.ResponseWriter, r *http.Request) {
	studentID, ok := h.currentStudentID(w, r)
	if !ok {
		return
	}

	filter, err := parseMasteryFilter(r)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	items, err := h.service.ListMastery(r.Context(), studentID, filter)
	writeResult(w, items, err)
}

func (h *Handler) ListWeakMastery(w http.ResponseWriter, r *http.Request) {
	studentID, ok := h.currentStudentID(w, r)
	if !ok {
		return
	}

	threshold, limit, err := parseWeakParams(r)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	items, err := h.service.ListWeakMastery(r.Context(), studentID, threshold, limit)
	writeResult(w, items, err)
}

func (h *Handler) GetSummary(w http.ResponseWriter, r *http.Request) {
	studentID, ok := h.currentStudentID(w, r)
	if !ok {
		return
	}

	summary, err := h.service.GetSummary(r.Context(), studentID)
	writeResult(w, summary, err)
}

func (h *Handler) GetPracticeStatistics(w http.ResponseWriter, r *http.Request) {
	studentID, ok := h.currentStudentID(w, r)
	if !ok {
		return
	}

	stats, err := h.service.GetPracticeStatistics(r.Context(), studentID)
	writeResult(w, stats, err)
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

func parseMasteryFilter(r *http.Request) (MasteryFilter, error) {
	query := r.URL.Query()
	var filter MasteryFilter

	if rawSubject := strings.TrimSpace(query.Get("subject")); rawSubject != "" {
		filter.Subject = &rawSubject
	}

	if rawGrade := strings.TrimSpace(query.Get("grade")); rawGrade != "" {
		grade, err := strconv.Atoi(rawGrade)
		if err != nil {
			return MasteryFilter{}, errors.New("grade 必须是数字")
		}
		filter.Grade = &grade
	}

	return filter, nil
}

func parseWeakParams(r *http.Request) (float64, int, error) {
	query := r.URL.Query()
	threshold := defaultWeakThreshold
	limit := defaultWeakLimit

	if rawThreshold := strings.TrimSpace(query.Get("threshold")); rawThreshold != "" {
		value, err := strconv.ParseFloat(rawThreshold, 64)
		if err != nil {
			return 0, 0, errors.New("threshold 必须是数字")
		}
		threshold = value
	}

	if rawLimit := strings.TrimSpace(query.Get("limit")); rawLimit != "" {
		value, err := strconv.Atoi(rawLimit)
		if err != nil {
			return 0, 0, errors.New("limit 必须是数字")
		}
		limit = value
	}

	if limit < 1 || limit > maxWeakLimit {
		return 0, 0, errors.New("limit 必须在 1 到 20 之间")
	}

	return threshold, limit, nil
}

func writeResult(w http.ResponseWriter, data any, err error) {
	if err == nil {
		response.OK(w, data)
		return
	}

	switch {
	case errors.Is(err, ErrInvalidArgument):
		response.Error(w, http.StatusBadRequest, "请求参数错误")
	case errors.Is(err, ErrRepositoryUnavailable), errors.Is(err, ErrNotImplemented):
		response.Error(w, http.StatusNotImplemented, "掌握度与统计模块数据源尚未配置")
	default:
		response.Error(w, http.StatusInternalServerError, err.Error())
	}
}
