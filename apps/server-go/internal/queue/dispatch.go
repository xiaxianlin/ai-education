package queue

import (
	"context"
	"log"
)

type DispatchEnqueuer struct {
	Registry HandlerRegistry
	Async    bool
}

func NewDispatchEnqueuer(registry HandlerRegistry, async bool) *DispatchEnqueuer {
	return &DispatchEnqueuer{Registry: registry, Async: async}
}

func (enqueuer *DispatchEnqueuer) Enqueue(ctx context.Context, task Task) (TaskReceipt, error) {
	if err := ctx.Err(); err != nil {
		return TaskReceipt{}, err
	}
	if err := ValidateTaskName(task.Name); err != nil {
		return TaskReceipt{}, err
	}
	if task.ID == "" {
		task.ID = newTaskID()
	}
	receipt := TaskReceipt{
		ID:         task.ID,
		Name:       task.Name,
		Queue:      task.Queue,
		EnqueuedAt: task.EnqueuedAt,
	}
	if enqueuer == nil || enqueuer.Registry == nil {
		return receipt, nil
	}
	if enqueuer.Async {
		go func() {
			if err := enqueuer.Registry.Handle(context.Background(), task); err != nil {
				log.Printf("dispatch task %s failed: %v", task.Name, err)
			}
		}()
		return receipt, nil
	}
	if err := enqueuer.Registry.Handle(ctx, task); err != nil {
		return TaskReceipt{}, err
	}
	return receipt, nil
}
