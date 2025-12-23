---
description: "Naming conventions and code organization across all projects and languages"
globs: 
alwaysApply: true
---

# Naming & Style Conventions

## General Principles

- **Clarity**: Prioritize descriptive names (e.g., `student_practice_record` over `s_prac`).
- **Domain Focus**: Use K12 education domain terms (e.g., `subject`, `grade`, `knowledge_point`).

## Python (Backend)

- **Files**: `snake_case.py` (e.g., `practice_service.py`).
- **Classes**: `PascalCase` (e.g., `TextbookSchema`).
- **Methods/Funcs**: `snake_case` (e.g., `get_student_practices`).
- **AI Nodes**: LangGraph nodes SHOULD use `snake_case_node` suffix.

## TypeScript/React (Frontend)

- **Components**: `PascalCase.tsx` (e.g., `PracticeCard.tsx`).
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useTableColumns.ts`).
- **Variables**: `camelCase`.
- **Constants**: `UPPER_SNAKE_CASE`.

## Imports

- **Backend**: Use absolute imports from root (e.g., `from shared.database import ...`).
- **Frontend**: Use path aliases (`@/...`) or relative imports for local parts.

## Formatting

1. **Python**: Use `ruff` for linting and formatting.
2. **Web**: Use `prettier` and `eslint`.
3. **Flutter**: Use `flutter format`.
