package mastery

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

	handle(mux, "GET /api/student/mastery/list", http.HandlerFunc(handler.ListMastery), chain...)
	handle(mux, "GET /api/student/mastery/weak", http.HandlerFunc(handler.ListWeakMastery), chain...)
	handle(mux, "GET /api/student/mastery/summary", http.HandlerFunc(handler.GetSummary), chain...)
	handle(mux, "GET /api/student/practice/statistics", http.HandlerFunc(handler.GetPracticeStatistics), chain...)
}

func handle(mux *http.ServeMux, pattern string, handler http.Handler, middlewares ...Middleware) {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	mux.Handle(pattern, handler)
}
