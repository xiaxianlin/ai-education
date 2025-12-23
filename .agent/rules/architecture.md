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
- `apps/student-app/`: Student Mobile App (Flutter 3.8+ + Riverpod 3.0)
- `apps/server/`: Backend service (FastAPI + SQLAlchemy 2.0 + LangGraph + uv)
- `packages/shared-web/`: Shared types, API client, and utilities for Web applications

## Layering Patterns

ALL implementations MUST follow the standard layering architecture:

### Backend (apps/server/)
`Routes Layer (admin/[module]/route.py)` → `Service Layer (admin/[module]/services/)` → `AI Layer (generation/)` → `Data Layer (shared/database.py)`

- **Modular Routes**: APIs are organized by feature modules (e.g., `admin/practice/route.py`).
- **Services**: Business logic stays within module-specific `services/` or `shared/services/`.
- **AI/LLM**: Complex workflows using LangGraph and LangChain.
- **Data**: Models (SQLAlchemy) and Pydantic schemas for data validation.

### Frontend (Web)
`Pages (pages/[Feature]/[PageName]/index.tsx)` → `Views (views/)` → `Models (models/)` → `Hooks` → `Components`

- **Pages**: Entry points with feature-specific `api.ts` and `types.d.ts`.
- **Main Views**: Sub-page layouts and complex view components.
- **Models**: State management using `unstated-next`.
- **Hooks**: Shared logic and data fetching with `ahooks` and custom hooks.
- **Components**: Feature-specific `parts/` or global `components/`.

## Operational Instructions

1. **Turborepo Orchestration**: Use `pnpm dev`, `pnpm build`, etc. at the root to run tasks across the monorepo.
2. **Cross-Platform Consistency**: When implementing features in `student-app`, MUST refer to `student-web` logic to ensure functional parity.
3. **Type Safety**: MUST use explicit types (TS `interface/type`, Python `Type Hints`, Dart `class`) for all public boundaries.
4. **Monorepo Awareness**: Before adding dependencies, check if they can be shared in `packages/` or if they should be scoped to a specific `apps/` directory.
