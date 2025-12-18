---
description: "Testing, error handling, and code review standards"
globs: 
alwaysApply: true
---

# Reliability & Quality Assurance

## Error Handling

- **Client-Side**: ALL API calls MUST have `.catch()` or `try-catch` blocks and notify users of errors (e.g., via AntD `message` or shadcn `toast`).
- **Server-Side**: Business logic MUST raise `ValueError` for handled cases; unhandled exceptions MUST be logged via `loguru` with full context.
- **Mobile**: Use `AsyncValue` (Riverpod) for state management to handle loading/error states gracefully.

## Code Review Focus

- **Security Check**: Verify that `Authorize` headers and authentication filters are correctly applied to new routes.
- **Performance**: Review SQL queries for N+1 issues. Checks for redundant re-renders in React components.
- **Readability**: Ensure naming follows the `style.md` convention and complex logic is commented.

## Operational Instructions

1. After modifying core business logic, MUST manually verify the feature in the dev environment.
2. When fixing a bug, MUST describe the root cause and the fix in the PR or commit message.
3. Before submitting code for review, ensure all linting and type checks pass locally.
