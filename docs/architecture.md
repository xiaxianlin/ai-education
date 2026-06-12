# Architecture Documentation - ai-education

This document outlines the architectural patterns and design decisions of the `ai-education` project.

## 1. Monorepo Strategy

The project uses a monorepo structure managed by **pnpm workspaces** and **Turborepo** for efficient development and build orchestration.

- `apps/`: Contains standalone applications (Admin Web, Student Web, Mobile, Server).
- `packages/`: Contains shared logic, API clients, and type definitions used across multiple applications.
- `infra/`: Infrastructure configuration including database migrations and server settings.

## 2. Backend Architecture (Go)

The backend follows a strict layered architecture as defined in [AGENTS.md](file:///Users/xiaxianlin/projects/ai-education/AGENTS.md).

### Layers

1. **Handler Layer**: Thin HTTP entry points under each `internal/{module}` package. Handlers parse requests and write the shared response envelope.
2. **Service Layer**: Contains core business logic, validation, and orchestration.
3. **Repository Layer**: Encapsulates SQL access through `database/sql` and module-specific repository interfaces.

### Key Patterns

- **Typed Request/Response Structs**: Module packages define request, response, and domain structs.
- **Explicit Wiring**: `cmd/api` wires config, database, repositories, services, and routes.
- **Shared Response Envelope**: Admin and student APIs return `{ status, message, data }`.
- **Repository Interfaces**: Services depend on interfaces so module tests can use fakes.

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

### AI Workflows

AI generation and evaluation are isolated behind the Go AI package.

- `apps/server-go/internal/ai` contains provider adapters and task-specific AI boundaries.
- Prompt files live under `apps/server-go/prompt`.

### Async Processing

Long-running generation flows are dispatched by the Go service and queue abstractions under `internal/queue`.

## 5. Shared Infrastructure

- **API Client**: A centralized `ApiClient` in `shared-web` handles token injection and response wrapping.
- **Logger**: Uses the Go service logging setup.
- **Settings**: Centralized configuration via `apps/server-go/internal/config`.
