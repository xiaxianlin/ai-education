package ability

import (
	"net/http"

	"ai-education/server-go/internal/middleware"
)

func RegisterRoutes(mux *http.ServeMux, service *Service) {
	RegisterAdminRoutes(mux, service)
	RegisterStudentRoutes(mux, service)
}

func RegisterAdminRoutes(mux *http.ServeMux, service *Service) {
	handler := NewHandler(service)

	mux.Handle("GET /api/admin/ability", protected(handler.Search))
	mux.Handle("POST /api/admin/ability", protected(handler.Create))
	mux.Handle("PATCH /api/admin/ability/{id}", protected(handler.Update))
	mux.Handle("DELETE /api/admin/ability/{id}", protected(handler.Delete))
	mux.Handle("POST /api/admin/ability/batch_delete", protected(handler.BatchDelete))
	mux.Handle("GET /api/admin/ability/search", protected(handler.Search))
	mux.Handle("GET /api/admin/ability/{id}", protected(handler.Get))
	mux.Handle("POST /api/admin/ability/export", protected(handler.Export))
	mux.Handle("POST /api/admin/ability/import", protected(handler.Import))
}

func RegisterStudentRoutes(mux *http.ServeMux, service *Service) {
	handler := NewHandler(service)

	mux.Handle("GET /api/student/ability/atomics", protected(handler.StudentAtomics))
}

func protected(handler func(http.ResponseWriter, *http.Request)) http.Handler {
	return middleware.RequireToken(http.HandlerFunc(handler))
}
