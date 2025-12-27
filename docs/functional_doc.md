# AI Education Platform - Functional Document

## 1. System Architecture

The platform is organized as a monorepo containing multiple applications and shared packages:

- **`apps/server`**: FastAPI backend providing API services and core business logic.
- **`apps/admin-web`**: React-based administration portal for managing content and configurations.
- **`apps/student-web`**: React-based web application for students to perform practice sessions.
- **`apps/student-app`**: Flutter-based mobile application for students (if applicable/present).
- **`packages/shared-web`**: Shared TypeScript types and constants for frontend apps.

## 2. Core Data Schema

Key database tables managed via SQLAlchemy in `apps/server/shared/core/database.py`:

- **`ah_practice`**: Defines practice types (Daily Training, Unit Test, etc.) and their configurations.
- **`ah_prompt`**: Stores LLM prompt templates and parameters.
- **`ah_practice_prompt`**: Links practice types with specific prompts and educational scope (grade, subject).
- **`ah_question_type`**: Configures various question interaction styles and AI generation schemas.
- **`ah_question`**: The central repository for generated and manually entered questions.
- **`ah_practice_session`**: Tracks the state and progress of an individual student's practice session.
- **`ah_practice_session_answer`**: Records student responses and AI-generated analysis.

## 3. Question Generation Workflow

The generation process uses **LangGraph** to manage a state-driven workflow (`apps/server/shared/generation/question/graph.py`):

1. **`entry`**: Validated session and environment state.
2. **`load_data`**: Recalls existing questions from the database and loads educational context (strategy-specific).
3. **`build_prompt`**: Constructs the LLM prompt using strategy-specific logic (e.g., `DailyPracticeStrategy`).
4. **`call_llm`**: Invokes the LLM provider to generate new questions based on the prompt.
5. **`handle_resource`**: Parallelly generates supplementary assets (images/audio) if required by the question types.
6. **`update_questions`**: Persists new questions and updates the practice session.

## 4. Practice Strategies

The system supports multiple practice strategies via a registry pattern (`apps/server/shared/practice/strategies/`):

- **`daily_practice`**: Focuses on mixed review and weak point reinforcement.
- **`unit_test`**: Targeted towards specific textbook units.
- **`assessment`**: Comprehensive evaluation of student ability.

## 5. LLM Provider Integration

The `shared/provider` module abstracts the LLM calls, supporting different providers and maintaining consistency in chain invocation and parsing.

## 6. Frontend Functionality

- **Admin Portal**:
  - **Resource Management**: CRUD operations for textbooks, units, and knowledge points.
  - **Configuration**: Management of Prompts, Practice Types, and Question Types.
- **Student Portal**:
  - **Practice Interface**: Dynamic rendering of questions based on `interaction_type`.
  - **Feedback & Results**: Display of session reports and detailed answer analysis.
  - **Record Tracking**: History of past practice sessions.
