# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Education Platform (K12 educational tutoring tool) built as a monorepo using pnpm workspaces and Turborepo. It consists of multiple applications and shared packages.

## Architecture

### Applications (`apps/`)
- **admin** - Management dashboard (React + UmiJS + Ant Design Pro)
- **student** - Student frontend application (React + Rsbuild + TailwindCSS)
- **server** - Backend API server (Python FastAPI)
- **mobile** - Mobile application (Flutter)

### Shared Packages (`packages/`)
- **shared-types** - Shared TypeScript type definitions
- **shared-utils** - Shared utility functions
- **shared-api-client** - Shared API client

### Infrastructure (`infra/`)
- **mysql/** - Database initialization scripts
- **nginx/** - Nginx configuration

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
pnpm dev:server   # Backend API (typically http://localhost:7890)

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

### Type Generation
```bash
# Generate shared types from API schema
pnpm generate:types

# Generate API types for shared-types package
cd packages/shared-types && pnpm generate:api-types
```

### Docker
```bash
# Build all Docker images
pnpm docker:build

# Start all services with Docker Compose
pnpm docker:up

# Stop Docker services
pnpm docker:down
```

## Key Technical Details

### Monorepo Management
- Uses **pnpm workspaces** for package management
- Uses **Turborepo** for build orchestration and caching
- Uses **uv workspace** for Python dependency management

### Frontend Applications
- **Admin**: Built with UmiJS and Ant Design Pro, uses conventional UmiJS commands
- **Student**: Built with Rsbuild (React build tool), uses modern React patterns

### Shared Code
- Types are shared between frontend applications via `@ai-education/shared-types`
- API client is shared via `@ai-education/shared-api-client`
- Use `workspace:*` protocol for internal dependencies

### Backend
- Python FastAPI application
- Uses **uv** for dependency management (not pip/poetry)
- SQLAlchemy for database operations
- Redis for caching
- Supports multiple AI providers (OpenAI, Alibaba Cloud)

## Development Workflow

1. **Starting Development**: Use `pnpm dev:all` to start all services
2. **Making Changes**:
   - Frontend changes are hot-reloaded automatically
   - Backend changes with FastAPI are also hot-reloaded
   - Shared package changes require restarting dependent services
3. **Building**: Use `turbo run build` for efficient cached builds
4. **Testing**: Run `pnpm test` before committing changes

## Environment Requirements

- **Node.js**: >=18.0.0
- **pnpm**: >=8.0.0
- **Python**: >=3.12,<3.13
- **uv**: Latest version for Python package management

## Important Notes

- The project has recently migrated to monorepo structure (see docs/MONOREPO_MIGRATION.md)
- Always use workspace protocols (`workspace:*`) for internal dependencies
- Turborepo provides intelligent caching - builds will be faster for unchanged packages
- Flutter mobile app exists but is managed independently (not in pnpm workspace)
- Docker configurations are available for containerized deployment

## Common Troubleshooting

- If dependencies are missing, run `pnpm install:all`
- If Python dependencies are missing, run `cd apps/server && uv sync`
- If build fails, try `pnpm clean && pnpm build`
- For type errors, ensure shared types are built: `pnpm generate:types`