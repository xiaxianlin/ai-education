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
	mux.Handle("POST /api/admin/textbook/{id}/upload", middleware.RequireToken(http.HandlerFunc(handler.UploadTextbook)))
	mux.Handle("POST /api/admin/textbook/{id}/parse", middleware.RequireToken(http.HandlerFunc(handler.ParseTextbook)))
	mux.Handle("POST /api/admin/textbook/unit", middleware.RequireToken(http.HandlerFunc(handler.CreateUnit)))
	mux.Handle("PATCH /api/admin/textbook/unit/{id}", middleware.RequireToken(http.HandlerFunc(handler.UpdateUnit)))
	mux.Handle("DELETE /api/admin/textbook/unit/{id}", middleware.RequireToken(http.HandlerFunc(handler.DeleteUnit)))

	mux.Handle("POST /api/admin/textbook_version", middleware.RequireToken(http.HandlerFunc(handler.CreateTextbookVersion)))
	mux.Handle("PATCH /api/admin/textbook_version/{id}", middleware.RequireToken(http.HandlerFunc(handler.UpdateTextbookVersion)))
	mux.Handle("DELETE /api/admin/textbook_version/{id}", middleware.RequireToken(http.HandlerFunc(handler.DeleteTextbookVersion)))
	mux.Handle("PATCH /api/admin/textbook_version/{id}/enable", middleware.RequireToken(http.HandlerFunc(handler.EnableTextbookVersion)))
	mux.Handle("PATCH /api/admin/textbook_version/{id}/disable", middleware.RequireToken(http.HandlerFunc(handler.DisableTextbookVersion)))
	mux.Handle("GET /api/admin/textbook_version/search", middleware.RequireToken(http.HandlerFunc(handler.SearchTextbookVersions)))
	mux.Handle("GET /api/admin/textbook_version/{id}", middleware.RequireToken(http.HandlerFunc(handler.GetTextbookVersion)))

	mux.Handle("POST /api/admin/teacher_book", middleware.RequireToken(http.HandlerFunc(handler.CreateTeacherBook)))
	mux.Handle("PUT /api/admin/teacher_book/{id}", middleware.RequireToken(http.HandlerFunc(handler.UpdateTeacherBook)))
	mux.Handle("DELETE /api/admin/teacher_book/{id}", middleware.RequireToken(http.HandlerFunc(handler.DeleteTeacherBook)))
	mux.Handle("GET /api/admin/teacher_book/search", middleware.RequireToken(http.HandlerFunc(handler.SearchTeacherBooks)))
	mux.Handle("GET /api/admin/teacher_book/{id}", middleware.RequireToken(http.HandlerFunc(handler.GetTeacherBook)))
	mux.Handle("POST /api/admin/teacher_book/{id}/upload", middleware.RequireToken(http.HandlerFunc(handler.UploadTeacherBook)))
}
