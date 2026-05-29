package practice

import (
	"net/http"

	"ai-education/server-go/internal/middleware"
)

func RegisterRoutes(mux *http.ServeMux, service *Service) {
	RegisterStudentRoutes(mux, service)
}

func RegisterStudentRoutes(mux *http.ServeMux, service *Service) {
	handler := NewHandler(service)

	mux.Handle("GET /api/student/practice/", protected(handler.Get))
	mux.Handle("POST /api/student/practice/create", protected(handler.Create))
	mux.Handle("GET /api/student/practice/records", protected(handler.Records))
	mux.Handle("GET /api/student/practice/{session_id}", protected(handler.Detail))
	mux.Handle("POST /api/student/practice/{session_id}/begin", protected(handler.Begin))
	mux.Handle("POST /api/student/practice/{session_id}/complete", protected(handler.Complete))
	mux.Handle("POST /api/student/practice/answer", protected(handler.SubmitAnswer))
	mux.Handle("GET /api/student/practice/progress/{session_id}", protected(handler.Progress))
}

func protected(handler func(http.ResponseWriter, *http.Request)) http.Handler {
	return middleware.RequireToken(http.HandlerFunc(handler))
}
