# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a K12 education platform built as a **monorepo** using pnpm workspace and Turborepo. The project consists of:

- **admin-web**: Admin dashboard (React 18 + Rsbuild + Ant Design 5)
- **student-web**: Student web app (React 18 + Rsbuild + shadcn/ui)
- **student-app**: Student mobile app (Flutter 3.0+ + Riverpod + GoRouter)
- **server**: FastAPI backend (monolithic, Python 3.12)
- **shared-web**: Web shared package (types, API clients, utilities)

## Common Development Commands

### Installation
```bash
pnpm install                                    # Install Node.js dependencies
cd apps/server && uv sync                       # Install Python dependencies
cd apps/student-app && flutter pub get          # Install Flutter dependencies
```

### Development
```bash
pnpm dev:all          # Start all services (admin-web + student-web + server)
pnpm dev:admin        # Admin dashboard only
pnpm dev:student      # Student web only
pnpm dev:server       # Backend only (port 7890)
cd apps/student-app && ./build.sh && flutter run   # Flutter app
```

### Build & Test
```bash
pnpm build:all        # Build all projects
pnpm build:admin
pnpm build:student
pnpm lint             # Lint all projects
pnpm test             # Run tests
```

### Code Generation
- **Flutter**: After modifying models, run `./build.sh` in `apps/student-app`
- **TypeScript**: Run `pnpm generate:types` for type generation

### Git Workflow
```bash
pnpm keep-all                    # Auto-commit and push all changes
pnpm keep-all "feat: add feature" # With custom message
```

## Architecture

### Monorepo Structure
- Uses **pnpm workspace** with **Turborepo** for build orchestration
- Apps in `apps/`, shared packages in `packages/`
- Node >= 18, pnpm >= 9.0.0 (defined in package.json)

### Backend Architecture
- **FastAPI** mounted as sub-applications: `/api/admin` and `/api/student`
- Each sub-app has independent middleware, exception handlers, and OpenAPI docs
- **Layered architecture**: Routes → Services → Database
- **SQLAlchemy 2.0 async** ORM with MySQL
- **Redis + Celery** for background tasks
- **LangChain/LangGraph** for AI workflows

### Frontend Architecture
- **admin-web**: Ant Design 5 + unstated-next for state management
- **student-web**: shadcn/ui + Tailwind CSS + unstated-next
- **API integration**: Unified through `@ai-education/shared-web` ApiClient (Axios-based)
  - admin-web: Module-specific API files (e.g., `pages/Student/api.ts`)
  - student-web: Centralized in `lib/api.ts`

### Mobile Architecture
- **Riverpod** for state management
- **GoRouter** for routing
- Code generation: json_serializable + freezed + build_runner
- **After model changes: always run `./build.sh`**

## Key Conventions

### Backend (apps/server)
- All routes use `snake_case` filenames (e.g., `unit.py`, `question.py`)
- Service layer in `services/` matching route structure
- **Must use SQLAlchemy 2.0 style**:
  - `Mapped[Type]` type annotations for model fields
  - `mapped_column()` instead of `Column()`
  - `select()` instead of `session.query()`
  - `AsyncSession` with async/await throughout
  - Use `selectinload` for one-to-many, `joinedload` for many-to-one
- API routes use **single form** for resources (e.g., `/unit`, `/student`)
- Use Pydantic schemas in `schema.py` for validation
- Authentication: JWT via `x-access-token` header
- Error handling: `ValueError` for business errors, `HTTPException` for HTTP errors
- **Python import order**: stdlib → third-party → local (absolute imports)

### Frontend (React)
- Page structure: `pages/[Feature]/[PageName]/`
  - `index.tsx`: Entry point with PageModel Provider
  - `models/PageModel.ts`: unstated-next container for state
  - `views/Main.tsx`: Main view component
  - `hooks/use[PageName]Hook.ts`: Business logic hooks
  - `components/`: Reusable components
- State management: unstated-next (global/page models) + ahooks (async utilities)
- Component naming: PascalCase (e.g., `UserProfile.tsx`)
- Hook naming: camelCase with `use` prefix (e.g., `useDailyPractice.ts`)

### Mobile (Flutter)
- After model changes: **always run** `./build.sh`
- Structure: `lib/screens/[feature]/` with data/presentation/providers subdirs
- Riverpod providers in `providers/` with `_provider.dart` suffix

### Naming Conventions
- **Python**: `snake_case` for files/variables/functions, `PascalCase` for classes
- **TypeScript**: `camelCase` for variables/functions, `PascalCase` for components/types
- **Dart**: `snake_case` for files, `camelCase` for variables, `PascalCase` for classes

## Important Technical Details

### API Response Format
Web APIs use unified `ApiResponse<T>` wrapper. The ApiClient automatically extracts `response.data.data`.

### LangGraph Workflows
Complex AI workflows defined in `apps/server/app/generation/[type]/graph.py`:
- Use `TypedDict` for state schema
- Node functions are `async def node_name(state: State) -> Dict[str, Any]`
- State fields without `NotRequired` are external inputs; with `NotRequired[Type]` are internal
- AI platform: 阿里云百炼AI, logging: Loguru, object storage: 阿里云 OSS

### Database Operations
- Use `selectinload` for one-to-many relationships
- Use `joinedload` for many-to-one relationships
- All queries use `select()` - never `session.query()`

### Python Import Order
1. Standard library imports
2. Third-party library imports
3. Local application imports (using absolute imports)

## Cursor Rules Integration

The project has extensive Cursor rules in `.cursor/rules/` that auto-apply based on file patterns:
- `project-overview`: Always applied - architecture overview
- `naming-conventions`: Always applied - naming standards
- `react-frontend`: Applied to `apps/admin-web/**` and `apps/student-web/**`
- `python-backend`: Applied to `apps/server/**`
- `flutter-mobile`: Applied to `apps/student-app/**`
- `api-design`: Applied for API design tasks
- `sqlalchemy-2.0.md`: SQLAlchemy 2.0 specific requirements

## Development Tips

1. **Cross-platform consistency**: Mobile app should reference student-web implementation for business logic
2. **Type safety**: All code must use type systems (TypeScript/Python type hints)
3. **Error handling**: All API calls and async operations require error handling
4. **Code generation**: Flutter models need `./build.sh` after changes
5. **Environment**: All config via environment variables, no hardcoding
6. **Sub-app docs**: Backend API docs at `/api/admin/docs` and `/api/student/docs` (not root `/docs`)
7. **Package managers**: Node.js (pnpm >= 9.0), Python (uv), Flutter (flutter pub get)

## Quick Reference

- **Project docs**: `README.md`, `AGENTS.md`, `.cursor/roles.md`
- **API docs**: `docs/API.md`
- **Database init**: `infra/mysql/00-init.sql`
- **Shared types**: `packages/shared-web/`
- **Backend entry**: `apps/server/main.py`
- **Frontend entries**: `apps/admin-web/src/`, `apps/student-web/src/`
- **Mobile entry**: `apps/student-app/lib/`
