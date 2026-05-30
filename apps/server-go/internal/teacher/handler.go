package teacher

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"ai-education/server-go/internal/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) SearchTeachers(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	req := SearchTeachersRequest{
		Page:     queryInt(query.Get("page"), 1),
		Size:     queryInt(firstNonEmpty(query.Get("size"), query.Get("page_size")), 20),
		Keywords: firstNonEmpty(query.Get("keywords"), query.Get("keyword")),
		Subject:  query.Get("subject"),
	}
	if raw := query.Get("status"); raw != "" {
		status, err := strconv.Atoi(raw)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "请求参数错误")
			return
		}
		req.Status = &status
	}
	result, err := h.service.SearchTeachers(r.Context(), req)
	writeResult(w, result, err)
}

func (h *Handler) CreateTeacher(w http.ResponseWriter, r *http.Request) {
	var req SaveTeacherRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	password, err := h.service.CreateTeacher(r.Context(), req)
	writeResult(w, PasswordResponse{Password: password}, err)
}

func (h *Handler) GetTeacher(w http.ResponseWriter, r *http.Request) {
	detail, err := h.service.GetTeacherDetail(r.Context(), r.PathValue("id"))
	writeResult(w, detail, err)
}

func (h *Handler) UpdateTeacher(w http.ResponseWriter, r *http.Request) {
	var req SaveTeacherRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	err := h.service.UpdateTeacher(r.Context(), r.PathValue("id"), req)
	writeResult(w, map[string]string{"message": "更新成功"}, err)
}

func (h *Handler) DeleteTeacher(w http.ResponseWriter, r *http.Request) {
	err := h.service.DeleteTeacher(r.Context(), r.PathValue("id"))
	writeResult(w, map[string]bool{"success": err == nil}, err)
}

func (h *Handler) ResetTeacherPassword(w http.ResponseWriter, r *http.Request) {
	password, err := h.service.ResetTeacherPassword(r.Context(), r.PathValue("id"))
	writeResult(w, PasswordResponse{Password: password}, err)
}

func (h *Handler) AssignStudentTeacher(w http.ResponseWriter, r *http.Request) {
	var req AssignStudentTeacherRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	err := h.service.AssignStudentTeacher(r.Context(), r.PathValue("id"), req)
	writeResult(w, map[string]string{"message": "关联成功"}, err)
}

func (h *Handler) CreateTeacherClaim(w http.ResponseWriter, r *http.Request) {
	var req CreateTeacherClaimRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	claim, err := h.service.CreateTeacherClaim(r.Context(), r.PathValue("id"), req)
	writeResult(w, claim, err)
}

func (h *Handler) ListStudentTeacherClaims(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.ListStudentTeacherClaims(r.Context(), r.PathValue("id"))
	writeResult(w, items, err)
}

func (h *Handler) ListTeacherClaims(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.ListTeacherClaims(r.Context(), r.URL.Query().Get("status"))
	writeResult(w, items, err)
}

func (h *Handler) UpdateTeacherClaim(w http.ResponseWriter, r *http.Request) {
	claimID, ok := parsePathInt64(w, r, "id")
	if !ok {
		return
	}
	var req UpdateTeacherClaimRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	claim, err := h.service.UpdateTeacherClaim(r.Context(), claimID, req)
	writeResult(w, claim, err)
}

func decodeJSON(w http.ResponseWriter, r *http.Request, dest any) bool {
	if err := json.NewDecoder(r.Body).Decode(dest); err != nil {
		response.Error(w, http.StatusBadRequest, "请求参数错误")
		return false
	}
	return true
}

func parsePathInt64(w http.ResponseWriter, r *http.Request, name string) (int64, bool) {
	value, err := strconv.ParseInt(r.PathValue(name), 10, 64)
	if err != nil || value <= 0 {
		response.Error(w, http.StatusBadRequest, "请求参数错误")
		return 0, false
	}
	return value, true
}

func queryInt(raw string, fallback int) int {
	if raw == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

func writeResult(w http.ResponseWriter, data any, err error) {
	if err == nil {
		response.OK(w, data)
		return
	}
	switch {
	case errors.Is(err, ErrInvalidArgument):
		response.Error(w, http.StatusBadRequest, "请求参数错误")
	case errors.Is(err, ErrDuplicateTeacher):
		response.Error(w, http.StatusBadRequest, "教师账号或手机号已存在")
	case errors.Is(err, ErrTeacherNotFound):
		response.Error(w, http.StatusNotFound, "教师不存在")
	case errors.Is(err, ErrStudentNotFound):
		response.Error(w, http.StatusNotFound, "学生不存在")
	case errors.Is(err, ErrClaimNotFound):
		response.Error(w, http.StatusNotFound, "认领申请不存在")
	case errors.Is(err, ErrRepositoryUnavailable):
		response.Error(w, http.StatusNotImplemented, "教师模块数据源尚未配置")
	default:
		response.Error(w, http.StatusInternalServerError, err.Error())
	}
}
