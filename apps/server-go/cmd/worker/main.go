package main

import (
	"context"
	"log"
	"os/signal"
	"syscall"
	"time"

	"ai-education/server-go/internal/ai"
	"ai-education/server-go/internal/config"
	"ai-education/server-go/internal/db"
	"ai-education/server-go/internal/practice"
	"ai-education/server-go/internal/queue"
)

func main() {
	cfg := config.Load()

	// --- Database ---
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	database, err := db.Open(ctx, cfg)
	cancel()
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer database.Close()

	// --- Redis ---
	redisClient, err := queue.NewRedisClient(cfg.Redis.URL)
	if err != nil {
		log.Fatalf("redis connection failed: %v", err)
	}
	defer redisClient.Close()
	log.Printf("redis connected: %s", cfg.Redis.URL)

	// --- AI Provider ---
	aiProvider := buildAIProvider(cfg)

	// --- Handler Registry ---
	registry := queue.NewRegistry()

	practiceRepo := practice.NewSQLRepository(database.SQL())

	// practice.generate — real handler with AI
	mustRegister(queue.RegisterTypedHandler(
		registry,
		queue.TaskPracticeGenerate,
		practice.NewPracticeGenerateHandler(practiceRepo, aiProvider),
	))
	log.Print("registered handler: practice.generate (AI)")

	// question.generate — placeholder (to be implemented in P1-05)
	mustRegister(queue.RegisterTypedHandler(registry, queue.TaskQuestionGenerate, func(ctx context.Context, payload queue.QuestionGeneratePayload) error {
		log.Printf("question.generate placeholder: request_id=%s code=%s", payload.RequestID, payload.Code)
		return nil
	}))
	log.Print("registered handler: question.generate (placeholder)")

	// answer.evaluate — placeholder (to be implemented in P1-05)
	mustRegister(queue.RegisterTypedHandler(registry, queue.TaskAnswerEvaluate, func(ctx context.Context, payload queue.AnswerEvaluatePayload) error {
		log.Printf("answer.evaluate placeholder: session_id=%s question_id=%s", payload.SessionID, payload.QuestionID)
		return nil
	}))
	log.Print("registered handler: answer.evaluate (placeholder)")

	// report.generate — placeholder (to be implemented in P1-06)
	mustRegister(queue.RegisterTypedHandler(registry, queue.TaskReportGenerate, func(ctx context.Context, payload queue.ReportGeneratePayload) error {
		log.Printf("report.generate placeholder: session_id=%s student_id=%s", payload.SessionID, payload.StudentID)
		return nil
	}))
	log.Print("registered handler: report.generate (placeholder)")

	// --- Worker ---
	taskNames := registry.TaskNames()
	worker := queue.NewWorker(redisClient, registry, taskNames)

	// Graceful shutdown on SIGINT / SIGTERM.
	workerCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	log.Printf("worker starting, consuming tasks: %v", taskNames)
	worker.Start(workerCtx)
	log.Print("worker stopped")
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
		log.Fatalf("register worker handler: %v", err)
	}
}
