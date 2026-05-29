package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"ai-education/server-go/internal/ability"
	"ai-education/server-go/internal/auth"
	"ai-education/server-go/internal/config"
	"ai-education/server-go/internal/db"
	"ai-education/server-go/internal/router"
	"ai-education/server-go/internal/student"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	cfg := config.Load()
	handler := buildHandler(cfg)

	log.Printf("server-go listening on %s", cfg.ServerAddr)
	if err := http.ListenAndServe(cfg.ServerAddr, handler); err != nil {
		log.Fatalf("server-go stopped: %v", err)
	}
}

func buildHandler(cfg config.Config) http.Handler {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	database, err := db.Open(ctx, cfg)
	if err != nil {
		log.Printf("database disabled: %v", err)
		return router.New()
	}

	tokenRepo := database.TokenRepository()
	authStore := auth.NewDatabaseStore(tokenRepo)
	authService := auth.NewService(auth.ServiceConfig{
		ManagerStore:    authStore,
		StudentStore:    authStore,
		PasswordHasher:  auth.NewPythonPasswordHasher(),
		ManagerResolver: auth.NewJWTResolver[auth.ManagerTokenClaims](cfg.App.SecretKey, auth.DefaultTokenTTL, nil),
		StudentResolver: auth.NewJWTResolver[auth.StudentTokenClaims](cfg.App.SecretKey, auth.DefaultTokenTTL, nil),
	})

	abilityService := ability.NewService(ability.NewSQLRepository(database.SQL()))
	studentService := student.NewService(student.NewSQLRepository(database.SQL()))

	return router.New(router.Dependencies{
		AuthHandler:    auth.NewHandler(authService),
		AbilityService: abilityService,
		StudentService: studentService,
		CurrentStudent: router.AuthCurrentStudentProvider(authService),
	})
}
