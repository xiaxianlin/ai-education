# Dispatch Board

This board is the execution entry point for migration agents.

## Current Migration Phase

Phase: Go runtime cutover in progress, Python service no longer on the default dev path

Primary objective:

- Keep Go API and frontend services as the default runtime.
- Continue migrating remaining Python-only admin/file/RAG flows behind Go interfaces.
- Keep Python available only as explicitly named legacy commands.

## Completed in Subagent Wave 1

| Ticket | Module | Status |
| --- | --- | --- |
| F-001 | Database Foundation | Complete |
| F-002 | Queue Foundation | Complete |
| F-003 | Auth Foundation | Complete skeleton, pending real store/hash/token implementation |
| R-000 | DSN Normalization | Complete |
| R-001 | Auth DB/token compatibility | Complete boundary, bcrypt dependency pending |
| R-002 | Ability DB Repository | Complete, student atomics is first cutover candidate |
| R-003 | Practice DB Repository and Worker Placeholder | Complete partial SQL repository and placeholder worker |
| R-005 | MySQL driver + bcrypt + API route wiring | Complete |
| M-002 | Student Profile SQL module | Complete and mounted when DB is available |
| AI-002 | ADK adapter preparation | Complete without SDK dependency |
| M-001 | Ability Module | Complete skeleton, pending DB repository |
| M-003 | Practice Contract Fix | Complete in-memory skeleton and state machine |
| M-004 | Textbook Module | Complete skeleton, upload/parse remain Python |
| M-005 | Question CRUD | Complete skeleton, AI generation endpoint remains ADK-owned |
| M-006 | Mastery and Statistics | Complete skeleton, pending DB repository |
| AI-001 | AI Interface Foundation | Complete no-op/stub provider interfaces |
| ENV-001 | Environment variable migration | Complete config fields and sample template |
| R-004 | Google ADK Adapter | Complete initial SDK-backed adapter |
| R-006 | Textbook SQL Repository | Complete and mounted when DB is available |
| R-007 | Mastery SQL Repository | Complete and mounted when DB is available |
| R-008 | Practice Generation Persistence | Complete initial ADK generation to `ah_question`/`ah_practice_answer` |

Verification:

```bash
cd apps/server-go
GOCACHE=/private/tmp/ai-education-go-build-cache go test ./...
```

This passed after Wave 1 integration.

## Ready to Assign Next

### Ticket R-001: Real Auth Repository and Token Compatibility

Agent: DB/Auth integration

Status: Complete boundary, blocked from login cutover until bcrypt dependency is added

Start here:

- `apps/server-go/internal/db/`
- `apps/server-go/internal/auth/`
- `apps/server/shared/util/encrypt.py`
- `apps/server/admin/auth/services/auth.py`
- `apps/server/student/auth/services/auth.py`

Tasks:

- Implement `auth.ManagerStore` and `auth.StudentStore` using the DB foundation.
- Implement password compatibility with existing Python hashes.
- Implement token resolver compatible with existing stored tokens.
- Replace placeholder check routes only after compatibility tests pass.

Done when:

- Admin and student login/check work against existing database rows.
- Missing, invalid, disabled, and valid token cases are tested.

Notes:

- SQL-backed manager/student store adapters are implemented.
- HS256 JWT resolver matches the Python `{id, update_time, exp}` payload shape.
- Bcrypt password verification still needs `golang.org/x/crypto/bcrypt`; current Go boundary intentionally does not accept bcrypt hashes without that dependency.

### Ticket R-000: DSN Normalization

Agent: DB integration

Status: In progress in main thread
Final status: Complete

Start here:

- `apps/server-go/internal/config/config.go`
- `docs/migration-go-adk/environment.md`
- `apps/server-go/.env.sample`

Tasks:

- Decide whether Go deployments use native Go MySQL DSN or Python-compatible `mysql+asyncmy://...` URLs.
- If sharing Python `DATABASE_URL`, add a normalization helper before opening the SQL driver.

Done when:

- Local Go DB connection works from the documented `.env` format.
- The chosen DSN format is reflected in `.env.sample` and DB migration docs.

### Ticket R-002: Ability DB Repository

Agent: Ability + DB integration

Status: Complete

Start here:

- `apps/server-go/internal/ability/`
- `apps/server-go/sql/ability.sql`
- `apps/server/shared/core/database/ability.py`

Tasks:

- Implement SQL-backed `ability.Repository`.
- Preserve `subject + grade + code` uniqueness behavior.
- Wire only `GET /api/student/ability/atomics` for first route cutover.

Done when:

- Student ability atomics can be served from Go with existing DB data.
- Admin CRUD remains behind Python until mutation compatibility is reviewed.

First cutover candidate:

- `GET /api/student/ability/atomics`

### Ticket R-003: Practice DB Repository and Worker Handler

Agent: Practice + Queue integration

Status: Complete initial SQL repository and in-process generation dispatch

Start here:

- `apps/server-go/internal/practice/`
- `apps/server-go/internal/queue/`
- `apps/server-go/sql/practice.sql`

Tasks:

- SQL-backed `practice.Repository` covers sessions, answers, reports, generated question persistence.
- `practice.generate` is registered in the Go API via in-process dispatch until an external queue backend is added.
- Keep `generate_status` transition rules identical to the contract.

Done when:

- `POST /practice/create` persists a session and dispatches a generation task.
- `GET /practice/progress/{session_id}` reflects DB state.
- Generated questions are written to `ah_question`; answer placeholders are written to `ah_practice_answer`; practice updates `generate_status=1`.

Notes:

- Placeholder behavior remains available for worker-only tests.
- API runtime now uses the real handler with ADK provider when AI config is present.

### Ticket R-004: Google ADK Adapter

Agent: AI integration

Status: Complete initial SDK-backed adapter, tool integrations still pending

Start here:

- `apps/server-go/internal/ai/`
- `docs/migration-go-adk/adk-ai-architecture.md`

Tasks:

- Added `google.golang.org/adk` SDK dependency.
- Added ADK `llmagent` + `runner` adapter behind `internal/ai.Adapter`.
- Added `ADKProvider` for question generation and report generation.
- Objective answer evaluation remains local.
- Schema validation runs before generated questions are persisted.

Done when:

- Question generation returns validated `[]GeneratedQuestion`.
- Objective answer evaluation still stays local.

## Historical Wave 1 Tickets

### Ticket F-001: Database Foundation

Agent: Agent 2

Status: Complete

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

Status: Complete

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

Status: Skeleton complete, real middleware integration pending R-001

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

Status: Skeleton complete, DB repository pending R-002

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

Status: Complete and mounted when DB is available

Start here:

- `docs/migration-go-adk/api-contracts/student.md`

Done when:

- Student login/check/profile/settings work through Go.
- Student web can load `/home` after route cutover.

Notes:

- SQL repository, service, handlers, and route registration are implemented.
- `cmd/api` wires profile routes when DB opens successfully.
- Current student ID is resolved through the Go auth service.

### Ticket M-003: Practice Contract Fix

Agent: Agent 10

Status: In-memory skeleton complete, DB repository pending R-003

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
