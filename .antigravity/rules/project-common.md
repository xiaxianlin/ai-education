# Project Common Rules

## Monorepo Management

- **Tooling**: pnpm workspaces + Turborepo.
- **Package Manager**: pnpm.
- **Environment**: Use `.env` files; never hardcode secrets.

## Naming Conventions

- **Files/Components**: `PascalCase` for React components and TS types.
- **Variables/Functions (TS)**: `camelCase`.
- **Variables/Functions (PY)**: `snake_case`.
- **Constants**: `UPPER_SNAKE_CASE`.
- **Routes**: `route.py` (file) with pluralized prefixes in the router.

## Code Quality

- **Linting**: Prettier + ESLint for TS; PEP 8 + Type Hints for Python.
- **Dry Principle**: Use `packages/shared-web` for cross-app utilities.
- **Documentation**: Use JSDoc/Docstrings for complex logic.
