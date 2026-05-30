package student

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"ai-education/server-go/internal/response"
)

type AdminHandler struct {
	service *AdminService
}

func NewAdminHandler(service *AdminService) *AdminHandler {
	return &AdminHandler{service: service}
}

func (h *AdminHandler) SearchStudents(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	req := SearchStudentsRequest{
		Page:      queryInt(query.Get("page"), 1),
		Size:      queryInt(query.Get("size"), 20),
		Name:      query.Get("name"),
		Phone:     query.Get("phone"),
		Keywords:  firstNonEmpty(query.Get("keywords"), query.Get("keyword")),
		TeacherID: query.Get("teacher_id"),
	}
	if raw := query.Get("status"); raw != "" {
		status, err := strconv.Atoi(raw)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "请求参数错误")
			return
		}
		req.Status = &status
	}

	result, err := h.service.SearchStudents(r.Context(), req)
	writeAdminStudentResult(w, result, err)
}

func (h *AdminHandler) CreateStudent(w http.ResponseWriter, r *http.Request) {
	var req SaveStudentRequest
	if !decodeStudentJSON(w, r, &req) {
		return
	}
	password, err := h.service.CreateStudent(r.Context(), req)
	writeAdminStudentResult(w, password, err)
}

func (h *AdminHandler) GetStudent(w http.ResponseWriter, r *http.Request) {
	item, err := h.service.GetStudent(r.Context(), r.PathValue("id"))
	writeAdminStudentResult(w, item, err)
}

func (h *AdminHandler) UpdateStudent(w http.ResponseWriter, r *http.Request) {
	var req SaveStudentRequest
	if !decodeStudentJSON(w, r, &req) {
		return
	}
	err := h.service.UpdateStudent(r.Context(), r.PathValue("id"), req)
	writeAdminStudentResult(w, map[string]string{"message": "更新成功"}, err)
}

func (h *AdminHandler) DeleteStudent(w http.ResponseWriter, r *http.Request) {
	err := h.service.DeleteStudent(r.Context(), r.PathValue("id"))
	writeAdminStudentResult(w, map[string]bool{"success": err == nil}, err)
}

func (h *AdminHandler) ResetStudentPassword(w http.ResponseWriter, r *http.Request) {
	password, err := h.service.ResetStudentPassword(r.Context(), r.PathValue("id"))
	writeAdminStudentResult(w, password, err)
}

func (h *AdminHandler) ListMastery(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.ListMastery(r.Context(), r.PathValue("id"), r.URL.Query().Get("subject"))
	writeAdminStudentResult(w, items, err)
}

func (h *AdminHandler) GetMasterySummary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.service.GetMasterySummary(r.Context(), r.PathValue("id"))
	writeAdminStudentResult(w, summary, err)
}

func decodeStudentJSON(w http.ResponseWriter, r *http.Request, dest any) bool {
	if err := json.NewDecoder(r.Body).Decode(dest); err != nil {
		response.Error(w, http.StatusBadRequest, "请求参数错误")
		return false
	}
	return true
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

func writeAdminStudentResult(w http.ResponseWriter, data any, err error) {
	if err == nil {
		response.OK(w, data)
		return
	}

	switch {
	case errors.Is(err, ErrInvalidArgument):
		response.Error(w, http.StatusBadRequest, "请求参数错误")
	case errors.Is(err, ErrDuplicateStudentPhone):
		response.Error(w, http.StatusBadRequest, "该学生已经注册")
	case errors.Is(err, ErrStudentNotFound):
		response.Error(w, http.StatusNotFound, "学生不存在")
	case errors.Is(err, ErrRepositoryUnavailable):
		response.Error(w, http.StatusNotImplemented, "学生管理模块数据源尚未配置")
	default:
		response.Error(w, http.StatusInternalServerError, err.Error())
	}
}
