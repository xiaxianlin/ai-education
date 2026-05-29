package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"ai-education/server-go/internal/queue"
)

func main() {
	registry := queue.NewRegistry()
	registerHandlers(registry)

	log.Printf("server-go worker skeleton ready; registered task handlers: %v", registry.TaskNames())
	log.Print("no external queue backend is configured yet; worker is idle")

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	log.Print("server-go worker stopped")
}

func registerHandlers(registry *queue.Registry) {
	mustRegister(queue.RegisterTypedHandler(registry, queue.TaskPracticeGenerate, func(ctx context.Context, payload queue.PracticeGeneratePayload) error {
		log.Printf("practice generation handler placeholder: session_id=%s generate_count=%d", payload.SessionID, payload.GenerateCount)
		return nil
	}))
	mustRegister(queue.RegisterTypedHandler(registry, queue.TaskQuestionGenerate, func(ctx context.Context, payload queue.QuestionGeneratePayload) error {
		log.Printf("question generation handler placeholder: request_id=%s code=%s", payload.RequestID, payload.Code)
		return nil
	}))
	mustRegister(queue.RegisterTypedHandler(registry, queue.TaskAnswerEvaluate, func(ctx context.Context, payload queue.AnswerEvaluatePayload) error {
		log.Printf("answer evaluation handler placeholder: session_id=%s question_id=%s", payload.SessionID, payload.QuestionID)
		return nil
	}))
	mustRegister(queue.RegisterTypedHandler(registry, queue.TaskReportGenerate, func(ctx context.Context, payload queue.ReportGeneratePayload) error {
		log.Printf("report generation handler placeholder: session_id=%s student_id=%s", payload.SessionID, payload.StudentID)
		return nil
	}))
}

func mustRegister(err error) {
	if err != nil {
		log.Fatalf("register worker handler: %v", err)
	}
}
