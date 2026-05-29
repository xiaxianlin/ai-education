package middleware

import (
	"net/http"

	"ai-education/server-go/internal/response"
)

const AccessTokenHeader = "x-access-token"

func RequireToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get(AccessTokenHeader) == "" {
			response.Error(w, 401, "未登录或登录已过期")
			return
		}
		next.ServeHTTP(w, r)
	})
}
