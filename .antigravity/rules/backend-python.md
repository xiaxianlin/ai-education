# Backend Python Configuration Rules

## Core Standards

- **Python Version**: 3.12+
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0 (Strictly use async mode)
- **Validation**: Pydantic 2.0+

## Layered Architecture

- **Routes (`route.py`)**: Thin wrappers for endpoints. Use `APIRouter`.
- **Services (`services/`)**: Core business and orchestration logic.
- **Models (`shared/core/database/`)**: Declarative base models.

## Coding Patterns

- **Async/Await**: Mandatory for all DB and I/O operations.
- **Type Hints**: Mandatory for all function signatures and complex variables.
- **SQLAlchemy 2.0 Style**:
  - Use `select(Model)` and `db.scalar()` / `db.scalars()`.
  - Avoid `session.query(Model)`.
  - Use `joinedload` or `selectinload` for relationship fetching.
- **Error Handling**: Use `ValueError` for business logic errors; let the global exception handler convert to HTTP responses.
- **Logging**: Use `loguru` with `log_error` helper for exception context.

## AI Integration

- **LangGraph**: Orchestrate multi-node AI workflows in `shared/generation/`.
- **Celery**: Offload long-running tasks via `submit_task`.
