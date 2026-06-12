# Wave 2 Summary

Wave 2 moved the Go backend from pure module skeletons toward real database compatibility.

## Completed

- DSN normalization accepts Frozen legacy-style MySQL URLs such as `mysql+asyncmy://...` and native Go MySQL DSNs.
- Auth SQL store boundary now covers manager/student lookup by username/phone/token and token persistence.
- Auth JWT resolver supports HS256 payloads compatible with Frozen legacy `{id, update_time, exp}` tokens.
- Ability SQL repository implements the module repository interface with `database/sql`.
- Practice SQL repository covers core session create/read/list/update behavior and basic answer/report access.
- `practice.generate` worker placeholder is registered with explicit strategies for keeping generating or marking failed.

## Verification

```bash
cd apps/server-go
GOCACHE=/private/tmp/ai-education-go-build-cache go test ./...
```

The command passed after Wave 2 changes.

## Cutover Status

Ready soon:

- `GET /api/student/ability/atomics` is the safest first route cutover candidate once the Go MySQL driver is installed and the router is wired.

Not ready:

- Login/check cannot be cut over until bcrypt verification is implemented with a Go bcrypt dependency.
- Practice create/progress can persist session state, but true question generation and generated answer rows are not implemented yet.

## Next Critical Path

1. Add the MySQL driver dependency and wire DB open into `cmd/api`.
2. Add Go bcrypt dependency and enable Frozen legacy password hash verification.
3. Mount only the student ability route behind SQL repository.
4. Implement Student Profile with SQL repository.
5. Implement practice generation persistence after Google ADK question generation lands.

