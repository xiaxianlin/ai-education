package queue

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

// setupMiniredis creates an in-memory Redis server and a connected client.
func setupMiniredis(t *testing.T) (*miniredis.Miniredis, *redis.Client) {
	t.Helper()
	mr := miniredis.NewMiniRedis()
	if err := mr.Start(); err != nil {
		t.Fatalf("start miniredis: %v", err)
	}
	client := redis.NewClient(&redis.Options{
		Addr: mr.Addr(),
	})
	t.Cleanup(func() {
		client.Close()
		mr.Close()
	})
	return mr, client
}

func TestRedisEnqueuerEnqueue(t *testing.T) {
	_, client := setupMiniredis(t)
	enq := NewRedisEnqueuer(client)

	task, err := NewPracticeGenerateTask(PracticeGeneratePayload{
		SessionID:     "session-abc",
		GenerateCount: 5,
	})
	if err != nil {
		t.Fatalf("NewPracticeGenerateTask() error = %v", err)
	}

	receipt, err := enq.Enqueue(context.Background(), task)
	if err != nil {
		t.Fatalf("Enqueue() error = %v", err)
	}

	if receipt.ID == "" {
		t.Fatal("receipt.ID is empty, expected non-empty task ID")
	}
	if receipt.Name != TaskPracticeGenerate {
		t.Fatalf("receipt.Name = %q, want %q", receipt.Name, TaskPracticeGenerate)
	}

	// Verify the task was pushed to the correct Redis list.
	key := redisKeyPrefix + string(TaskPracticeGenerate)
	llen, err := client.LLen(context.Background(), key).Result()
	if err != nil {
		t.Fatalf("LLen() error = %v", err)
	}
	if llen != 1 {
		t.Fatalf("list length = %d, want 1", llen)
	}
}

func TestRedisEnqueuerPreservesTaskID(t *testing.T) {
	_, client := setupMiniredis(t)
	enq := NewRedisEnqueuer(client)

	task, err := NewReportGenerateTask(ReportGeneratePayload{
		SessionID: "session-xyz",
		StudentID: "stu1",
	}, WithTaskID("custom-id-123"))
	if err != nil {
		t.Fatalf("NewReportGenerateTask() error = %v", err)
	}

	receipt, err := enq.Enqueue(context.Background(), task)
	if err != nil {
		t.Fatalf("Enqueue() error = %v", err)
	}
	if receipt.ID != "custom-id-123" {
		t.Fatalf("receipt.ID = %q, want custom-id-123", receipt.ID)
	}
}

func TestRedisEnqueuerRejectsInvalidTaskName(t *testing.T) {
	_, client := setupMiniredis(t)
	enq := NewRedisEnqueuer(client)

	task := Task{
		Name:    TaskName("invalid.task"),
		Payload: []byte(`{}`),
	}

	_, err := enq.Enqueue(context.Background(), task)
	if err == nil {
		t.Fatal("Enqueue() error = nil, want error for invalid task name")
	}
}

func TestWorkerConsumesTask(t *testing.T) {
	_, client := setupMiniredis(t)

	// Set up a handler that records what it received.
	var handledTask Task
	registry := NewRegistry()
	err := registry.Register(TaskPracticeGenerate, func(ctx context.Context, task Task) error {
		handledTask = task
		return nil
	})
	if err != nil {
		t.Fatalf("Register() error = %v", err)
	}

	// Enqueue a task.
	enq := NewRedisEnqueuer(client)
	task, err := NewPracticeGenerateTask(PracticeGeneratePayload{
		SessionID:     "session-worker-test",
		GenerateCount: 10,
	})
	if err != nil {
		t.Fatalf("NewPracticeGenerateTask() error = %v", err)
	}
	if _, err := enq.Enqueue(context.Background(), task); err != nil {
		t.Fatalf("Enqueue() error = %v", err)
	}

	// Start the worker with a cancellable context.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	worker := NewWorker(client, registry, []TaskName{TaskPracticeGenerate})
	worker.pollTimeout = 1 * time.Second

	done := make(chan struct{})
	go func() {
		worker.Start(ctx)
		close(done)
	}()

	// Give the worker time to consume.
	time.Sleep(500 * time.Millisecond)

	// Verify the handler was called.
	if handledTask.ID == "" {
		t.Fatal("handler was not called; task was not consumed")
	}
	if handledTask.Name != TaskPracticeGenerate {
		t.Fatalf("handledTask.Name = %q, want %q", handledTask.Name, TaskPracticeGenerate)
	}

	// Verify payload can be decoded.
	payload, err := DecodePayload[PracticeGeneratePayload](handledTask)
	if err != nil {
		t.Fatalf("DecodePayload() error = %v", err)
	}
	if payload.SessionID != "session-worker-test" {
		t.Fatalf("payload.SessionID = %q, want session-worker-test", payload.SessionID)
	}
	if payload.GenerateCount != 10 {
		t.Fatalf("payload.GenerateCount = %d, want 10", payload.GenerateCount)
	}

	// Verify the list is now empty (miniredis processes synchronously).
	key := redisKeyPrefix + string(TaskPracticeGenerate)
	llen, _ := client.LLen(context.Background(), key).Result()
	if llen != 0 {
		t.Fatalf("list length after consume = %d, want 0", llen)
	}

	// Cancel the context and verify the worker exits.
	cancel()
	select {
	case <-done:
		// OK
	case <-time.After(3 * time.Second):
		t.Fatal("worker.Start() did not exit after context cancellation")
	}
}

