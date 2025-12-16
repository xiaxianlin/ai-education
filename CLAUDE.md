# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a K12 educational tutoring platform built as a unified monorepo using pnpm workspaces and Turborepo. It consolidates multiple applications with a single backend server.

## Architecture

### Applications (`apps/`)
- **admin-web** - Management dashboard (React 18 + Rsbuild + Ant Design 5, TypeScript + Less + Tailwind CSS)
- **student-web** - Student frontend (React 18 + Rsbuild + shadcn/ui, TypeScript + Tailwind CSS + Zustand)
- **server** - Unified backend server (Python 3.12 + FastAPI, SQLAlchemy 2.0 async ORM, MySQL + Redis + Celery)
- **student-app** - Mobile application (Flutter 3.0+, Dart 3.8+, Riverpod + GoRouter)

### Infrastructure (`infra/`)
- **mysql/** - Database initialization scripts
- **nginx/** - Nginx configuration

## Development Role System

This project includes a comprehensive role-based development system. Refer to `.cursor/roles.md` for detailed role switching instructions:

Available roles:
- @frontend - Frontend development (admin-web + student-web)
- @backend - Backend development (server)
- @app - Mobile development (student-app)
- @architect - System architecture
- @fullstack - Full-stack development
- @ui-designer - UI/UX design

Application-specific commands:
- @admin-web, @student-web, @student-app, @server

## Development Commands

### Setup and Installation
```bash
# Install all dependencies (Node.js + Python + Flutter)
pnpm install:all

# Install Node.js dependencies only
pnpm install

# Install Python dependencies
cd apps/server && uv sync

# Install Flutter dependencies
cd apps/student-app && flutter pub get
```

### Development
```bash
# Start all services in parallel
pnpm dev:all

# Start individual services
pnpm dev:admin    # Management dashboard (typically http://localhost:8000)
pnpm dev:student  # Student application (typically http://localhost:3000)

# Backend Development (unified server combining API + AI services + task processing)
cd apps/server && uv run uvicorn main:app --reload --host 0.0.0.0 --port 7890

# Start task worker
cd apps/server && uv run worker.py

# Start all backend services
pnpm dev:server

# Run all development tasks via Turborepo
pnpm dev
```

### Building
```bash
# Build all projects
pnpm build:all
# or
turbo run build

# Build individual applications
pnpm build:admin
pnpm build:student
pnpm build:server

# Mobile app build
cd apps/student-app && flutter build apk
cd apps/student-app && flutter build ios
pnpm build:app:android
pnpm build:app:ios
```

### Testing and Quality
```bash
# Run tests across all projects
pnpm test

# Run linting across all projects
pnpm lint

# Type checking
pnpm type-check

# Code formatting
pnpm format
```

### Type Checking
```bash
# Frontend type checking
pnpm dev:student && pnpm type-check
cd apps/admin-web && pnpm tsc

# Mobile code analysis
cd apps/student-app && flutter analyze

# Generate types from OpenAPI schema
pnpm generate:types
```

### Mobile Development
```bash
# Run Flutter app (requires code generation first)
cd apps/student-app && ./build.sh && flutter run

# Get Flutter dependencies
cd apps/student-app && flutter pub get

# Clean Flutter build cache
cd apps/student-app && flutter clean

# Generate code (JSON serialization, freezed, etc.)
cd apps/student-app && dart run build_runner build
```

## Key Technical Details

### Monorepo Management
- Uses **pnpm workspaces** for package management
- Uses **Turborepo** for build orchestration and caching
- Uses **uv workspace** for Python dependency management
- Root package manager: pnpm@8.15.0

### Package Management
- **Node.js**: pnpm workspace with apps/* pattern
- **Python**: uv workspace with server as member (Python 3.12+)
- **Flutter**: standard pub package manager with code generation

### Frontend Applications
- **Admin**: React 18 + Rsbuild + Ant Design Pro + TypeScript 5 + ahooks + Axios
- **Student**: React 18 + Rsbuild + shadcn/ui + TypeScript 5 + Zustand + react-router-dom + Axios

### Backend (Unified Server)
- Python 3.12 + FastAPI 0.115+ application
- Uses **uv** for dependency management (not pip/poetry)
- SQLAlchemy 2.0 async ORM for database operations
- MySQL database + Redis for caching + Celery for task queues
- Combined API, AI services, and task processing in single application
- JWT authentication + Alibaba Cloud services (DashScope AI, OSS storage)
- Loguru for logging

### AI Development
The server includes advanced AI capabilities:
- LangChain + LangGraph for AI workflows
- OpenAI API integration
- Alibaba Cloud DashScope SDK
- AI-powered question generation and processing

### Mobile Application
- Flutter 3.0+ with Dart 3.8+
- Riverpod for state management
- GoRouter 17.0 for navigation
- Dio 5.4.0 for networking
- Material Design UI
- Code generation: json_serializable, freezed, build_runner

## Development Workflow

1. **Starting Development**: Use `pnpm dev:all` to start all services
2. **Making Changes**:
   - Frontend changes are hot-reloaded automatically
   - Backend changes with FastAPI are also hot-reloaded
   - Mobile app changes require hot restart in Flutter (run `./build.sh` first)
3. **Building**: Use `turbo run build` for efficient cached builds
4. **Testing**: Run `pnpm test` before committing changes
5. **Mobile development**: Always run code generation before starting Flutter app

## Environment Requirements

- **Node.js**: >=18.0.0
- **pnpm**: >=8.0.0 (packageManager: pnpm@8.15.0)
- **Python**: >=3.12,<3.13
- **uv**: Latest version for Python package management
- **Flutter**: Latest stable version with Dart SDK
- **Database**: MySQL
- **Cache**: Redis

## Architecture Principles

1. **Unified Backend**: Single server consolidates API, AI, and task services
2. **Layered Architecture**: Route layer → Service layer → Data layer
3. **Type Safety**: All code must use type systems (TypeScript/Python Type Hints/Dart)
4. **Error Handling**: All API calls and async operations must have error handling
5. **Environment Variables**: All configuration via environment variables, no hardcoding
6. **Cross-Platform Consistency**: Mobile app should reference Web implementation logic

## Important Notes

- This is a unified monorepo with 4 core applications (no shared packages)
- Single backend server consolidates API, AI, and task services
- Mobile app requires code generation before running (`./build.sh`)
- Comprehensive Cursor rules system in `.cursor/rules/` for specialized workflows
- Flutter mobile app is managed independently (not in pnpm workspace)

## Common Troubleshooting

- If dependencies are missing, run `pnpm install:all`
- If Python dependencies are missing, run `cd apps/server && uv sync`
- If Flutter dependencies are missing, run `cd apps/student-app && flutter pub get`
- If build fails, try `pnpm clean && pnpm build`
- For Flutter issues, run `cd apps/student-app && flutter clean && flutter pub get && ./build.sh`
- For backend issues, check that database and Redis are running
- For mobile development, always run code generation before starting the app