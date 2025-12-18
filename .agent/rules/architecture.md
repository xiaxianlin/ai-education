---
description: "Project high-level architecture, layering patterns, and monorepo structure"
globs: 
alwaysApply: true
---

# Project Architecture & Monorepo Structure

This project is a K12 education tutoring platform using a Monorepo architecture managed by pnpm workspaces and Turborepo.

## Project Structure Overview

- `apps/admin-web/`: Admin Frontend (React 18 + Rsbuild + Ant Design 5)
- `apps/student-web/`: Student Web Frontend (React 18 + Rsbuild + shadcn/ui)
- `apps/student-app/`: Student Mobile App (Flutter 3.0+ + Riverpod)
- `apps/server/`: Backend service (FastAPI + SQLAlchemy 2.0 + LangGraph)
- `packages/shared-web/`: Shared types, API client, and utilities for Web

## Layering Patterns

ALL implementations MUST follow the standard layering architecture:

### Backend (apps/server/)
`Routes Layer (API)` → `Service Layer (Business Logic)` → `Data Layer (Database/Models)`

- **Routes**: Handle HTTP requests, input validation (Pydantic), and call services.
- **Services**: Implement core business logic, orchestration, and DB transactions.
- **Data**: Models (SQLAlchemy) and raw data access.

### Frontend (Web)
`Pages` → `Main Views` → `Models (unstated-next)` → `Hooks` → `Components`

- **Pages**: Entry points and Provider injection.
- **Models**: State management containers using `unstated-next`.
- **Hooks**: Reusable business logic and data fetching (ahooks).

## Operational Instructions

1. **Cross-Platform Consistency**: When implementing features in `student-app`, MUST refer to `student-web` logic to ensure functional parity.
2. **Type Safety**: MUST use explicit types (TS `interface/type`, Python `Type Hints`, Dart `class`) for all public boundaries.
3. **Monorepo Awareness**: Before adding dependencies, check if they can be shared in `packages/` or if they should be scoped to a specific `apps/` directory.
