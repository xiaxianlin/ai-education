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
- **Constants**: `UPPER_SNAKE_CASE`.

## TypeScript/React (Frontend)

- **Files (Components)**: `PascalCase.tsx` (e.g., `UserProfile.tsx`).
- **Files (Hooks/Utils)**: `camelCase.ts` (e.g., `usePractice.ts`).
- **Variables/Functions**: `camelCase` (e.g., `const handleClick = ...`).
- **Types/Interfaces**: `PascalCase`.
- **Constants**: `UPPER_SNAKE_CASE`.

## Dart (Flutter)

- **Files**: `snake_case.dart`.
- **Classes**: `PascalCase`.
- **Variables/Methods**: `camelCase`.
- **Constants**: `lowerCamelCase` (Standard Dart convention).

## Import Ordering

1. Built-in/Standard libraries
2. External/Third-party packages
3. Local project modules (use absolute imports for Python: `from shared.core...`)

## Implementation Steps

1. Before committing, MUST run the platform-specific formatter (`pnpm lint:fix` for Web, `black` for Python, `flutter format` for App).
2. MUST NOT use magic numbers; define them as constants in a dedicated `constants/` or `utils/` file.
