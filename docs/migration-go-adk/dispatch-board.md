# Dispatch Board

This board is the execution entry point for migration agents.

## Current Migration Phase

Phase: Foundation

Primary objective:

- Keep Python service stable.
- Build a compiling Go service skeleton.
- Freeze contracts before moving traffic.

## Ready to Assign Now

### Ticket F-001: Database Foundation

Agent: Agent 2

Start here:

- `apps/server-go/internal/db/MIGRATION.md`
- `docs/migration-go-adk/api-contracts/student.md`
- `docs/migration-go-adk/api-contracts/admin.md`

Tasks:

- Add DB config fields without breaking `config.Load`.
- Add MySQL connection package.
- Add token lookup query design for manager and student.
- Document selected SQL generation approach.

Done when:

- `go test ./...` passes.
- DB package has an interface that auth modules can consume.
- No existing table schema is changed.

### Ticket F-002: Queue Foundation

Agent: Agent 3

Start here:

- `apps/server-go/internal/queue/MIGRATION.md`
- `docs/migration-go-adk/api-contracts/practice.md`

Tasks:

- Define task payload structs.
- Add enqueue interface.
- Add worker command skeleton under `cmd/worker`.
- Keep concrete Redis client isolated behind the queue interface.

Done when:

- `go test ./...` passes.
- Practice module can compile against a queue interface without importing worker internals.

### Ticket F-003: Auth Middleware Integration

Agent: Agent 1 + Agent 4/5

Start here:

- `apps/server-go/internal/middleware/auth.go`
- `docs/migration-go-adk/api-contracts/admin.md`
- `docs/migration-go-adk/api-contracts/student.md`

Tasks:

- Replace token-presence placeholder with role-specific token resolvers once DB foundation lands.
- Add request context values for current manager/student.
- Preserve non-zero envelope errors.

Done when:

- Missing token returns `status=401`.
- Invalid token returns `status=401`.
- Valid token reaches protected handler.

## Next After Foundation

### Ticket M-001: Ability Module

Agent: Agent 6

Start here:

- `apps/server-go/internal/ability/MIGRATION.md`
- `docs/migration-go-adk/api-contracts/student.md`
- `docs/migration-go-adk/api-contracts/admin.md`

Why first:

- Small domain.
- Low AI coupling.
- Student homepage/practice selection depends on it.

Done when:

- `GET /api/student/ability/atomics` matches current frontend usage.
- Admin CRUD matches Python behavior.

### Ticket M-002: Student Profile

Agent: Agent 5

Start here:

- `docs/migration-go-adk/api-contracts/student.md`

Done when:

- Student login/check/profile/settings work through Go.
- Student web can load `/home` after route cutover.

### Ticket M-003: Practice Contract Fix

Agent: Agent 10

Start here:

- `apps/server-go/internal/practice/MIGRATION.md`
- `docs/migration-go-adk/api-contracts/practice.md`
- `docs/migration-go-adk/api-contracts/known-gaps.md`

Done when:

- `POST /practice/create` creates a session row and returns `session_id`.
- `GET /practice/progress/{session_id}` exists.
- Existing web practice card can create and poll a session.

## Integration Owner Rules

Only the integration owner should make broad route registration changes in:

- `apps/server-go/internal/router/router.go`

Module agents may add local route registration functions in their own package, then ask the integration owner to wire them in.

Preferred module shape:

```text
internal/ability/
  handler.go
  service.go
  repository.go
  routes.go
  types.go
```

`routes.go` should expose:

```go
func RegisterStudentRoutes(mux *http.ServeMux, deps Dependencies)
func RegisterAdminRoutes(mux *http.ServeMux, deps Dependencies)
```

## Verification Command

Run from `apps/server-go`:

```bash
go test ./...
```

