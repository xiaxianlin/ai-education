package queue

import (
	"context"
	"testing"
)

func TestNewPracticeGenerateTaskUsesDefaultCount(t *testing.T) {
	task, err := NewPracticeGenerateTask(PracticeGeneratePayload{
		SessionID: "session-1",
	})
	if err != nil {
		t.Fatalf("NewPracticeGenerateTask() error = %v", err)
	}

	payload, err := DecodePayload[PracticeGeneratePayload](task)
	if err != nil {
		t.Fatalf("DecodePayload() error = %v", err)
	}

	if task.Name != TaskPracticeGenerate {
		t.Fatalf("task.Name = %q, want %q", task.Name, TaskPracticeGenerate)
	}
	if payload.GenerateCount != DefaultPracticeGenerateCount {
		t.Fatalf("payload.GenerateCount = %d, want %d", payload.GenerateCount, DefaultPracticeGenerateCount)
	}
}

func TestMemoryEnqueuerStoresTasks(t *testing.T) {
	enqueuer := NewMemoryEnqueuer()
	task, err := NewReportGenerateTask(ReportGeneratePayload{
		SessionID: "session-1",
		StudentID: "stu1",
	}, WithTaskID("task-1"))
	if err != nil {
		t.Fatalf("NewReportGenerateTask() error = %v", err)
	}

	receipt, err := enqueuer.Enqueue(context.Background(), task)
	if err != nil {
		t.Fatalf("Enqueue() error = %v", err)
	}

	if receipt.ID != "task-1" {
		t.Fatalf("receipt.ID = %q, want task-1", receipt.ID)
	}
	if len(enqueuer.Tasks()) != 1 {
		t.Fatalf("len(Tasks()) = %d, want 1", len(enqueuer.Tasks()))
	}

	dequeued, ok := enqueuer.Dequeue()
	if !ok {
		t.Fatal("Dequeue() ok = false, want true")
	}
	if dequeued.Name != TaskReportGenerate {
		t.Fatalf("dequeued.Name = %q, want %q", dequeued.Name, TaskReportGenerate)
	}
}

func TestRegistryTypedHandler(t *testing.T) {
	registry := NewRegistry()
	var got PracticeGeneratePayload

	err := RegisterTypedHandler(registry, TaskPracticeGenerate, func(ctx context.Context, payload PracticeGeneratePayload) error {
		got = payload
		return nil
	})
	if err != nil {
		t.Fatalf("RegisterTypedHandler() error = %v", err)
	}

	task, err := NewPracticeGenerateTask(PracticeGeneratePayload{
		SessionID:     "session-1",
		GenerateCount: 3,
	})
	if err != nil {
		t.Fatalf("NewPracticeGenerateTask() error = %v", err)
	}
	if err := registry.Handle(context.Background(), task); err != nil {
		t.Fatalf("Handle() error = %v", err)
	}

	if got.SessionID != "session-1" || got.GenerateCount != 3 {
		t.Fatalf("got = %+v, want session-1 count 3", got)
	}
}

func TestUnknownTaskNameRejected(t *testing.T) {
	if _, err := NewTask(TaskName("other.task"), struct{}{}); err == nil {
		t.Fatal("NewTask() error = nil, want error")
	}
}
