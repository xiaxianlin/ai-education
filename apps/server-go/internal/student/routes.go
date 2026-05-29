package student

import (
	"net/http"

	"ai-education/server-go/internal/middleware"
)

type Middleware func(http.Handler) http.Handler

func RegisterRoutes(mux *http.ServeMux, service *Service, currentStudent CurrentStudentProvider, middlewares ...Middleware) {
	RegisterStudentRoutes(mux, service, currentStudent, middlewares...)
}

func RegisterStudentRoutes(mux *http.ServeMux, service *Service, currentStudent CurrentStudentProvider, middlewares ...Middleware) {
	handler := NewHandler(service, currentStudent)
	chain := middlewares
	if len(chain) == 0 {
		chain = []Middleware{middleware.RequireToken}
	}

	handle(mux, "GET /api/student/profile", http.HandlerFunc(handler.GetProfile), chain...)
	handle(mux, "PUT /api/student/profile", http.HandlerFunc(handler.UpdateProfile), chain...)
}

func RegisterAdminRoutes(mux *http.ServeMux, service *AdminService, middlewares ...Middleware) {
	handler := NewAdminHandler(service)
	chain := middlewares
	if len(chain) == 0 {
		chain = []Middleware{middleware.RequireToken}
	}

	handle(mux, "POST /api/admin/student", http.HandlerFunc(handler.CreateStudent), chain...)
	handle(mux, "POST /api/admin/student/", http.HandlerFunc(handler.CreateStudent), chain...)
	handle(mux, "GET /api/admin/student/search", http.HandlerFunc(handler.SearchStudents), chain...)
	handle(mux, "GET /api/admin/student/{id}", http.HandlerFunc(handler.GetStudent), chain...)
	handle(mux, "PUT /api/admin/student/{id}", http.HandlerFunc(handler.UpdateStudent), chain...)
	handle(mux, "DELETE /api/admin/student/{id}", http.HandlerFunc(handler.DeleteStudent), chain...)
	handle(mux, "POST /api/admin/student/{id}/reset_password", http.HandlerFunc(handler.ResetStudentPassword), chain...)
	handle(mux, "GET /api/admin/student/{id}/unused_textbooks", http.HandlerFunc(handler.ListUnusedTextbooks), chain...)
	handle(mux, "POST /api/admin/student/{id}/textbook-config", http.HandlerFunc(handler.CreateTextbookConfig), chain...)
	handle(mux, "PUT /api/admin/student/{id}/textbook-config/{config_id}", http.HandlerFunc(handler.UpdateTextbookConfig), chain...)
	handle(mux, "DELETE /api/admin/student/{id}/textbook-config/{config_id}", http.HandlerFunc(handler.DeleteTextbookConfig), chain...)
	handle(mux, "GET /api/admin/student/{id}/textbook-configs", http.HandlerFunc(handler.ListTextbookConfigs), chain...)
	handle(mux, "POST /api/admin/student/{id}/textbook-configs", http.HandlerFunc(handler.SetTextbookConfigs), chain...)
	handle(mux, "GET /api/admin/student/{id}/mastery", http.HandlerFunc(handler.ListMastery), chain...)
	handle(mux, "GET /api/admin/student/{id}/mastery/summary", http.HandlerFunc(handler.GetMasterySummary), chain...)
}

func handle(mux *http.ServeMux, pattern string, handler http.Handler, middlewares ...Middleware) {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	mux.Handle(pattern, handler)
}
