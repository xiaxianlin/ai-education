# Python to Go + Google ADK Migration

This directory is the migration control room. It defines the work split, module ownership, compatibility rules, and acceptance criteria for moving the current Python FastAPI service in `apps/server` to a Go service in `apps/server-go`.

## Migration Strategy

Use the Go service as the default development backend during migration:

- Start `apps/server-go` for normal development.
- Keep `apps/server` as legacy reference code only.
- Move feature coverage route by route inside the Go service after each module passes compatibility checks.

The frontend contract should remain stable unless a contract gap is explicitly listed in `api-contracts/known-gaps.md`.

## Non-Negotiable Compatibility Rules

- Response envelope stays `{ "status": 0, "message": "success", "data": T }`.
- Business and auth errors still return HTTP 200 with non-zero `status`, matching the Python behavior.
- Auth continues to use the `x-access-token` request header.
- Existing `ah_*` MySQL tables remain compatible during migration.
- Practice status checks must inspect `generate_status` before `status`.
- GET query parameters remain flat objects from web clients, never nested under `params` in shared-web callers.

## Service Target

```text
apps/server-go/
├── cmd/
│   ├── api/
│   └── worker/
├── internal/
│   ├── auth/
│   ├── ability/
│   ├── textbook/
│   ├── question/
│   ├── practice/
│   ├── mastery/
│   ├── ai/
│   ├── db/
│   ├── queue/
│   ├── config/
│   ├── middleware/
│   ├── response/
│   └── router/
├── sql/
├── migrations/
└── tests/
```

## Execution Waves

1. **Foundation**: Go API skeleton, config, response envelope, auth middleware shape, DB and queue boundaries.
2. **Low-risk CRUD**: auth/profile, ability, textbook, question CRUD, mastery/statistics.
3. **Practice Core**: create/get/begin/answer/complete/progress plus admin practice tools.
4. **Google ADK AI**: question generation, answer evaluation, practice report generation, resource tools.
5. **Gateway Cutover**: route-level switching with rollback.

## Module Ownership

Each module agent owns only its module directory, SQL file, tests, and module migration note. Shared router registration is owned by the integration agent.

Example:

```text
Agent Ability owns:
  apps/server-go/internal/ability/
  apps/server-go/sql/ability.sql
  apps/server-go/tests/ability/
```

## Acceptance Gate

A module can be routed to Go only when:

- Endpoint list matches the contract.
- Request and response fields match existing frontend usage.
- DB writes are compatible with the existing Python service.
- Unit or integration tests cover the migrated service behavior.
- Manual frontend smoke test passes for the primary page.
- Rollback route is documented.
