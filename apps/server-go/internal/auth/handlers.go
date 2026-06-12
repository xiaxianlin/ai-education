package auth

import (
	"encoding/json"
	"net/http"

	"ai-education/server-go/internal/middleware"
	"ai-education/server-go/internal/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) AdminLogin(w http.ResponseWriter, r *http.Request) {
	var params AdminLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		writeError(w, newBadRequestError("请求参数错误", err))
		return
	}

	token, err := h.service.AdminLogin(r.Context(), params.Username, params.Password)
	if err != nil {
		writeError(w, err)
		return
	}

	response.OK(w, token)
}

func (h *Handler) AdminCheck(w http.ResponseWriter, r *http.Request) {
	manager, err := h.service.CheckAdmin(r.Context(), accessToken(r))
	if err != nil {
		writeError(w, err)
		return
	}

	response.OK(w, manager)
}

func (h *Handler) AdminConfigs(w http.ResponseWriter, _ *http.Request) {
	response.OK(w, ConfigsResponse{
		Subjects:  []string{"语文", "数学", "英语"},
		Semesters: []string{"上学期", "下学期"},
		Providers: []string{"aliyun"},
	})
}

func (h *Handler) ModifyPassword(w http.ResponseWriter, r *http.Request) {
	manager, err := h.service.CheckAdmin(r.Context(), accessToken(r))
	if err != nil {
		writeError(w, err)
		return
	}

	var params ModifyPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		writeError(w, newBadRequestError("请求参数错误", err))
		return
	}
	if err := h.service.ModifyManagerPassword(r.Context(), manager.ID, params); err != nil {
		writeError(w, err)
		return
	}
	response.OK(w, nil)
}

func (h *Handler) CreateManager(w http.ResponseWriter, r *http.Request) {
	if !h.ensureAdmin(w, r) {
		return
	}

	var params CreateManagerRequest
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		writeError(w, newBadRequestError("请求参数错误", err))
		return
	}
	password, err := h.service.CreateManager(r.Context(), params)
	if err != nil {
		writeError(w, err)
		return
	}
	response.OK(w, PasswordResponse{Password: password})
}

func (h *Handler) DeleteManager(w http.ResponseWriter, r *http.Request) {
	if !h.ensureAdmin(w, r) {
		return
	}
	if err := h.service.DeleteManager(r.Context(), r.PathValue("id")); err != nil {
		writeError(w, err)
		return
	}
	response.OK(w, nil)
}

func (h *Handler) UpdateManager(w http.ResponseWriter, r *http.Request) {
	if !h.ensureAdmin(w, r) {
		return
	}

	var params UpdateManagerRequest
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		writeError(w, newBadRequestError("请求参数错误", err))
		return
	}
	if err := h.service.UpdateManager(r.Context(), r.PathValue("id"), params); err != nil {
		writeError(w, err)
		return
	}
	response.OK(w, nil)
}

func (h *Handler) ListManagers(w http.ResponseWriter, r *http.Request) {
	if !h.ensureAdmin(w, r) {
		return
	}
	managers, err := h.service.ListManagers(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	response.OK(w, managers)
}

func (h *Handler) ResetManagerPassword(w http.ResponseWriter, r *http.Request) {
	if !h.ensureAdmin(w, r) {
		return
	}
	password, err := h.service.ResetManagerPassword(r.Context(), r.PathValue("id"))
	if err != nil {
		writeError(w, err)
		return
	}
	response.OK(w, PasswordResponse{Password: password})
}

func (h *Handler) StudentLogin(w http.ResponseWriter, r *http.Request) {
	var params StudentLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		writeError(w, newBadRequestError("请求参数错误", err))
		return
	}

	token, err := h.service.StudentLogin(r.Context(), params.Phone, params.Password)
	if err != nil {
		writeError(w, err)
		return
	}

	response.OK(w, token)
}

func (h *Handler) StudentCheck(w http.ResponseWriter, r *http.Request) {
	student, err := h.service.CheckStudent(r.Context(), accessToken(r))
	if err != nil {
		writeError(w, err)
		return
	}

	response.OK(w, student.ID)
}

func accessToken(r *http.Request) string {
	return r.Header.Get(middleware.AccessTokenHeader)
}

func (h *Handler) ensureAdmin(w http.ResponseWriter, r *http.Request) bool {
	manager, err := h.service.CheckAdmin(r.Context(), accessToken(r))
	if err != nil {
		writeError(w, err)
		return false
	}
	if !h.service.IsManagerAdmin(manager) {
		writeError(w, newForbiddenError("权限不足", ErrProtectedManager))
		return false
	}
	return true
}

func writeError(w http.ResponseWriter, err error) {
	status, message := mapError(err)
	response.Error(w, status, message)
}
