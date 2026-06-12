# Wave 3 Summary

Wave 3 moved the Go backend closer to default runtime readiness.

## Completed

- Added Go MySQL driver dependency.
- Added Go bcrypt dependency and enabled Frozen legacy bcrypt password verification.
- `cmd/api` now attempts DB startup and mounts real routes when DB is available.
- Go auth routes are wired when DB opens successfully.
- Student ability atomics route is wired through SQL repository when DB opens successfully.
- Student profile GET/PUT module is implemented and wired when DB opens successfully.
- AI preparation layer now includes prompt loading, prompt rendering, JSON decoding, schema validation, deterministic objective answer evaluation, and an ADK adapter boundary.

## Still Safe Without DB

If `DATABASE_URL` is missing or DB startup fails, Go API still starts with health/check placeholders. This keeps local frontend development from failing hard while DB wiring is being configured.

## Verification

```bash
cd apps/server-go
GOCACHE=/private/tmp/ai-education-go-build-cache go test ./...
GOCACHE=/private/tmp/ai-education-go-build-cache go build ./cmd/api ./cmd/worker
```

Both commands passed after Wave 3 changes.

## Next Critical Path

1. Run Go API against a real local MySQL database and smoke-test admin/student login.
2. Mount more student routes after DB repositories are ready: textbook units, mastery summary/statistics, practice records/progress.
3. Implement Google ADK provider behind `internal/ai.Adapter`.
4. Implement generated question persistence for `practice.generate`.
5. Add frontend smoke tests through admin and student dev servers.

