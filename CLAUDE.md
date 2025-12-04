# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a K12 AI education platform with three main components:
- **Admin Portal** (`/admin`) - Management system for teachers and administrators using Ant Design Pro
- **Student Portal** (`/student`) - Learning interface for students using React + Rsbuild + Tailwind CSS
- **Backend Server** (`/server`) - Python FastAPI backend with AI capabilities using LangGraph

## Development Commands

### Student Portal (React + Rsbuild)
```bash
cd student
pnpm install        # Install dependencies
pnpm dev            # Start development server
pnpm build          # Build for production
pnpm preview        # Preview production build
pnpm type-check     # TypeScript type checking
```

### Admin Portal (Ant Design Pro + UmiJS)
```bash
cd admin
pnpm install        # Install dependencies
pnpm dev            # Start development server (equivalent to start:dev)
pnpm build          # Build for production
pnpm preview        # Preview production build
pnpm lint           # Run ESLint
pnpm lint:fix       # Fix linting issues
pnpm tsc            # TypeScript type checking
```

### Backend Server (Python + FastAPI)
```bash
cd server
uv sync             # Install dependencies with uv
uv run uvicorn main:app --reload    # Start development server
uv run pytest       # Run tests
```

### Docker Deployment
```bash
./scripts/quickstart.sh    # One-click startup
./scripts/deploy.sh status # Check service status
./scripts/deploy.sh logs   # View logs
./scripts/deploy.sh restart # Restart services
```

## Architecture

### Frontend Architecture

#### Student Portal (`/student`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Rsbuild (Rspack-based)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Form Handling**: Controlled components with validation
- **Key Directories**:
  - `src/components/` - Reusable UI components
  - `src/pages/` - Route-level page components
  - `src/hooks/` - Custom React hooks (ahooks library)
  - `src/stores/` - Zustand state stores
  - `src/types/` - TypeScript type definitions
  - `src/utils/` - Utility functions

#### Admin Portal (`/admin`)
- **Framework**: React 18 with TypeScript and UmiJS
- **UI Components**: Ant Design Pro components
- **Styling**: TailwindCSS + Less
- **Build Tool**: UmiJS Max
- **Key Directories**:
  - `src/pages/` - Page components following UmiJS conventions
  - `src/components/` - Reusable components
  - `src/services/` - API service functions
  - `src/utils/` - Utility functions

### Backend Architecture (`/server`)

**Core Structure:**
- `main.py` - FastAPI application entry point
- `admin/` - Admin-specific routes and services
- `student/` - Student-specific routes and services
- `shared/` - Shared services and utilities
- `core/` - Core configuration and middleware

**Key Services:**
- `shared/question/` - AI question generation using LangGraph
- `shared/database.py` - Database connection and session management
- `shared/auth.py` - JWT authentication
- `shared/oss.py` - Alibaba Cloud OSS file storage

**AI Integration:**
- LangGraph for question generation workflows
- Support for multiple AI platforms (Dashscope, OpenAI)
- PDF processing with PyMuPDF
- Audio processing with ffmpeg and pydub

**Database:**
- SQLAlchemy ORM with async support (asyncmy)
- MySQL database with connection pooling
- Redis for caching and session storage

## Code Conventions

### TypeScript/JavaScript
- Use functional components with React hooks
- Follow ESLint and Prettier configurations
- Prefer named exports over default exports
- Use TypeScript strict mode
- Component files use PascalCase naming
- Utility functions use camelCase naming

### Python
- Follow PEP 8 conventions
- Use type hints for all functions and variables
- Use async/await for database operations
- Follow FastAPI patterns for route definitions
- Use Pydantic models for request/response validation

### API Design
- RESTful endpoints with consistent patterns
- Standardized response format: `{code, message, data}`
- JWT token-based authentication
- Comprehensive error handling with appropriate HTTP status codes
- API endpoints organized by domain (admin vs student)

### Database Conventions
- Table names use snake_case
- All tables include `create_time` and `update_time` fields
- Use SQLAlchemy ORM models with proper relationships
- Database migrations managed through SQL scripts in `/mysql/init/`

## Testing

### Frontend Testing
- Admin portal includes Jest configuration
- Testing Library for React component testing
- Run tests with `npm test` in respective directories

### Backend Testing
- pytest for async FastAPI endpoints
- Test files should be named `test_*.py`
- Run tests with `uv run pytest` in `/server`

## Deployment & Infrastructure

### Development Setup
1. Copy `.env.example` to `.env` and configure environment variables
2. Each component can be run independently using the commands above
3. Default ports: Admin (8000), Student (3000), Server (7890)

### Production Deployment
- Docker Compose configuration in `docker-compose.yml`
- Nginx reverse proxy configuration in `/nginx/`
- Database initialization scripts in `/mysql/init/`
- Deployment automation in `/scripts/deploy.sh`

### Environment Variables
Key variables that must be configured:
- `AI_PLATFORM` - AI provider (dashscope/openai)
- `AI_PLATFORM_KEY` - AI service API key
- `DATABASE_URL` - MySQL connection string
- `REDIS_URL` - Redis connection string
- `ALIYUN_*` - Alibaba Cloud service credentials

## Important Notes

1. **Security**: Never commit API keys or sensitive credentials. Use environment variables.
2. **Database**: Schema changes require careful consideration and proper migration scripts.
3. **AI Features**: Question generation is handled by LangGraph workflows in `/server/shared/question/`.
4. **File Storage**: All file uploads go through Alibaba Cloud OSS.
5. **Authentication**: JWT tokens are used for both admin and student authentication.
6. **Error Handling**: All API endpoints should include proper error handling and logging.
7. **Performance**: Use Redis caching for frequently accessed data and optimize database queries.

## Development Workflow

1. Feature development should start with database design if needed
2. Create backend API endpoints first
3. Build frontend components and pages
4. Test components independently
5. Integration testing across components
6. Use Docker Compose for full-stack testing before deployment

## Troubleshooting

- Check container logs: `docker-compose logs [service-name]`
- Database connection issues: Verify `DATABASE_URL` and MySQL service status
- AI service errors: Validate AI platform credentials and network connectivity
- Build failures: Clear node_modules and reinstall dependencies