package queue

import (
	"context"
	"sync"
)

type MemoryEnqueuer struct {
	mu    sync.Mutex
	tasks []Task
}

func NewMemoryEnqueuer() *MemoryEnqueuer {
	return &MemoryEnqueuer{}
}

func (enqueuer *MemoryEnqueuer) Enqueue(ctx context.Context, task Task) (TaskReceipt, error) {
	if err := ctx.Err(); err != nil {
		return TaskReceipt{}, err
	}
	if err := ValidateTaskName(task.Name); err != nil {
		return TaskReceipt{}, err
	}
	if task.ID == "" {
		task.ID = newTaskID()
	}

	enqueuer.mu.Lock()
	enqueuer.tasks = append(enqueuer.tasks, task)
	enqueuer.mu.Unlock()

	return TaskReceipt{
		ID:         task.ID,
		Name:       task.Name,
		Queue:      task.Queue,
		EnqueuedAt: task.EnqueuedAt,
	}, nil
}

func (enqueuer *MemoryEnqueuer) Tasks() []Task {
	enqueuer.mu.Lock()
	defer enqueuer.mu.Unlock()

	tasks := make([]Task, len(enqueuer.tasks))
	copy(tasks, enqueuer.tasks)
	return tasks
}

func (enqueuer *MemoryEnqueuer) Dequeue() (Task, bool) {
	enqueuer.mu.Lock()
	defer enqueuer.mu.Unlock()

	if len(enqueuer.tasks) == 0 {
		return Task{}, false
	}
	task := enqueuer.tasks[0]
	enqueuer.tasks = enqueuer.tasks[1:]
	return task, true
}
