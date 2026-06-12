package auth

import "net/http"

func RegisterAdminRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("POST /api/admin/login", handler.AdminLogin)
	mux.HandleFunc("GET /api/admin/check", handler.AdminCheck)
	mux.HandleFunc("GET /api/admin/configs", handler.AdminConfigs)
	mux.HandleFunc("POST /api/admin/modify_password", handler.ModifyPassword)
	mux.HandleFunc("POST /api/admin/manager", handler.CreateManager)
	mux.HandleFunc("DELETE /api/admin/manager/{id}", handler.DeleteManager)
	mux.HandleFunc("PATCH /api/admin/manager/{id}", handler.UpdateManager)
	mux.HandleFunc("GET /api/admin/manager/all", handler.ListManagers)
	mux.HandleFunc("POST /api/admin/manager/{id}/reset", handler.ResetManagerPassword)
}

func RegisterStudentRoutes(mux *http.ServeMux, handler *Handler) {
	mux.HandleFunc("POST /api/student/login", handler.StudentLogin)
	mux.HandleFunc("GET /api/student/check", handler.StudentCheck)
}
