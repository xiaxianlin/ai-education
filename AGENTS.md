# AGENTS.md

## Project Overview

This is an AI Education platform consisting of three main components:
- **Admin Portal** (`/admin`) - Management system for teachers and administrators
- **Student Portal** (`/student`) - Learning interface for students
- **Backend Server** (`/server`) - Python FastAPI backend with AI capabilities

## Technology Stack

### Admin Frontend (`/admin`)
- Framework: UmiJS (React-based)
- UI Library: Ant Design Pro
- Styling: TailwindCSS + Less
- Package Manager: pnpm
- Language: TypeScript

### Student Frontend (`/student`)
- Framework: React with Rsbuild
- UI Library: shadcn/ui components
- Styling: TailwindCSS
- Package Manager: pnpm
- Language: TypeScript

### Backend Server (`/server`)
- Framework: FastAPI (Python)
- AI Framework: LangGraph
- Database: MySQL
- Package Manager: uv
- Language: Python 3.x

## Project Structure

```
├── admin/          # Admin management portal
├── student/        # Student learning portal
├── server/         # Python FastAPI backend
├── mysql/          # Database initialization scripts
├── nginx/          # Nginx configuration
├── scripts/        # Deployment scripts
└── docker-compose.yml
```

## Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations in each project
- Use functional components with hooks in React
- Prefer named exports over default exports

### Python
- Follow PEP 8 conventions
- Use type hints for all functions
- Organize code into routes, services, and schemas
- Use async/await for database operations

## Development Commands

### Admin Portal
```bash
cd admin
pnpm install
pnpm dev
```

### Student Portal
```bash
cd student
pnpm install
pnpm dev
```

### Backend Server
```bash
cd server
uv sync
uv run uvicorn main:app --reload
```

## File Organization

### Backend (`/server`)
- `admin/routes/` - Admin API endpoints
- `admin/services/` - Admin business logic
- `student/routes/` - Student API endpoints
- `student/services/` - Student business logic
- `shared/` - Shared utilities and services
- `core/` - Core framework configurations

### Frontend
- `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/services/` - API service functions
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions

## Important Notes

1. **Database**: MySQL is used as the primary database. Check `/mysql/init/` for schema
2. **AI Features**: LangGraph is used for AI question generation in `/server/shared/question/`
3. **Deployment**: Docker Compose is used for containerized deployment
4. **Proxy**: Development proxy configurations are in `/admin/config/proxy.ts`

## Restrictions

- Do not modify database schema files without explicit approval
- Do not commit sensitive credentials or API keys
- Always test changes locally before pushing
- Follow existing patterns when adding new features
