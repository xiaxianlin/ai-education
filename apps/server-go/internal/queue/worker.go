package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	// DefaultMaxRetries is the maximum number of times a task will be retried
	// before being moved to the dead-letter queue.
	DefaultMaxRetries = 3

	// deadLetterSuffix is appended to the task queue key to form the DLQ key.
	deadLetterSuffix = ":dlq"
)

// Worker consumes tasks from Redis lists via BRPOP and dispatches them
// through the HandlerRegistry. One goroutine per registered task type.
type Worker struct {
	client      *redis.Client
	registry    HandlerRegistry
	taskNames   []TaskName
	pollTimeout time.Duration
	maxRetries  int
}

// NewWorker creates a Worker that will consume the given task types.
func NewWorker(client *redis.Client, registry HandlerRegistry, taskNames []TaskName) *Worker {
	return &Worker{
		client:      client,
		registry:    registry,
		taskNames:   taskNames,
		pollTimeout: 5 * time.Second,
		maxRetries:  DefaultMaxRetries,
	}
}

// SetMaxRetries configures the maximum retry count per task.
func (w *Worker) SetMaxRetries(n int) {
	if n > 0 {
		w.maxRetries = n
	}
}

// Start launches one consume goroutine per task type and blocks until
// the context is cancelled (all goroutines exit gracefully).
func (w *Worker) Start(ctx context.Context) {
	var wg sync.WaitGroup
	for _, name := range w.taskNames {
		wg.Add(1)
		go func(taskName TaskName) {
			defer wg.Done()
			w.consume(ctx, taskName)
		}(name)
	}
	wg.Wait()
}

// consume runs a blocking BRPOP loop for a single task-type queue.
func (w *Worker) consume(ctx context.Context, taskName TaskName) {
	key := redisKeyPrefix + string(taskName)

	for {
		select {
		case <-ctx.Done():
			log.Printf("[worker] stopping consumer for %s", taskName)
			return
		default:
		}

		// BRPOP with a short timeout so we can re-check ctx periodically.
		result, err := w.client.BRPop(ctx, w.pollTimeout, key).Result()
		if err != nil {
			if ctx.Err() != nil {
				// Context cancelled — exit gracefully.
				return
			}
			if err == redis.Nil {
				// Timeout — no task available, loop back.
				continue
			}
			log.Printf("[worker] ERROR: BRPOP %s: %v", key, err)
			time.Sleep(time.Second)
			continue
		}

		// result[0] = key, result[1] = value
		var task Task
		if err := json.Unmarshal([]byte(result[1]), &task); err != nil {
			log.Printf("[worker] ERROR: unmarshal task from %s: %v", key, err)
			continue
		}

		log.Printf("[worker] processing task %s (%s) attempt=%d", task.ID, task.Name, task.RetryCount+1)
		if err := w.registry.Handle(ctx, task); err != nil {
			log.Printf("[worker] ERROR: handle task %s/%s: %v", task.Name, task.ID, err)
			w.handleFailure(ctx, key, task)
		} else {
			log.Printf("[worker] completed task %s (%s)", task.ID, task.Name)
		}
	}
}

// handleFailure decides whether to retry a failed task or move it to the DLQ.
func (w *Worker) handleFailure(ctx context.Context, key string, task Task) {
	task.RetryCount++
	if task.RetryCount >= w.maxRetries {
		w.deadLetter(ctx, key, task)
		return
	}
	// Exponential backoff: 2^retryCount seconds (2s, 4s, 8s, ...).
	backoff := time.Duration(1<<uint(task.RetryCount)) * time.Second
	if backoff > 30*time.Second {
		backoff = 30 * time.Second
	}
	time.Sleep(backoff)
	w.requeue(ctx, key, task)
}

// requeue pushes a failed task back to the head of its Redis list for retry.
func (w *Worker) requeue(ctx context.Context, key string, task Task) {
	body, err := json.Marshal(task)
	if err != nil {
		log.Printf("[worker] ERROR: marshal task for requeue %s/%s: %v", task.Name, task.ID, err)
		return
	}
	if err := w.client.LPush(ctx, key, body).Err(); err != nil {
		log.Printf("[worker] ERROR: requeue task %s/%s: %v", task.Name, task.ID, err)
	} else {
		log.Printf("[worker] requeued task %s (%s) attempt=%d/%d", task.ID, task.Name, task.RetryCount, w.maxRetries)
	}
}

// deadLetter moves a permanently failed task to the dead-letter queue.
func (w *Worker) deadLetter(ctx context.Context, key string, task Task) {
	dlqKey := key + deadLetterSuffix
	body, err := json.Marshal(task)
	if err != nil {
		log.Printf("[worker] ERROR: marshal task for DLQ %s/%s: %v", task.Name, task.ID, err)
		return
	}
	if err := w.client.LPush(ctx, dlqKey, body).Err(); err != nil {
		log.Printf("[worker] ERROR: push to DLQ %s/%s: %v", task.Name, task.ID, err)
	} else {
		log.Printf("[worker] DLQ task %s (%s) after %d attempts — giving up", task.ID, task.Name, task.RetryCount)
	}
}

// Ping verifies the Redis connection is alive.
func (w *Worker) Ping(ctx context.Context) error {
	if w.client == nil {
		return fmt.Errorf("redis client is nil")
	}
	return w.client.Ping(ctx).Err()
}
