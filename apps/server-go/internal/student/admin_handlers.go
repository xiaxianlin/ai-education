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
		Page:     queryInt(query.Get("page"), 1),
		Size:     queryInt(query.Get("size"), 20),
		Name:     query.Get("name"),
		Phone:    query.Get("phone"),
		Keywords: firstNonEmpty(query.Get("keywords"), query.Get("keyword")),
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

func (h *AdminHandler) ListUnusedTextbooks(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.ListUnusedTextbooks(r.Context(), r.PathValue("id"))
	writeAdminStudentResult(w, items, err)
}

func (h *AdminHandler) CreateTextbookConfig(w http.ResponseWriter, r *http.Request) {
	var req SaveStudentTextbookConfigRequest
	if !decodeStudentJSON(w, r, &req) {
		return
	}
	item, err := h.service.CreateTextbookConfig(r.Context(), r.PathValue("id"), req)
	writeAdminStudentResult(w, item, err)
}

func (h *AdminHandler) UpdateTextbookConfig(w http.ResponseWriter, r *http.Request) {
	configID, ok := parsePathInt64(w, r, "config_id")
	if !ok {
		return
	}
	var req SaveStudentTextbookConfigRequest
	if !decodeStudentJSON(w, r, &req) {
		return
	}
	item, err := h.service.UpdateTextbookConfig(r.Context(), r.PathValue("id"), configID, req)
	writeAdminStudentResult(w, item, err)
}

func (h *AdminHandler) DeleteTextbookConfig(w http.ResponseWriter, r *http.Request) {
	configID, ok := parsePathInt64(w, r, "config_id")
	if !ok {
		return
	}
	success, err := h.service.DeleteTextbookConfig(r.Context(), r.PathValue("id"), configID)
	writeAdminStudentResult(w, map[string]bool{"success": success}, err)
}

func (h *AdminHandler) ListTextbookConfigs(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	req := ListStudentTextbookConfigsRequest{
		Page:    queryInt(query.Get("page"), 1),
		Size:    queryInt(firstNonEmpty(query.Get("page_size"), query.Get("size")), 20),
		Subject: query.Get("subject"),
	}
	if raw := query.Get("grade"); raw != "" {
		grade, err := strconv.Atoi(raw)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "请求参数错误")
			return
		}
		req.Grade = &grade
	}
	result, err := h.service.ListTextbookConfigs(r.Context(), r.PathValue("id"), req)
	writeAdminStudentResult(w, result, err)
}

func (h *AdminHandler) SetTextbookConfigs(w http.ResponseWriter, r *http.Request) {
	var req SetStudentTextbookConfigsRequest
	if !decodeStudentJSON(w, r, &req) {
		return
	}
	err := h.service.SetTextbookConfigs(r.Context(), r.PathValue("id"), req)
	writeAdminStudentResult(w, map[string]string{"message": "配置设置成功"}, err)
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
	case errors.Is(err, ErrTextbookNotFound):
		response.Error(w, http.StatusBadRequest, "教材不存在")
	case errors.Is(err, ErrTextbookConfigured):
		response.Error(w, http.StatusBadRequest, "该教材已配置")
	case errors.Is(err, ErrStudentNotFound):
		response.Error(w, http.StatusNotFound, "学生不存在")
	case errors.Is(err, ErrTextbookConfigNotFound):
		response.Error(w, http.StatusNotFound, "配置不存在")
	case errors.Is(err, ErrRepositoryUnavailable):
		response.Error(w, http.StatusNotImplemented, "学生管理模块数据源尚未配置")
	default:
		response.Error(w, http.StatusInternalServerError, err.Error())
	}
}
