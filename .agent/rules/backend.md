---
description: "FastAPI backend development standards for apps/server"
globs: "apps/server/**"
alwaysApply: false
---

# Backend Development Standards

## Tech Stack

- **Base**: Python 3.12 + FastAPI 0.115+.
- **Database**: SQLAlchemy 2.0 (Async) + MySQL.
- **Task Queue**: Celery + Redis.
- **AI**: LangChain + LangGraph + DashScope.

## Core Standards

- **Async First**: ALL database and external I/O MUST use `async`/`await`.
- **Type Safety**: Use Pydantic Schema for ALL request/response data validation.
- **Dependency Injection**: Use FastAPI `Depends` for Database, Auth, and Services.

## Architecture

- **Routes**: Define in `apps/server/admin/routes/` or `apps/server/student/routes/`.
- **Services**: Business logic MUST stay in `services/`. Do NOT put complex logic in routes.
- **Exceptions**: Use `ValueError` for business logic errors. Global handlers will convert them to appropriate HTTP responses.

## Database Practices

- Use `select(...)` for queries. Avoid legacy `Query` syntax.
- Use `joinedload` or `noload` to prevent N+1 issues when fetching relationships.
- MUST refresh instances after commit if return value depends on defaults/DB state.

## Operational Instructions

1. Before adding a new API endpoint, MUST define the corresponding Pydantic schemas in `schema.py`.
2. ALL background tasks MUST be submitted via `shared.worker.submit_task`.
3. Sensitive information (API Keys, DB Credentials) MUST NOT be hardcoded. Use OS environment variables or `.env`.
