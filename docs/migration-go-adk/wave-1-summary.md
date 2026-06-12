# Wave 1 Summary

Wave 1 used subagents to build independent Go migration slices without changing the Frozen legacy service.

## Completed Modules

- Database foundation: config, `database/sql` connection boundary, auth lookup query drafts.
- Queue foundation: task names, payloads, enqueuer interface, memory/no-op implementations, worker command.
- Auth foundation: admin/student login/check handler skeleton, service interfaces, error mapping.
- Ability module: service validation, admin/student handlers, route registration functions, SQL draft, tests.
- Textbook module: type/repository/handler skeleton, student units route, admin CRUD placeholders, SQL draft, tests.
- Question CRUD: types, service, prompt store, CRUD handlers, AI generation interface boundary, SQL draft, tests.
- Mastery/statistics: service/repository/handlers, statistics contracts, SQL draft, tests.
- Practice core: state machine, in-memory repository, create/progress/answer/complete handlers, queue and evaluator interfaces, SQL draft, tests.
- AI foundation: typed provider interfaces, tool interfaces, no-op/stub provider.

## Verification

The Go service compiles and all Go tests pass:

```bash
cd apps/server-go
GOCACHE=/private/tmp/ai-education-go-build-cache go test ./...
```

## Integration Decision

The module route registration functions are intentionally not mounted into the main `router.go` yet, except for the original health/check placeholders. Most modules currently rely on interfaces, in-memory repositories, or not-implemented repositories. Route cutover should wait for SQL-backed repositories and compatibility tests.

## Next Critical Path

1. Auth repository and token/password compatibility.
2. Ability SQL repository and first student route cutover.
3. Practice SQL repository and queue worker implementation.
4. Google ADK adapter behind `internal/ai` interfaces.
5. Student profile module, then frontend smoke tests.

