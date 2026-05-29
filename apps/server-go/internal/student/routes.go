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

func handle(mux *http.ServeMux, pattern string, handler http.Handler, middlewares ...Middleware) {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	mux.Handle(pattern, handler)
}
