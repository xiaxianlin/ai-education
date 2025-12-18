---
description: "Workflow processes for new features, testing, and code reviews"
globs: 
alwaysApply: true
---

# Workflow Processes

## New Feature Implementation

1. **Planning**: Define scope, user stories, and acceptance criteria. Draft technical proposal in `implementation_plan.md`.
2. **Setup**: Create feature branch and configure any new dependencies.
3. **Architecture**: Design data models, API endpoints, and UI flow BEFORE implementation.

## Testing & Bug Fixing

1. **Run Tests**: Execute the relevant test suite for the platform changed.
2. **Analyze**: Categorize failures (regression, broken logic, flake).
3. **Fix**: Address critical failures first. Re-run tests after EACH fix to ensure no regressions.

## Code Review Checklist

- **Functionality**: Does it work as expected? Are edge cases handled?
- **Quality**: Is it readable? Are functions focused? Is there no duplication?
- **Security**: Are auth filters applied? Is input validated? No hardcoded keys?
- **Consistency**: Does it follow the naming and architecture rules defined in this project?

## Operational Instructions

- MUST follow the `implementation_plan.md` -> `walkthrough.md` cycle for any non-trivial changes.
- MUST include relevant documentation updates for new features.
