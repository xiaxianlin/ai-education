# Database Migration

Owner: Agent 2

## Scope

Provide Go database access while preserving existing MySQL tables.

## Current Tables

- `ah_manager`
- `ah_student`
- `ah_student_textbook_config`
- `ah_ability`
- `ah_textbook`
- `ah_textbook_version`
- `ah_unit`
- `ah_teacher_book`
- `ah_question_type`
- `ah_question`
- `ah_practice`
- `ah_practice_answer`
- `ah_practice_report`
- `ah_student_ability_mastery`

## Rules

- Do not change existing table structure during early migration.
- Prefer explicit SQL over ORM-style hidden behavior.
- Any destructive migration requires architecture review.

## Go Package Shape

- `connection.go` opens and closes a `database/sql` connection using
  `config.Config.DatabaseURL`.
- `queries.go` stores the initial token lookup SQL for `ah_manager` and
  `ah_student`.
- `types.go` defines the small records auth middleware needs after token lookup.
- `auth_repository.go` exposes `ManagerTokenLookup`, `StudentTokenLookup`, and
  `TokenLookupStore` so auth packages can depend on interfaces instead of a
  concrete `*sql.DB`.

The package intentionally does not import a concrete MySQL driver yet. The
integration owner should add a blank driver import in the API command when the
chosen driver is available, for example:

```go
import _ "github.com/go-sql-driver/mysql"
```

Until that dependency is added, unit tests can compile the package without
network access. Runtime DB startup should be wired only in an integration pass.

## Configuration

`config.Load` now reads:

```text
DATABASE_URL=<mysql dsn>
```

The current connection helper defaults to driver name `mysql` and expects a DSN
accepted by the eventual MySQL driver. Existing `SERVER_ADDR` and `RUN_ENV`
behavior is unchanged.

## Auth Integration Points

Admin middleware can accept a `db.ManagerTokenLookup` and call:

```go
manager, err := lookup.FindManagerByToken(ctx, token)
```

Student middleware can accept a `db.StudentTokenLookup` and call:

```go
student, err := lookup.FindStudentByToken(ctx, token)
```

Both queries are read-only, preserve existing `ah_*` tables, and return
`db.ErrNotFound` when a token is absent.

Draft login/update SQL lives in:

- `apps/server-go/sql/auth.sql`
- `apps/server-go/sql/student.sql`
