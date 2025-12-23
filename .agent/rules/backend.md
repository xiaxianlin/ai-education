---
description: "FastAPI backend development standards for apps/server"
globs: "apps/server/**"
alwaysApply: false
---

# Backend Development Standards

## Tech Stack

- **Base**: Python 3.12 + FastAPI 0.115+.
- **Database**: SQLAlchemy 2.0 (Async) + MySQL.
- **Package Management**: uv (use `uv sync`, `uv add`, `uv run`).
- **Task Queue**: Celery + Redis.
- **AI**: LangChain + LangGraph + DashScope.

## Core Standards

- **Async First**: ALL database and external I/O MUST use `async`/`await`.
- **Type Safety**: Use Pydantic V2 Schema for ALL request/response data validation.
- **List Responses**: MUST use `SearchResultSchema` for paginated results.
- **Exceptions**: Use `ValueError` for handled business logic errors or specific HTTP exceptions.

## Architecture

- **Modular Routes**: Define routes in `admin/[module]/route.py` or `student/[module]/route.py`.
- **Services**: Business logic MUST stay in module-specific `services/` or `shared/services/`.
- **AI Layers**: Complex generation logic MUST use LangGraph (defined in `generation/`).

## Database Practices (SQLAlchemy 2.0)

- Use `select(...)` for queries.
- **Eager Loading**: Use `joinedload` for required relationships to avoid N+1.
- **Transactions**: 
    - Use `await db.commit()` to persist changes.
    - Use `await db.refresh(instance)` after commit if updated fields are needed.
    - Ensure session is handled correctly via dependency injection.

## AI & Generation

- **LangGraph**: Workflows should be modular (Entry → Router → Workers → Aggregator).
- **Error Tolerance**: Prompt/Image generation errors should be caught locally if they shouldn't block the whole workflow.

## Operational Instructions

1. Before adding a new API endpoint, MUST define the corresponding Pydantic schemas in module's `schema.py`.
2. ALL background tasks MUST be submitted via `shared.worker.submit_task`.
3. Sensitive information MUST NOT be hardcoded. Use `.env`.
