package practice_test

import (
	"context"
	"testing"

	"ai-education/server-go/internal/ai"
	"ai-education/server-go/internal/practice"
	"ai-education/server-go/internal/queue"
)

type fakeQuestionGenerator struct {
	questions []ai.GeneratedQuestion
	err       error
}

func (g fakeQuestionGenerator) GenerateQuestions(ctx ai.Context, req ai.GenerateQuestionRequest) ([]ai.GeneratedQuestion, error) {
	if g.err != nil {
		return nil, g.err
	}
	return g.questions, nil
}

func TestPracticeGeneratePlaceholderCanMarkFailed(t *testing.T) {
	ctx := context.Background()
	repo := practice.NewMemoryRepository()
	session := practice.Practice{
		ID:             "session-1",
		StudentID:      "student-1",
		PracticeType:   practice.PracticeTypeAbility,
		AbilityCode:    "A001",
		Status:         practice.PracticeStatusNotStarted,
		GenerateStatus: practice.GenerateStatusGenerating,
		CreateTime:     1,
		UpdateTime:     1,
	}
	if _, err := repo.CreatePractice(ctx, session); err != nil {
		t.Fatalf("CreatePractice() error = %v", err)
	}

	handler := practice.NewPracticeGeneratePlaceholderHandler(repo, practice.GeneratePlaceholderOptions{
		Strategy: practice.GeneratePlaceholderMarkFailed,
	})
	if err := handler(ctx, queue.PracticeGeneratePayload{SessionID: "session-1", GenerateCount: 3}); err != nil {
		t.Fatalf("handler() error = %v", err)
	}

	got, err := repo.GetPractice(ctx, "student-1", "session-1")
	if err != nil {
		t.Fatalf("GetPractice() error = %v", err)
	}
	if got.GenerateStatus != practice.GenerateStatusFailed {
		t.Fatalf("GenerateStatus = %d, want %d", got.GenerateStatus, practice.GenerateStatusFailed)
	}
	state := practice.ResolveState(*got)
	if state.Step != "failed" {
		t.Fatalf("state.Step = %q, want failed", state.Step)
	}
}

func TestPracticeGeneratePlaceholderCanKeepGenerating(t *testing.T) {
	ctx := context.Background()
	repo := practice.NewMemoryRepository()
	session := practice.Practice{
		ID:             "session-1",
		StudentID:      "student-1",
		PracticeType:   practice.PracticeTypeAbility,
		AbilityCode:    "A001",
		Status:         practice.PracticeStatusNotStarted,
		GenerateStatus: practice.GenerateStatusGenerating,
		CreateTime:     1,
		UpdateTime:     1,
	}
	if _, err := repo.CreatePractice(ctx, session); err != nil {
		t.Fatalf("CreatePractice() error = %v", err)
	}

	handler := practice.NewPracticeGeneratePlaceholderHandler(repo, practice.GeneratePlaceholderOptions{
		Strategy: practice.GeneratePlaceholderKeepGenerating,
	})
	if err := handler(ctx, queue.PracticeGeneratePayload{SessionID: "session-1", GenerateCount: 3}); err != nil {
		t.Fatalf("handler() error = %v", err)
	}

	got, err := repo.GetPractice(ctx, "student-1", "session-1")
	if err != nil {
		t.Fatalf("GetPractice() error = %v", err)
	}
	if got.GenerateStatus != practice.GenerateStatusGenerating {
		t.Fatalf("GenerateStatus = %d, want %d", got.GenerateStatus, practice.GenerateStatusGenerating)
	}
}

func TestPracticeGenerateHandlerPersistsGeneratedQuestions(t *testing.T) {
	ctx := context.Background()
	repo := practice.NewMemoryRepository()
	session := practice.Practice{
		ID:             "session-1",
		StudentID:      "student-1",
		PracticeType:   practice.PracticeTypeAbility,
		Subject:        "math",
		Grade:          3,
		AbilityCode:    "A001",
		Status:         practice.PracticeStatusNotStarted,
		GenerateStatus: practice.GenerateStatusGenerating,
		CreateTime:     1,
		UpdateTime:     1,
	}
	if _, err := repo.CreatePractice(ctx, session); err != nil {
		t.Fatalf("CreatePractice() error = %v", err)
	}

	handler := practice.NewPracticeGenerateHandler(repo, fakeQuestionGenerator{
		questions: []ai.GeneratedQuestion{
			{
				ID:               "q-1",
				QuestionTypeCode: "choice",
				Content: ai.QuestionContent{
					Stem: "Which one is 2 + 1?",
					Options: []ai.Option{
						{ID: "A", Text: "2"},
						{ID: "B", Text: "3"},
					},
				},
				Answer: ai.QuestionAnswer{
					CorrectValue: "B",
					AnalysisMode: "objective",
				},
			},
		},
	})
	if err := handler(ctx, queue.PracticeGeneratePayload{SessionID: "session-1", GenerateCount: 1}); err != nil {
		t.Fatalf("handler() error = %v", err)
	}

	got, err := repo.GetPractice(ctx, "student-1", "session-1")
	if err != nil {
		t.Fatalf("GetPractice() error = %v", err)
	}
	if got.GenerateStatus != practice.GenerateStatusCompleted || got.QuestionCount != 1 {
		t.Fatalf("practice = %+v, want completed with 1 question", got)
	}
	data, err := repo.GetPracticeData(ctx, "student-1", "session-1")
	if err != nil {
		t.Fatalf("GetPracticeData() error = %v", err)
	}
	if len(data.Questions) != 1 || len(data.Answers) != 1 {
		t.Fatalf("generated data = %+v, want 1 question and 1 answer", data)
	}
}
