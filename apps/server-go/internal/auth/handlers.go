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

func writeError(w http.ResponseWriter, err error) {
	status, message := mapError(err)
	response.Error(w, status, message)
}
