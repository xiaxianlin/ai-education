package router

import (
	"net/http"

	"ai-education/server-go/internal/middleware"
	"ai-education/server-go/internal/response"
)

func New() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		response.OK(w, map[string]string{
			"service": "server-go",
			"status":  "ok",
		})
	})

	mux.Handle("GET /api/admin/check", middleware.RequireToken(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response.Error(w, 501, "admin check 尚未迁移")
	})))

	mux.Handle("GET /api/student/check", middleware.RequireToken(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response.Error(w, 501, "student check 尚未迁移")
	})))

	return middleware.Recover(mux)
}
