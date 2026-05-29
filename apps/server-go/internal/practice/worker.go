package practice

import (
	"context"
	"fmt"
	"time"

	"ai-education/server-go/internal/ai"
	"ai-education/server-go/internal/queue"
)

type GenerationStatusStore interface {
	GetPracticeByID(ctx context.Context, sessionID string) (*Practice, error)
	UpdatePractice(ctx context.Context, session Practice) error
}

type GenerationRepository interface {
	Repository
	GetPracticeByID(ctx context.Context, sessionID string) (*Practice, error)
}

type QuestionGenerator interface {
	GenerateQuestions(ctx ai.Context, req ai.GenerateQuestionRequest) ([]ai.GeneratedQuestion, error)
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

func NewPracticeGenerateHandler(repo GenerationRepository, generator QuestionGenerator) func(context.Context, queue.PracticeGeneratePayload) error {
	service := NewService(repo, nil, nil)
	return func(ctx context.Context, payload queue.PracticeGeneratePayload) error {
		if payload.SessionID == "" {
			return newValidationError("session_id 不能为空")
		}
		if payload.GenerateCount == 0 {
			payload.GenerateCount = queue.DefaultPracticeGenerateCount
		}
		if repo == nil {
			return ErrNotConfigured
		}
		if generator == nil {
			return markPracticeGenerationFailed(ctx, repo, payload.SessionID, fmt.Errorf("%w: question generator is not configured", ErrNotConfigured))
		}

		session, err := repo.GetPracticeByID(ctx, payload.SessionID)
		if err != nil {
			return err
		}
		start := time.Now()
		questions, err := generator.GenerateQuestions(ctx, ai.GenerateQuestionRequest{
			Subject:          session.Subject,
			Grade:            session.Grade,
			Count:            payload.GenerateCount,
			QuestionTypeCode: defaultQuestionTypeCode(session),
			AbilityCode:      session.AbilityCode,
			UnitID:           session.UnitID,
			Params: map[string]any{
				"practice_type": session.PracticeType,
				"session_id":    session.ID,
			},
		})
		if err != nil {
			return markPracticeGenerationFailed(ctx, repo, payload.SessionID, err)
		}

		elapsed := int(time.Since(start).Seconds())
		if elapsed < 0 {
			elapsed = 0
		}
		_, err = service.PersistGeneratedPractice(ctx, PersistGeneratedPracticeRequest{
			SessionID:    payload.SessionID,
			Questions:    questions,
			GenerateTime: &elapsed,
		})
		if err != nil {
			return markPracticeGenerationFailed(ctx, repo, payload.SessionID, err)
		}
		return nil
	}
}

func defaultQuestionTypeCode(session *Practice) string {
	if session == nil {
		return "choice"
	}
	if session.PracticeType == PracticeTypeAbility {
		return "choice"
	}
	return "choice"
}

func markPracticeGenerationFailed(ctx context.Context, store GenerationStatusStore, sessionID string, cause error) error {
	if store == nil {
		return cause
	}
	session, err := store.GetPracticeByID(ctx, sessionID)
	if err != nil {
		return err
	}
	session.GenerateStatus = GenerateStatusFailed
	session.UpdateTime = unixNow()
	if updateErr := store.UpdatePractice(ctx, *session); updateErr != nil {
		return fmt.Errorf("mark practice generation failed after %v: %w", cause, updateErr)
	}
	return cause
}
