package practice_test

import (
	"context"
	"testing"

	"ai-education/server-go/internal/practice"
	"ai-education/server-go/internal/queue"
)

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
