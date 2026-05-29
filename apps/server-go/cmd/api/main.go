package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"ai-education/server-go/internal/ability"
	"ai-education/server-go/internal/ai"
	"ai-education/server-go/internal/auth"
	"ai-education/server-go/internal/config"
	"ai-education/server-go/internal/db"
	"ai-education/server-go/internal/mastery"
	"ai-education/server-go/internal/practice"
	"ai-education/server-go/internal/queue"
	"ai-education/server-go/internal/router"
	"ai-education/server-go/internal/student"
	"ai-education/server-go/internal/textbook"

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
	masteryService := mastery.NewService(mastery.NewSQLRepository(database.SQL()))
	textbookRepo := textbook.NewSQLRepository(database.SQL())
	practiceRepo := practice.NewSQLRepository(database.SQL())

	aiProvider := buildAIProvider(cfg)
	workerRegistry := queue.NewRegistry()
	mustRegister(queue.RegisterTypedHandler(
		workerRegistry,
		queue.TaskPracticeGenerate,
		practice.NewPracticeGenerateHandler(practiceRepo, aiProvider),
	))
	practiceService := practice.NewService(practiceRepo, queue.NewDispatchEnqueuer(workerRegistry, true), aiProvider)
	currentStudent := router.AuthCurrentStudentProvider(authService)

	return router.New(router.Dependencies{
		AuthHandler:     auth.NewHandler(authService),
		AbilityService:  abilityService,
		StudentService:  studentService,
		MasteryService:  masteryService,
		PracticeService: practiceService,
		TextbookRepo:    textbookRepo,
		CurrentStudent:  currentStudent,
	})
}

func buildAIProvider(cfg config.Config) ai.ADKProvider {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	adapter, err := ai.NewGeminiADKAdapter(ctx, ai.ADKConfig{
		APIKey:    cfg.AI.LLM.APIKey,
		APIBase:   cfg.AI.LLM.APIBase,
		ModelName: cfg.AI.LLM.ModelName,
	})
	if err != nil {
		log.Printf("google adk disabled: %v", err)
		return ai.NewADKProvider(nil)
	}
	log.Printf("google adk enabled with model %s", cfg.AI.LLM.ModelName)
	return ai.NewADKProvider(adapter)
}

func mustRegister(err error) {
	if err != nil {
		log.Fatalf("register server-go handler: %v", err)
	}
}
