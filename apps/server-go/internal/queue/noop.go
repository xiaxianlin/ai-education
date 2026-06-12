package queue

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

type NoopEnqueuer struct{}

func NewNoopEnqueuer() *NoopEnqueuer {
	return &NoopEnqueuer{}
}

func (enqueuer *NoopEnqueuer) Enqueue(ctx context.Context, task Task) (TaskReceipt, error) {
	if err := ctx.Err(); err != nil {
		return TaskReceipt{}, err
	}
	if err := ValidateTaskName(task.Name); err != nil {
		return TaskReceipt{}, err
	}
	if task.ID == "" {
		task.ID = newTaskID()
	}
	return TaskReceipt{
		ID:         task.ID,
		Name:       task.Name,
		Queue:      task.Queue,
		EnqueuedAt: task.EnqueuedAt,
	}, nil
}

func newTaskID() string {
	var bytes [16]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return fmt.Sprintf("task-%d", timeNowUnixNano())
	}
	return hex.EncodeToString(bytes[:])
}
