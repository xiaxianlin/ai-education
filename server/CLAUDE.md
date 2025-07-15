# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
AI Helper is a FastAPI-based educational AI server that provides AI-powered tutoring and question-answering services. The system integrates with multiple AI providers (Alibaba Cloud, Doubao, DeepSeek) and supports both user-facing and administrative interfaces.

## Architecture
- **FastAPI** web framework with async support
- **SQLAlchemy** ORM with MySQL backend
- **Redis** for caching
- **Neo4j** for knowledge graph storage
- **Alibaba Cloud OSS** for file storage
- **Multi-provider AI integration** (Alibaba, Doubao, DeepSeek)

## Key Components

### Directory Structure
- `ai/models/` - AI provider integrations organized by model type (asr, llm, tts, vision, multi)
- `core/` - Core application configuration and utilities
- `route/` - API routes split into `admin/` and `user/` namespaces
- `service/` - Business logic layer
- `store/` - Data storage abstractions (database, cache, oss, neo4j, rag)
- `schema/` - Pydantic models for request/response validation

### Data Models
- **User Management**: User, UserProfile, UserSubject
- **Content**: Subject, TextbookVersion, Textbook, CourseUnit, Knowledge
- **Questions**: Question, Solution, SolutionHistory, SolutionMessage
- **Admin**: Manager

## Development Commands

### Setup
```bash
# Install dependencies
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv
source .venv/bin/activate
uv sync

# Configure environment
cp .env.example .env  # Create and configure .env file
```

### Running
```bash
# Development server
uv run main.py

# Production deployment
pm2 start ecosystem.config.js

# Alternative production run
uvicorn main:app --host 0.0.0.0 --port 7010 --workers 2
```

### Environment Variables
Key configuration in `.env`:
- Database: `DATABASE_URL`
- Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- AI Providers: `ALIYUN_*`, `DOUBAO_*`, `DEEPSEEK_*`
- OSS Storage: `ALIYUN_OSS_*`
- Neo4j: `NEO4J_URL`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`
- Admin: `ADMIN_USERNAME`, `ADMIN_PASSWORD`

### API Structure
- **User APIs**: `/api/user/*` - User authentication and question answering
- **Admin APIs**: `/api/admin/*` - Management interface for content and users
- All routes use JWT authentication via `core.auth`

### AI Integration
The system supports multiple AI providers through a modular architecture:
- **ASR**: Automatic Speech Recognition
- **LLM**: Large Language Models for tutoring
- **TTS**: Text-to-Speech for audio responses
- **Vision**: Image analysis and OCR
- **Multi-modal**: Combined AI capabilities

### Database
Uses SQLAlchemy with MySQL backend. Models defined in `store/database/models.py`. Database initialization handled in `store/database/__init__.py`.

### File Storage
Alibaba Cloud OSS integration for storing PDFs, audio files, and other media. Configuration in `store/oss/`.

### Cache Layer
Redis-based caching with configurable thresholds via `REDIS_CACHE_THRESHOLD`.