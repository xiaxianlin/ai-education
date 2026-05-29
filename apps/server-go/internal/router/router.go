package router

import (
	"context"
	"net/http"

	"ai-education/server-go/internal/ability"
	"ai-education/server-go/internal/auth"
	"ai-education/server-go/internal/mastery"
	"ai-education/server-go/internal/middleware"
	"ai-education/server-go/internal/practice"
	"ai-education/server-go/internal/response"
	"ai-education/server-go/internal/student"
	"ai-education/server-go/internal/textbook"
)

type Dependencies struct {
	AuthHandler     *auth.Handler
	AbilityService  *ability.Service
	StudentService  *student.Service
	MasteryService  *mastery.Service
	PracticeService *practice.Service
	PracticeAdmin   practice.AdminRepository
	TextbookRepo    textbook.Repository
	CurrentStudent  student.CurrentStudentProvider
}

type currentStudentProviderFunc func(ctx context.Context, r *http.Request) (string, error)

func (f currentStudentProviderFunc) CurrentStudentID(ctx context.Context, r *http.Request) (string, error) {
	return f(ctx, r)
}

func AuthCurrentStudentProvider(authService *auth.Service) student.CurrentStudentProvider {
	return currentStudentProviderFunc(func(ctx context.Context, r *http.Request) (string, error) {
		current, err := authService.CheckStudent(ctx, r.Header.Get(middleware.AccessTokenHeader))
		if err != nil {
			return "", err
		}
		return current.ID, nil
	})
}

func New(deps ...Dependencies) http.Handler {
	mux := http.NewServeMux()
	var resolved Dependencies
	if len(deps) > 0 {
		resolved = deps[0]
	}

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		response.OK(w, map[string]string{
			"service": "server-go",
			"status":  "ok",
		})
	})

	if resolved.AuthHandler != nil {
		auth.RegisterAdminRoutes(mux, resolved.AuthHandler)
		auth.RegisterStudentRoutes(mux, resolved.AuthHandler)
	} else {
		mux.Handle("GET /api/admin/check", middleware.RequireToken(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			response.Error(w, 501, "admin check 尚未迁移")
		})))

		mux.Handle("GET /api/student/check", middleware.RequireToken(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			response.Error(w, 501, "student check 尚未迁移")
		})))
	}

	if resolved.AbilityService != nil {
		ability.RegisterRoutes(mux, resolved.AbilityService)
	}
	if resolved.StudentService != nil && resolved.CurrentStudent != nil {
		student.RegisterStudentRoutes(mux, resolved.StudentService, resolved.CurrentStudent)
	}
	if resolved.TextbookRepo != nil {
		textbook.RegisterRoutes(mux, resolved.TextbookRepo)
	}
	if resolved.MasteryService != nil && resolved.CurrentStudent != nil {
		mastery.RegisterStudentRoutes(mux, resolved.MasteryService, resolved.CurrentStudent)
	}
	if resolved.PracticeService != nil && resolved.CurrentStudent != nil {
		practice.RegisterStudentRoutes(mux, resolved.PracticeService, resolved.CurrentStudent)
	}
	if resolved.PracticeAdmin != nil {
		practice.RegisterAdminRoutes(mux, resolved.PracticeAdmin)
	}

	return middleware.Recover(mux)
}