func TestWorkerRequeuesOnHandlerError(t *testing.T) {
	_, client := setupMiniredis(t)

	// Handler that fails the first time, then succeeds.
	callCount := 0
	registry := NewRegistry()
	err := registry.Register(TaskReportGenerate, func(ctx context.Context, task Task) error {
		callCount++
		if callCount == 1 {
			return context.DeadlineExceeded
		}
		return nil
	})
	if err != nil {
		t.Fatalf("Register() error = %v", err)
	}

	enq := NewRedisEnqueuer(client)
	task, err := NewReportGenerateTask(ReportGeneratePayload{
		SessionID: "session-retry",
		StudentID: "stu1",
	}, WithTaskID("retry-task-1"))
	if err != nil {
		t.Fatalf("NewReportGenerateTask() error = %v", err)
	}
	if _, err := enq.Enqueue(context.Background(), task); err != nil {
		t.Fatalf("Enqueue() error = %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	worker := NewWorker(client, registry, []TaskName{TaskReportGenerate})
	worker.pollTimeout = 1 * time.Second

	go worker.Start(ctx)

	// Wait for the handler to be called twice (fail + retry success).
	// Note: Worker has exponential backoff (2s for first retry), so allow extra time.
	deadline := time.After(8 * time.Second)
	for callCount < 2 {
		select {
		case <-deadline:
			t.Fatalf("timed out waiting for retry; callCount = %d", callCount)
		default:
			time.Sleep(50 * time.Millisecond)
		}
	}

	// Verify the task was processed successfully on retry.
	key := redisKeyPrefix + string(TaskReportGenerate)
	llen, _ := client.LLen(context.Background(), key).Result()
	if llen != 0 {
		t.Fatalf("list length after successful retry = %d, want 0", llen)
	}

	cancel()
}

func TestWorkerDeadLetterAfterMaxRetries(t *testing.T) {
	_, client := setupMiniredis(t)

	// Handler that always fails.
	registry := NewRegistry()
	err := registry.Register(TaskReportGenerate, func(ctx context.Context, task Task) error {
		return context.DeadlineExceeded
	})
	if err != nil {
		t.Fatalf("Register() error = %v", err)
	}

	enq := NewRedisEnqueuer(client)
	task, err := NewReportGenerateTask(ReportGeneratePayload{
		SessionID: "session-dlq",
		StudentID: "stu1",
	}, WithTaskID("dlq-task-1"))
	if err != nil {
		t.Fatalf("NewReportGenerateTask() error = %v", err)
	}
	if _, err := enq.Enqueue(context.Background(), task); err != nil {
		t.Fatalf("Enqueue() error = %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	worker := NewWorker(client, registry, []TaskName{TaskReportGenerate})
	worker.pollTimeout = 1 * time.Second
	worker.SetMaxRetries(2) // Low limit for faster test

	go worker.Start(ctx)

	// Wait for the task to be processed maxRetries times and land in DLQ.
	// Backoffs: 2s + 4s = ~6s total. Allow generous timeout.
	key := redisKeyPrefix + string(TaskReportGenerate)
	dlqKey := key + deadLetterSuffix

	deadline := time.After(15 * time.Second)
	for {
		dlqLen, _ := client.LLen(context.Background(), dlqKey).Result()
		if dlqLen >= 1 {
			break // Task landed in DLQ
		}
		select {
		case <-deadline:
			t.Fatal("timed out waiting for task to reach DLQ")
		default:
			time.Sleep(100 * time.Millisecond)
		}
	}

	// Verify the main queue is empty.
	llen, _ := client.LLen(context.Background(), key).Result()
	if llen != 0 {
		t.Fatalf("main queue length = %d, want 0 (task should be in DLQ)", llen)
	}

	// Verify DLQ has the task.
	dlqLen, _ := client.LLen(context.Background(), dlqKey).Result()
	if dlqLen != 1 {
		t.Fatalf("DLQ length = %d, want 1", dlqLen)
	}

	cancel()
}

func TestRedisClientParseURL(t *testing.T) {
	mr := miniredis.NewMiniRedis()
	if err := mr.Start(); err != nil {
		t.Fatalf("start miniredis: %v", err)
	}
	defer mr.Close()

	url := "redis://" + mr.Addr() + "/0"
	client, err := NewRedisClient(url)
	if err != nil {
		t.Fatalf("NewRedisClient() error = %v", err)
	}
	defer client.Close()

	if err := client.Ping(context.Background()).Err(); err != nil {
		t.Fatalf("Ping() error = %v", err)
	}
}

func TestRedisClientInvalidURL(t *testing.T) {
	_, err := NewRedisClient("not-a-valid-url")
	if err == nil {
		t.Fatal("NewRedisClient() error = nil, want error for invalid URL")
	}
}
