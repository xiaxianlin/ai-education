package queue

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

type TaskName string

const (
	TaskPracticeGenerate TaskName = "practice.generate"
	TaskQuestionGenerate TaskName = "question.generate"
	TaskAnswerEvaluate   TaskName = "answer.evaluate"
	TaskReportGenerate   TaskName = "report.generate"
)

var validTaskNames = map[TaskName]struct{}{
	TaskPracticeGenerate: {},
	TaskQuestionGenerate: {},
	TaskAnswerEvaluate:   {},
	TaskReportGenerate:   {},
}

type Task struct {
	ID          string          `json:"id,omitempty"`
	Name        TaskName        `json:"name"`
	Payload     json.RawMessage `json:"payload"`
	Queue       string          `json:"queue,omitempty"`
	EnqueuedAt  time.Time       `json:"enqueued_at"`
	ScheduledAt time.Time       `json:"scheduled_at,omitempty"`
	RetryCount  int             `json:"retry_count,omitempty"`
}

type TaskOption func(*Task)

func WithTaskID(id string) TaskOption {
	return func(task *Task) {
		task.ID = id
	}
}

func WithQueue(name string) TaskOption {
	return func(task *Task) {
		task.Queue = name
	}
}

func WithScheduledAt(at time.Time) TaskOption {
	return func(task *Task) {
		task.ScheduledAt = at
	}
}

func NewTask(name TaskName, payload any, opts ...TaskOption) (Task, error) {
	if err := ValidateTaskName(name); err != nil {
		return Task{}, err
	}

	rawPayload, err := json.Marshal(payload)
	if err != nil {
		return Task{}, fmt.Errorf("marshal task payload: %w", err)
	}

	task := Task{
		Name:       name,
		Payload:    rawPayload,
		EnqueuedAt: time.Now().UTC(),
	}
	for _, opt := range opts {
		opt(&task)
	}

	return task, nil
}

func ValidateTaskName(name TaskName) error {
	if _, ok := validTaskNames[name]; !ok {
		return fmt.Errorf("unknown task name %q", name)
	}
	return nil
}

func DecodePayload[T any](task Task) (T, error) {
	var payload T
	if len(task.Payload) == 0 {
		return payload, errors.New("task payload is empty")
	}
	if err := json.Unmarshal(task.Payload, &payload); err != nil {
		return payload, fmt.Errorf("decode task payload: %w", err)
	}
	return payload, nil
}
