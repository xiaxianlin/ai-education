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
- **List Responses**: MUST use `SearchResultSchema` for paginated results.
- **Exceptions**: Use `ValueError` for handled business logic errors.

## Architecture

- **Routes**: Define in `apps/server/admin/routes/` or `apps/server/student/routes/`.
- **Services**: Business logic MUST stay in `services/`.
- **AI Layers**: Complex generation logic MUST use LangGraph (defined in `generation/`).

## Database Practices (SQLAlchemy 2.0)

- Use `select(...)` for queries.
- **Eager Loading**: Use `joinedload` for required relationships to avoid N+1.
- **Lazy Loading**: Use `noload` to explicitly skip relationships when not needed.
- **Transactions**: Ensure `await db.commit()` and `await db.refresh(instance)` are used correctly.

## AI & Generation

- **LangGraph**: Workflows should be modular (Entry → Router → Workers → Aggregator).
- **Error Tolerance**: Prompt/Image generation errors should be caught locally if they shouldn't block the whole workflow.

## Operational Instructions

1. Before adding a new API endpoint, MUST define the corresponding Pydantic schemas in `schema.py`.
2. ALL background tasks MUST be submitted via `shared.worker.submit_task`.
3. Sensitive information MUST NOT be hardcoded. Use `.env`.
