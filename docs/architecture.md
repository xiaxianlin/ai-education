# Architecture Documentation - ai-education

This document outlines the architectural patterns and design decisions of the `ai-education` project.

## 1. Monorepo Strategy

The project uses a monorepo structure managed by **pnpm workspaces** and **Turborepo** for efficient development and build orchestration.

- `apps/`: Contains standalone applications (Admin Web, Student Web, Mobile, Server).
- `packages/`: Contains shared logic, API clients, and type definitions used across multiple applications.
- `infra/`: Infrastructure configuration including database migrations and server settings.

## 2. Backend Architecture (FastAPI)

The backend follows a strict layered architecture as defined in [AGENTS.md](file:///Users/xiaxianlin/projects/ai-education/AGENTS.md).

### Layers

1. **Route Layer (`route.py`)**: Thin entry points using FastAPI's `APIRouter`. Handles request parameters and dependency injection (e.g., `Database`).
2. **Service Layer (`services/`)**: Contains core business logic, orchestrating database operations and external services.
3. **Data Layer (`shared/core/database/`)**: Uses **SQLAlchemy 2.0** with an asynchronous engine. Models inherit from a shared `BaseModel`.

### Key Patterns

- **Pydantic Schemas**: Strict data validation for all inputs and outputs.
- **Dependency Injection**: Database sessions and authentication filters are injected via FastAPI's `Depends`.
- **Global Error Handling**: Centralized exception handlers in `shared/core/exception.py`.

## 3. Frontend Architecture (React)

Both Admin and Student webs follow a consistent pattern for separating logic from presentation.

### State Management

- **unstated-next**: Uses "Container" patterns to wrap pages with state and logic.
- **ahooks**: Leverages `useRequest` for managed API interactions.

### Component Structure

- **Models**: `models/page.ts` contains the state and business logic (Hooks).
- **Views**: UI is split into `Main`, `List`, `Form`, and `Detail` components.
- **Hooks**: Reusable logic is extracted into shared hooks (e.g., `useSimpleForm`, `useDelete`).

## 4. AI & Background Workflows

The system integrates advanced AI capabilities for practice generation and evaluation.

### LangGraph Workflows

Complex sequences (like generating an entire practice session) are orchestrated using **LangGraph**.

- See [graph.py](file:///Users/xiaxianlin/projects/ai-education/apps/server/shared/generation/practice/graph.py) for the practice generation node graph.

### Async Processing

Long-running tasks are offloaded to **Celery** with **Redis** as the message broker.

- **Celery Worker**: Defined in `worker.py`.
- **Task Submission**: Managed via a unified `submit_task` interface in `shared/worker/celery.py`.

## 5. Shared Infrastructure

- **API Client**: A centralized `ApiClient` in `shared-web` handles token injection and response wrapping.
- **Logger**: Uses `loguru` with customized formatting and rotation.
- **Settings**: Centralized configuration via `pydantic-settings` in `shared/core/settings.py`.
