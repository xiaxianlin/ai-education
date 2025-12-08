# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Education Platform (K12 educational tutoring tool) built as a unified monorepo using pnpm workspaces and Turborepo. It consists of multiple applications with a single consolidated backend server.

## Architecture

### Applications (`apps/`)
- **admin-web** - Management dashboard (React + Rsbuild + Ant Design Pro)
- **student-web** - Student frontend application (React + Rsbuild + shadcn/ui)
- **server** - Unified backend server (Python FastAPI) - combines API, AI services, and task processing
- **student-app** - Mobile application (Flutter)

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
# Install all dependencies (Node.js + Python)
pnpm install:all

# Install Node.js dependencies only
pnpm install

# Install Python dependencies
cd apps/server && uv sync
```

### Development
```bash
# Start all services in parallel
pnpm dev:all

# Start individual services
pnpm dev:admin    # Management dashboard (typically http://localhost:8000)
pnpm dev:student  # Student application (typically http://localhost:3000)

# Backend Development
# Start the unified server
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

# Mobile app build
cd apps/student-app && flutter build apk
cd apps/student-app && flutter build ios
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
```

### Mobile Development
```bash
# Run Flutter app
cd apps/student-app && flutter run

# Get Flutter dependencies
cd apps/student-app && flutter pub get

# Clean Flutter build cache
cd apps/student-app && flutter clean
```

## Key Technical Details

### Monorepo Management
- Uses **pnpm workspaces** for package management
- Uses **Turborepo** for build orchestration and caching
- Uses **uv workspace** for Python dependency management

### Package Management
- **Node.js**: pnpm workspace with apps/* pattern
- **Python**: uv workspace with server as member
- **Flutter**: standard pub package manager

### Frontend Applications
- **Admin**: Built with Rsbuild and Ant Design Pro
- **Student**: Built with Rsbuild and shadcn/ui

### Backend
- Python FastAPI application
- Uses **uv** for dependency management (not pip/poetry)
- SQLAlchemy for database operations
- Redis for caching
- Unified server combining API, AI services, and task processing

### AI Development
The server includes advanced AI capabilities:
- LangChain + LangGraph for AI workflows
- OpenAI API integration
- Alibaba Cloud DashScope SDK
- AI-powered question generation and processing

## Development Workflow

1. **Starting Development**: Use `pnpm dev:all` to start all services
2. **Making Changes**:
   - Frontend changes are hot-reloaded automatically
   - Backend changes with FastAPI are also hot-reloaded
   - Mobile app changes require hot restart in Flutter
3. **Building**: Use `turbo run build` for efficient cached builds
4. **Testing**: Run `pnpm test` before committing changes

## Environment Requirements

- **Node.js**: >=18.0.0
- **pnpm**: >=8.0.0
- **Python**: >=3.12,<3.13
- **uv**: Latest version for Python package management
- **Flutter**: Latest stable version with Dart SDK

## Important Notes

- This is a unified monorepo with 4 core applications (no shared packages)
- Single backend server consolidates API, AI, and task services
- Comprehensive mobile application with native features
- Role-based development system for specialized workflows
- Flutter mobile app is managed independently (not in pnpm workspace)

## Common Troubleshooting

- If dependencies are missing, run `pnpm install:all`
- If Python dependencies are missing, run `cd apps/server && uv sync`
- If build fails, try `pnpm clean && pnpm build`
- For Flutter issues, run `cd apps/student-app && flutter clean && flutter pub get`
- For backend issues, check that database and Redis are running