package practice_test

import (
	"context"
	"testing"

	"ai-education/server-go/internal/ai"
	"ai-education/server-go/internal/practice"
)

func TestPersistGeneratedPracticeCreatesQuestionsAnswersAndCompletesGeneration(t *testing.T) {
	ctx := context.Background()
	repo := practice.NewMemoryRepository()
	service := practice.NewService(repo, nil, nil)
	session := practice.Practice{
		ID:             "session-1",
		StudentID:      "student-1",
		PracticeType:   practice.PracticeTypeAbility,
		Subject:        "math",
		Grade:          3,
		AbilityCode:    "A001",
		Status:         practice.PracticeStatusNotStarted,
		GenerateStatus: practice.GenerateStatusGenerating,
		StartTime:      1,
		CreateTime:     1,
		UpdateTime:     1,
	}
	if _, err := repo.CreatePractice(ctx, session); err != nil {
		t.Fatalf("CreatePractice() error = %v", err)
	}

	generateTime := 7
	result, err := service.PersistGeneratedPractice(ctx, practice.PersistGeneratedPracticeRequest{
		SessionID:    "session-1",
		GenerateTime: &generateTime,
		Questions: []ai.GeneratedQuestion{
			choiceQuestion("q-1", "Which one is 2 + 1?"),
			choiceQuestion("", "Which one is 4 - 1?"),
		},
	})
	if err != nil {
		t.Fatalf("PersistGeneratedPractice() error = %v", err)
	}
	if result.QuestionCount != 2 {
		t.Fatalf("QuestionCount = %d, want 2", result.QuestionCount)
	}
	if result.Session.GenerateStatus != practice.GenerateStatusCompleted {
		t.Fatalf("GenerateStatus = %d, want %d", result.Session.GenerateStatus, practice.GenerateStatusCompleted)
	}
	if result.Session.QuestionCount != 2 {
		t.Fatalf("session.QuestionCount = %d, want 2", result.Session.QuestionCount)
	}
	if result.Session.GenerateTime == nil || *result.Session.GenerateTime != generateTime {
		t.Fatalf("GenerateTime = %v, want %d", result.Session.GenerateTime, generateTime)
	}

	data, err := service.Detail(ctx, "student-1", "session-1")
	if err != nil {
		t.Fatalf("Detail() error = %v", err)
	}
	if len(data.Questions) != 2 {
		t.Fatalf("len(Questions) = %d, want 2", len(data.Questions))
	}
	if data.Questions[0].ID != "q-1" {
		t.Fatalf("first question ID = %q, want q-1", data.Questions[0].ID)
	}
	if data.Questions[1].ID == "" {
		t.Fatal("second question ID should be generated when AI output omits it")
	}
	if len(data.Answers) != 2 {
		t.Fatalf("len(Answers) = %d, want 2", len(data.Answers))
	}
	for index, answer := range data.Answers {
		if answer.QuestionOrder != index+1 {
			t.Fatalf("answer[%d].QuestionOrder = %d, want %d", index, answer.QuestionOrder, index+1)
		}
		if answer.Status != practice.AnswerStatusUnanswered {
			t.Fatalf("answer[%d].Status = %d, want unanswered", index, answer.Status)
		}
		if answer.StudentID != "student-1" {
			t.Fatalf("answer[%d].StudentID = %q, want student-1", index, answer.StudentID)
		}
	}
}

func TestPersistGeneratedPracticeRejectsStartedSession(t *testing.T) {
	ctx := context.Background()
	repo := practice.NewMemoryRepository()
	service := practice.NewService(repo, nil, nil)
	session := practice.Practice{
		ID:             "session-1",
		StudentID:      "student-1",
		PracticeType:   practice.PracticeTypeAbility,
		Subject:        "math",
		Grade:          3,
		AbilityCode:    "A001",
		Status:         practice.PracticeStatusInProgress,
		GenerateStatus: practice.GenerateStatusGenerating,
		CreateTime:     1,
		UpdateTime:     1,
	}
	if _, err := repo.CreatePractice(ctx, session); err != nil {
		t.Fatalf("CreatePractice() error = %v", err)
	}

	_, err := service.PersistGeneratedPractice(ctx, practice.PersistGeneratedPracticeRequest{
		SessionID: "session-1",
		Questions: []ai.GeneratedQuestion{
			choiceQuestion("q-1", "Which one is 2 + 1?"),
		},
	})
	if err == nil {
		t.Fatal("PersistGeneratedPractice() error = nil, want conflict")
	}
}

func choiceQuestion(id string, stem string) ai.GeneratedQuestion {
	return ai.GeneratedQuestion{
		ID:               id,
		QuestionTypeCode: "choice",
		Content: ai.QuestionContent{
			Stem: stem,
			Options: []ai.Option{
				{ID: "A", Text: "2"},
				{ID: "B", Text: "3"},
			},
		},
		Answer: ai.QuestionAnswer{
			CorrectValue: "B",
			AnalysisMode: "objective",
			Explanation:  "3 is the correct answer.",
		},
		Difficulty: "easy",
	}
}
