package queue

import (
	"context"
	"fmt"
	"sort"
	"sync"
)

type Handler func(ctx context.Context, task Task) error

type HandlerRegistry interface {
	Register(name TaskName, handler Handler) error
	Handle(ctx context.Context, task Task) error
	Handler(name TaskName) (Handler, bool)
	TaskNames() []TaskName
}

type Registry struct {
	mu       sync.RWMutex
	handlers map[TaskName]Handler
}

func NewRegistry() *Registry {
	return &Registry{
		handlers: make(map[TaskName]Handler),
	}
}

func (registry *Registry) Register(name TaskName, handler Handler) error {
	if err := ValidateTaskName(name); err != nil {
		return err
	}
	if handler == nil {
		return fmt.Errorf("handler for %q is nil", name)
	}

	registry.mu.Lock()
	defer registry.mu.Unlock()
	if _, exists := registry.handlers[name]; exists {
		return fmt.Errorf("handler for %q is already registered", name)
	}
	registry.handlers[name] = handler
	return nil
}

func (registry *Registry) Handle(ctx context.Context, task Task) error {
	handler, ok := registry.Handler(task.Name)
	if !ok {
		return fmt.Errorf("handler for %q is not registered", task.Name)
	}
	return handler(ctx, task)
}

func (registry *Registry) Handler(name TaskName) (Handler, bool) {
	registry.mu.RLock()
	defer registry.mu.RUnlock()

	handler, ok := registry.handlers[name]
	return handler, ok
}

func (registry *Registry) TaskNames() []TaskName {
	registry.mu.RLock()
	defer registry.mu.RUnlock()

	names := make([]TaskName, 0, len(registry.handlers))
	for name := range registry.handlers {
		names = append(names, name)
	}
	sort.Slice(names, func(i, j int) bool {
		return names[i] < names[j]
	})
	return names
}

func RegisterTypedHandler[T any](registry HandlerRegistry, name TaskName, handler func(context.Context, T) error) error {
	if handler == nil {
		return fmt.Errorf("typed handler for %q is nil", name)
	}
	return registry.Register(name, func(ctx context.Context, task Task) error {
		payload, err := DecodePayload[T](task)
		if err != nil {
			return err
		}
		return handler(ctx, payload)
	})
}
