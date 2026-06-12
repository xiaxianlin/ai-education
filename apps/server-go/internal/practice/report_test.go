package practice

import (
	"context"
	"errors"
	"testing"

	"ai-education/server-go/internal/ai"
	"ai-education/server-go/internal/queue"
)

// --- Stub dependencies ---

type stubReportGenerator struct {
	draft ai.PracticeReportDraft
	err   error
	called bool
}

func (g *stubReportGenerator) GenerateReport(ctx ai.Context, req ai.GenerateReportRequest) (ai.PracticeReportDraft, error) {
	g.called = true
	return g.draft, g.err
}

type captureEnqueuer struct {
	tasks []queue.Task
	err   error
}

func (e *captureEnqueuer) Enqueue(ctx context.Context, task queue.Task) (queue.TaskReceipt, error) {
	e.tasks = append(e.tasks, task)
	return queue.TaskReceipt{ID: task.ID, Name: task.Name}, e.err
}

// --- Helpers ---

func setupCompletedSession(repo *MemoryRepository, studentID, sessionID string) Practice {
	now := unixNow()
	session := Practice{
		ID:             sessionID,
		StudentID:      studentID,
		PracticeType:   PracticeTypeAbility,
		Subject:        "math",
		Grade:          3,
		AbilityCode:    "addition",
		QuestionCount:  2,
		AnswerCount:    2,
		CorrectCount:   1,
		Status:         PracticeStatusCompleted,
		GenerateStatus: GenerateStatusCompleted,
		StartTime:      now - 100,
		EndTime:        int64Ptr(now),
		CreateTime:     now - 200,
		UpdateTime:     now,
	}
	repo.practices[sessionID] = session
	return session
}

func int64Ptr(v int64) *int64 {
	return &v
}

func setupAnsweredSession(repo *MemoryRepository, studentID, sessionID string) {
	session := setupCompletedSession(repo, studentID, sessionID)

	for i := 0; i < session.QuestionCount; i++ {
		qID := sessionID + "-q" + string(rune('0'+i))
		repo.questions[qID] = PracticeQuestion{
			ID:               qID,
			QuestionTypeCode: "choice",
			Subject:          session.Subject,
			Grade:            session.Grade,
		}
		status := AnswerStatusCorrect
		if i > 0 {
			status = AnswerStatusIncorrect
		}
		repo.nextAnswerID++
		q := repo.questions[qID]
		repo.answers[answerKey(sessionID, qID)] = PracticeAnswer{
			ID:            repo.nextAnswerID,
			SessionID:     sessionID,
			QuestionID:    qID,
			StudentID:     studentID,
			QuestionOrder: i + 1,
			Status:        status,
			CreateTime:    unixNow(),
			UpdateTime:    unixNow(),
			Question:      &q,
		}
	}
}

// --- Tests ---

func TestHandleReportGenerate_MissingSessionID(t *testing.T) {
	svc := NewService(nil, nil, nil)
	err := svc.HandleReportGenerate(context.Background(), queue.ReportGeneratePayload{})
	if err == nil {
		t.Fatal("expected error for empty session_id")
	}
}

func TestHandleReportGenerate_MissingStudentID(t *testing.T) {
	svc := NewService(nil, nil, nil)
	err := svc.HandleReportGenerate(context.Background(), queue.ReportGeneratePayload{
		SessionID: "s1",
	})
	if err == nil {
		t.Fatal("expected error for empty student_id")
	}
}

func TestHandleReportGenerate_SessionNotCompleted(t *testing.T) {
	repo := NewMemoryRepository()
	repo.practices["s1"] = Practice{
		ID:        "s1",
		StudentID: "stu1",
		Status:    PracticeStatusInProgress,
	}
	generator := &stubReportGenerator{
		draft: ai.PracticeReportDraft{OverallScore: 80},
	}
	svc := NewService(repo, nil, nil, generator)

	err := svc.HandleReportGenerate(context.Background(), queue.ReportGeneratePayload{
		SessionID: "s1",
		StudentID: "stu1",
	})
	if err == nil {
		t.Fatal("expected error for non-completed session")
	}
	if generator.called {
		t.Fatal("generator should not be called for non-completed session")
	}
}

func TestHandleReportGenerate_StudentIDMismatch(t *testing.T) {
	repo := NewMemoryRepository()
	repo.practices["s1"] = Practice{
		ID:        "s1",
		StudentID: "stu1",
		Status:    PracticeStatusCompleted,
	}
	generator := &stubReportGenerator{}
	svc := NewService(repo, nil, nil, generator)

	err := svc.HandleReportGenerate(context.Background(), queue.ReportGeneratePayload{
		SessionID: "s1",
		StudentID: "stu2",
	})
	if err == nil {
		t.Fatal("expected error for student ID mismatch")
	}
}

