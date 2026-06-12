# AI Education Server

This is the Go backend for the ai-education monorepo.

Current status:

- Admin and student routes are served from this application.
- Response envelope is `{ status, message, data }`.
- Business modules live under `internal/{module}`.
- AI capabilities are exposed through `internal/ai`.
- Monorepo server scripts start this service by default.

## Run

```bash
go run ./cmd/api
```

Environment:

```text
SERVER_ADDR=:7891
```

The service starts on `7891` by default.

Copy `.env.sample` to `.env` for local runs.

See `docs/migration-go-adk/environment.md` for the full variable map.

## Test

```bash
go test ./...
```

## Ownership

See `docs/migration-go-adk/agent-workstreams.md`.
