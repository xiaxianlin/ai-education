---
description: "Testing, error handling, and code review standards"
globs: 
alwaysApply: true
---

# Reliability & Quality Assurance

## Error Handling

- **Web**: Catch API errors in `apiClient` interceptors or local `useRequest`. Notify via AntD `message.error` or shadcn `toast`.
- **Server**: Raise specific exceptions for business logic. Log complex errors using `loguru`.
- **Mobile**: Use Riverpod `AsyncValue` for error states.

## Testing

- **Backend**: Use `pytest` with async support for service and route testing.
- **Frontend**: Manual verification for UI; unit tests for complex utility logic.

## Code Review Focus

- **N+1 Queries**: Review SQLAlchemy relationships (`joinedload` vs `lazy`).
- **React**: Check for unnecessary re-renders in heavy components.
- **Security**: Validate `x-access-token` usage and input sanitization.

## Operational Instructions

1. Feature changes MUST be verified in local dev environment before submission.
2. MUST use `walkthrough.md` to document the verification process for non-trivial tasks.
