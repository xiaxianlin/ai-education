package queue

import (
	"context"
	"time"
)

type TaskReceipt struct {
	ID         string
	Name       TaskName
	Queue      string
	EnqueuedAt time.Time
}

type Enqueuer interface {
	Enqueue(ctx context.Context, task Task) (TaskReceipt, error)
}

type EnqueueFunc func(ctx context.Context, task Task) (TaskReceipt, error)

func (fn EnqueueFunc) Enqueue(ctx context.Context, task Task) (TaskReceipt, error) {
	return fn(ctx, task)
}
