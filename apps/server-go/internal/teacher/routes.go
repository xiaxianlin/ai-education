package teacher

import (
	"net/http"

	"ai-education/server-go/internal/middleware"
)

type Middleware func(http.Handler) http.Handler

func RegisterAdminRoutes(mux *http.ServeMux, service *Service, middlewares ...Middleware) {
	handler := NewHandler(service)
	chain := middlewares
	if len(chain) == 0 {
		chain = []Middleware{middleware.RequireToken}
	}

	handle(mux, "GET /api/admin/teacher/search", http.HandlerFunc(handler.SearchTeachers), chain...)
	handle(mux, "POST /api/admin/teacher", http.HandlerFunc(handler.CreateTeacher), chain...)
	handle(mux, "GET /api/admin/teacher/{id}", http.HandlerFunc(handler.GetTeacher), chain...)
	handle(mux, "PUT /api/admin/teacher/{id}", http.HandlerFunc(handler.UpdateTeacher), chain...)
	handle(mux, "PATCH /api/admin/teacher/{id}", http.HandlerFunc(handler.UpdateTeacher), chain...)
	handle(mux, "DELETE /api/admin/teacher/{id}", http.HandlerFunc(handler.DeleteTeacher), chain...)
	handle(mux, "POST /api/admin/teacher/{id}/reset_password", http.HandlerFunc(handler.ResetTeacherPassword), chain...)
	handle(mux, "GET /api/admin/teacher-claims", http.HandlerFunc(handler.ListTeacherClaims), chain...)
	handle(mux, "PATCH /api/admin/teacher-claims/{id}", http.HandlerFunc(handler.UpdateTeacherClaim), chain...)
	handle(mux, "PATCH /api/admin/student/{id}/teacher", http.HandlerFunc(handler.AssignStudentTeacher), chain...)
	handle(mux, "POST /api/admin/student/{id}/teacher-claim", http.HandlerFunc(handler.CreateTeacherClaim), chain...)
	handle(mux, "GET /api/admin/student/{id}/teacher-claims", http.HandlerFunc(handler.ListStudentTeacherClaims), chain...)
}

func handle(mux *http.ServeMux, pattern string, handler http.Handler, middlewares ...Middleware) {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	mux.Handle(pattern, handler)
}
