package practice

import (
	"context"
	"fmt"

	"ai-education/server-go/internal/queue"
)

type GenerationStatusStore interface {
	GetPracticeByID(ctx context.Context, sessionID string) (*Practice, error)
	UpdatePractice(ctx context.Context, session Practice) error
}

type GeneratePlaceholderStrategy int

const (
	GeneratePlaceholderKeepGenerating GeneratePlaceholderStrategy = iota
	GeneratePlaceholderMarkFailed
)

type GeneratePlaceholderOptions struct {
	Strategy GeneratePlaceholderStrategy
}

func RegisterWorkerHandlers(registry queue.HandlerRegistry, store GenerationStatusStore, options GeneratePlaceholderOptions) error {
	return queue.RegisterTypedHandler(
		registry,
		queue.TaskPracticeGenerate,
		NewPracticeGeneratePlaceholderHandler(store, options),
	)
}

func NewPracticeGeneratePlaceholderHandler(store GenerationStatusStore, options GeneratePlaceholderOptions) func(context.Context, queue.PracticeGeneratePayload) error {
	return func(ctx context.Context, payload queue.PracticeGeneratePayload) error {
		if payload.SessionID == "" {
			return newValidationError("session_id 不能为空")
		}
		if options.Strategy == GeneratePlaceholderKeepGenerating {
			return nil
		}
		if store == nil {
			return ErrNotConfigured
		}

		session, err := store.GetPracticeByID(ctx, payload.SessionID)
		if err != nil {
			return err
		}
		session.GenerateStatus = GenerateStatusFailed
		session.UpdateTime = unixNow()
		if err := store.UpdatePractice(ctx, *session); err != nil {
			return fmt.Errorf("mark practice generation failed: %w", err)
		}
		return nil
	}
}
