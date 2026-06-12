package textbook

import (
	"net/http"

	"ai-education/server-go/internal/middleware"
)

func RegisterRoutes(mux *http.ServeMux, repo Repository) {
	handler := NewHandler(repo)

	mux.Handle("GET /api/student/textbook/{textbook_id}/units", middleware.RequireToken(http.HandlerFunc(handler.GetStudentUnits)))

	mux.Handle("POST /api/admin/textbook", middleware.RequireToken(http.HandlerFunc(handler.CreateTextbook)))
	mux.Handle("PATCH /api/admin/textbook/{id}", middleware.RequireToken(http.HandlerFunc(handler.UpdateTextbook)))
	mux.Handle("DELETE /api/admin/textbook/{id}", middleware.RequireToken(http.HandlerFunc(handler.DeleteTextbook)))
	mux.Handle("GET /api/admin/textbook/search", middleware.RequireToken(http.HandlerFunc(handler.SearchTextbooks)))
	mux.Handle("GET /api/admin/textbook/{id}", middleware.RequireToken(http.HandlerFunc(handler.GetTextbook)))
	mux.Handle("GET /api/admin/textbook/{id}/units", middleware.RequireToken(http.HandlerFunc(handler.ListTextbookUnits)))
	mux.Handle("POST /api/admin/textbook/unit", middleware.RequireToken(http.HandlerFunc(handler.CreateUnit)))
	mux.Handle("PATCH /api/admin/textbook/unit/{id}", middleware.RequireToken(http.HandlerFunc(handler.UpdateUnit)))
	mux.Handle("DELETE /api/admin/textbook/unit/{id}", middleware.RequireToken(http.HandlerFunc(handler.DeleteUnit)))
}
