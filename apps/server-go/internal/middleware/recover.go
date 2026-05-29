package middleware

import (
	"log"
	"net/http"

	"ai-education/server-go/internal/response"
)

func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("panic recovered: %v", err)
				response.Error(w, 500, "服务器内部错误")
			}
		}()

		next.ServeHTTP(w, r)
	})
}
