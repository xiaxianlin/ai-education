package auth

import "net/http"

func RegisterAdminRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("POST /api/admin/login", handler.AdminLogin)
	mux.HandleFunc("GET /api/admin/check", handler.AdminCheck)
	mux.HandleFunc("GET /api/admin/configs", handler.AdminConfigs)
}

func RegisterStudentRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("POST /api/student/login", handler.StudentLogin)
	mux.HandleFunc("GET /api/student/check", handler.StudentCheck)
}