func TestHandleReportGenerate_HappyPath(t *testing.T) {
	repo := NewMemoryRepository()
	setupAnsweredSession(repo, "stu1", "s1")

	// Create base report first (simulates Complete() flow)
	repo.reports["s1"] = PracticeReport{
		SessionID:  "s1",
		StudentID:  "stu1",
		CreateTime: unixNow(),
	}

	generator := &stubReportGenerator{
		draft: ai.PracticeReportDraft{
			OverallScore:   85.5,
			CurrentAbility: 3.2,
			Strengths:      []string{"加法熟练", "计算速度快"},
			Weaknesses:     []string{"进位加法"},
			Recommendations: []string{"多练习进位加法"},
		},
	}
	svc := NewService(repo, nil, nil, generator)

	err := svc.HandleReportGenerate(context.Background(), queue.ReportGeneratePayload{
		SessionID: "s1",
		StudentID: "stu1",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !generator.called {
		t.Fatal("generator should have been called")
	}

	// Verify report was updated
	report := repo.reports["s1"]
	if report.OverallScore != 85.5 {
		t.Errorf("expected overall_score=85.5, got %v", report.OverallScore)
	}
	if len(report.Strengths) != 2 {
		t.Errorf("expected 2 strengths, got %d", len(report.Strengths))
	}
	if len(report.Weaknesses) != 1 {
		t.Errorf("expected 1 weakness, got %d", len(report.Weaknesses))
	}
}

func TestHandleReportGenerate_AIFailure(t *testing.T) {
	repo := NewMemoryRepository()
	setupAnsweredSession(repo, "stu1", "s1")
	repo.reports["s1"] = PracticeReport{SessionID: "s1", StudentID: "stu1", CreateTime: unixNow()}

	generator := &stubReportGenerator{
		err: errors.New("AI service unavailable"),
	}
	svc := NewService(repo, nil, nil, generator)

	err := svc.HandleReportGenerate(context.Background(), queue.ReportGeneratePayload{
		SessionID: "s1",
		StudentID: "stu1",
	})
	if err == nil {
		t.Fatal("expected error when AI fails")
	}
}

func TestHandleReportGenerate_NoReportGenerator(t *testing.T) {
	repo := NewMemoryRepository()
	setupAnsweredSession(repo, "stu1", "s1")

	svc := NewService(repo, nil, nil)

	err := svc.HandleReportGenerate(context.Background(), queue.ReportGeneratePayload{
		SessionID: "s1",
		StudentID: "stu1",
	})
	if err == nil {
		t.Fatal("expected error when reportGenerator is nil")
	}
}

func TestComplete_EnqueuesReportGenerate(t *testing.T) {
	repo := NewMemoryRepository()
	setupAnsweredSession(repo, "stu1", "s1")
	// Mark as in-progress so Complete() can transition it
	session := repo.practices["s1"]
	session.Status = PracticeStatusInProgress
	session.AnswerCount = session.QuestionCount
	repo.practices["s1"] = session

	enqueuer := &captureEnqueuer{}
	generator := &stubReportGenerator{}
	svc := NewService(repo, enqueuer, nil, generator)

	_, err := svc.Complete(context.Background(), "stu1", "s1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(enqueuer.tasks) != 1 {
		t.Fatalf("expected 1 enqueued task, got %d", len(enqueuer.tasks))
	}
	if enqueuer.tasks[0].Name != queue.TaskReportGenerate {
		t.Errorf("expected task name %s, got %s", queue.TaskReportGenerate, enqueuer.tasks[0].Name)
	}
}

func TestComplete_EnqueueFailureDoesNotBlock(t *testing.T) {
	repo := NewMemoryRepository()
	setupAnsweredSession(repo, "stu1", "s1")
	session := repo.practices["s1"]
	session.Status = PracticeStatusInProgress
	session.AnswerCount = session.QuestionCount
	repo.practices["s1"] = session

	enqueuer := &captureEnqueuer{err: errors.New("queue broken")}
	generator := &stubReportGenerator{}
	svc := NewService(repo, enqueuer, nil, generator)

	reportID, err := svc.Complete(context.Background(), "stu1", "s1")
	if err != nil {
		t.Fatalf("Complete should not fail when enqueue fails: %v", err)
	}
	if reportID <= 0 {
		t.Fatal("expected valid report ID")
	}
}

func TestNewReportGenerateTask_MissingStudentID(t *testing.T) {
	_, err := queue.NewReportGenerateTask(queue.ReportGeneratePayload{
		SessionID: "s1",
	})
	if err == nil {
		t.Fatal("expected error for missing student_id")
	}
}

func TestNewReportGenerateTask_MissingSessionID(t *testing.T) {
	_, err := queue.NewReportGenerateTask(queue.ReportGeneratePayload{
		StudentID: "stu1",
	})
	if err == nil {
		t.Fatal("expected error for missing session_id")
	}
}
