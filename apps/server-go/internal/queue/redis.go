package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	// redisKeyPrefix is the prefix for all queue keys in Redis.
	redisKeyPrefix = "ai-edu:queue:"
)

// RedisEnqueuer implements Enqueuer by pushing tasks into Redis lists,
// one list per task type. A separate Worker process consumes them via BRPOP.
type RedisEnqueuer struct {
	client *redis.Client
}

// NewRedisEnqueuer creates a new RedisEnqueuer.
// The caller should ensure the redis.Client is valid and connected.
func NewRedisEnqueuer(client *redis.Client) *RedisEnqueuer {
	return &RedisEnqueuer{client: client}
}

// Enqueue validates the task, assigns an ID if missing, serialises it to JSON,
// and LPUSHes it to the per-task-type Redis list.
func (enq *RedisEnqueuer) Enqueue(ctx context.Context, task Task) (TaskReceipt, error) {
	if err := ctx.Err(); err != nil {
		return TaskReceipt{}, err
	}
	if err := ValidateTaskName(task.Name); err != nil {
		return TaskReceipt{}, err
	}

	// Assign ID if not provided.
	if task.ID == "" {
		task.ID = newTaskID()
	}

	// Ensure EnqueuedAt is set.
	if task.EnqueuedAt.IsZero() {
		task.EnqueuedAt = time.Now().UTC()
	}

	// Serialise task to JSON.
	body, err := json.Marshal(task)
	if err != nil {
		return TaskReceipt{}, fmt.Errorf("marshal task for redis: %w", err)
	}

	// Determine the Redis list key.
	queueName := task.Queue
	if queueName == "" {
		queueName = string(task.Name)
	}
	key := redisKeyPrefix + queueName

	// LPUSH with a deadline derived from the context.
	if err := enq.client.LPush(ctx, key, body).Err(); err != nil {
		return TaskReceipt{}, fmt.Errorf("redis lpush %s: %w", key, err)
	}

	return TaskReceipt{
		ID:         task.ID,
		Name:       task.Name,
		Queue:      queueName,
		EnqueuedAt: task.EnqueuedAt,
	}, nil
}

// Client returns the underlying redis.Client, useful for health checks.
func (enq *RedisEnqueuer) Client() *redis.Client {
	return enq.client
}

// Close is a convenience method that closes the underlying Redis client.
func (enq *RedisEnqueuer) Close() error {
	if enq.client != nil {
		return enq.client.Close()
	}
	return nil
}
