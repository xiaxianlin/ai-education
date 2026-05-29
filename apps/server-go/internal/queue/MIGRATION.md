# Queue Migration

Owner: Agent 3

## Scope

Replace Python Celery task execution with a Go Redis-backed worker boundary.

## Task Names

- `practice.generate`
- `question.generate`
- `answer.evaluate`
- `report.generate`

## Python Sources

- `apps/server/shared/worker/celery.py`
- `apps/server/shared/worker/executor.py`
- `apps/server/worker.py`

## Rule

The API service should enqueue work and return quickly. Long-running AI generation belongs in the worker.

