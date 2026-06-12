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
	"ai-education/server-go/internal/question"
	"ai-education/server-go/internal/queue"
	"ai-education/server-go/internal/router"
	"ai-education/server-go/internal/student"
	"ai-education/server-go/internal/teacher"
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

	passwordHasher := auth.NewPythonPasswordHasher()
	createdSuperManager, err := auth.EnsureSuperManager(ctx, database.ManagerBootstrapRepository(), passwordHasher, auth.SuperManagerBootstrapConfig{
		Username: cfg.Admin.Username,
		Password: cfg.Admin.Password,
	})
	if err != nil {
		log.Printf("super manager bootstrap failed: %v", err)
	} else if createdSuperManager {
		log.Printf("super manager initialized")
	}

	tokenRepo := database.TokenRepository()
	authStore := auth.NewDatabaseStore(tokenRepo)
	authService := auth.NewService(auth.ServiceConfig{
		ManagerStore:    authStore,
		StudentStore:    authStore,
		PasswordHasher:  passwordHasher,
		ManagerResolver: auth.NewJWTResolver[auth.ManagerTokenClaims](cfg.App.SecretKey, auth.DefaultTokenTTL, nil),
		StudentResolver: auth.NewJWTResolver[auth.StudentTokenClaims](cfg.App.SecretKey, auth.DefaultTokenTTL, nil),
	})

	abilityService := ability.NewService(ability.NewSQLRepository(database.SQL()))
	studentService := student.NewService(student.NewSQLRepository(database.SQL()))
	studentAdminService := student.NewAdminService(student.NewSQLRepository(database.SQL()))
	teacherService := teacher.NewService(teacher.NewSQLRepository(database.SQL()))
	masteryService := mastery.NewService(mastery.NewSQLRepository(database.SQL()))
	textbookRepo := textbook.NewSQLRepository(database.SQL())
	practiceRepo := practice.NewSQLRepository(database.SQL())
	questionService := question.NewService(question.NewSQLRepository(database.SQL()), question.ServiceOptions{
		PromptStore: question.NewFilePromptStore("../server/prompt"),
	})

	aiProvider := buildAIProvider(cfg)

	// Queue: use Redis when configured, otherwise fall back to in-process dispatch.
	var enqueuer queue.Enqueuer
	if cfg.Redis.URL != "" {
		redisClient, redisErr := queue.NewRedisClient(cfg.Redis.URL)
		if redisErr != nil {
			log.Printf("redis connection failed, falling back to in-process queue: %v", redisErr)
			redisClient = nil
		}
		if redisClient != nil {
			enqueuer = queue.NewRedisEnqueuer(redisClient)
			log.Printf("queue mode: redis (%s)", cfg.Redis.URL)
		}
	}
	if enqueuer == nil {
		workerRegistry := queue.NewRegistry()
		mustRegister(queue.RegisterTypedHandler(
			workerRegistry,
			queue.TaskPracticeGenerate,
			practice.NewPracticeGenerateHandler(practiceRepo, aiProvider),
		))
		enqueuer = queue.NewDispatchEnqueuer(workerRegistry, true)
		log.Print("queue mode: in-process dispatch (development)")
	}

	practiceService := practice.NewService(practiceRepo, enqueuer, aiProvider, aiProvider)

	// Register report.generate handler in in-process mode
	if dispatchEnqueuer, ok := enqueuer.(*queue.DispatchEnqueuer); ok {
		mustRegister(queue.RegisterTypedHandler(
			dispatchEnqueuer.Registry,
			queue.TaskReportGenerate,
			practice.NewReportGenerateHandler(practiceService),
		))
		log.Print("registered in-process handler: report.generate")
	}
	currentStudent := router.AuthCurrentStudentProvider(authService)

	return router.New(router.Dependencies{
		AuthHandler:     auth.NewHandler(authService),
		AbilityService:  abilityService,
		StudentService:  studentService,
		StudentAdmin:    studentAdminService,
		TeacherService:  teacherService,
		MasteryService:  masteryService,
		PracticeService: practiceService,
		PracticeAdmin:   practiceRepo,
		QuestionService: questionService,
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
