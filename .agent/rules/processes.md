---
description: "Workflow processes for new features, testing, and monorepo management"
globs: 
alwaysApply: true
---

# Workflow Processes

## New Feature Implementation

1. **Planning**: Define scope and draft technical proposal in `implementation_plan.md`.
2. **Setup**: Create branch. Check if new logic can be shared in `packages/`.
3. **Architecture**: Design data models (SQLAlchemy), Schemas (Pydantic), and UI (Figma/Draft).
4. **Implementation**: Build backend -> Generate types -> Build frontend.

## Monorepo Operations

- **Development**: Use `pnpm dev` at root (Turborepo) or specific commands like `pnpm dev:admin`.
- **Building**: Use `turbo run build` for optimized builds across apps.
- **Type Sync**: 
    - Change backend `schema.py`.
    - Run `pnpm generate:types` (if available) or manually update `types.d.ts` in apps.

## Testing & Bug Fixing

1. **Run Tests**: Execute relevant suite (e.g., `pytest apps/server`).
2. **Verification**: MUST follow the `walkthrough.md` cycle to demonstrate changes with proof (recordings/screenshots).

## Operational Instructions

- MUST NOT commit large binary files.
- MUST update relevant documentation in `docs/` or feature-specific READMEs.
