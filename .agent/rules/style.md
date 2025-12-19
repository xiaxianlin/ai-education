---
description: "Naming conventions and code organization across all projects and languages"
globs: 
alwaysApply: true
---

# Naming & Style Conventions

## General Principles

- **Be Descriptive**: Prioritize clarity over brevity (e.g., `user_registration_status` instead of `user_status`).
- **Use Domain Language**: Follow the terminology used in K12 education (e.g., `textbook`, `unit`, `knowledge_point`).

## Python (Backend)

- **Files**: `snake_case.py` (e.g., `user_service.py`).
- **Classes**: `PascalCase` (e.g., `QuestionModel`).
- **Methods/Variables**: `snake_case` (e.g., `def create_unit(...)`).
- **AI/LLM Nodes**: Node functions in LangGraph MUST use `snake_case_node` suffix (e.g., `call_llm_node`).
- **Constants**: `UPPER_SNAKE_CASE`.

## TypeScript/React (Frontend)

- **Files (Components)**: `PascalCase.tsx` (e.g., `UserProfile.tsx`).
- **Files (Hooks/Utils)**: `camelCase.ts` (e.g., `usePractice.ts`).
- **Variables/Functions**: `camelCase` (e.g., `const handleClick = ...`).
- **Types/Interfaces**: `PascalCase`.
- **Constants**: `UPPER_SNAKE_CASE`.

## AI Workflow Naming

- **State Model**: `PascalCase` (e.g., `QuestionGenerationState`).
- **Node Functions**: `snake_case` (e.g., `entry_node`, `call_llm_node`).

## Import Ordering

1. Built-in/Standard libraries
2. External/Third-party packages
3. Local project modules (use absolute imports for Python: `from shared.core...`)

## Implementation Steps

1. Before committing, MUST run the platform-specific formatter (`pnpm lint:fix` for Web, `uv run ruff format` for Python).
2. MUST NOT use magic numbers; define them as constants in a dedicated `constants/` or `utils/` file.
