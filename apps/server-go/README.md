# AI Education Go Server

This is the migration target for `apps/server`.

Current status:

- Standard-library API skeleton is in place.
- Response envelope is compatible with the Python service.
- Route placeholders exist for `/api/admin` and `/api/student`.
- Business modules should be migrated independently under `internal/{module}`.

## Run

```bash
go run ./cmd/api
```

Environment:

```text
SERVER_ADDR=:7891
```

The Python service continues to use port `7890`; the Go service starts on `7891` by default during migration.

Copy `.env.sample` to `.env` for local Go-only runs. The variable names intentionally match the Python service so deployment can share the same environment while routes are migrated.

See `docs/migration-go-adk/environment.md` for the full variable map.

## Test

```bash
go test ./...
```

## Ownership

See `docs/migration-go-adk/agent-workstreams.md`.
