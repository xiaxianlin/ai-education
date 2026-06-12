# Auth API Contract

Owner: Agent 4/5

This document records the Go auth module boundary while admin and student
routes are still integrated route by route.

## Shared Rules

- Request token header remains `x-access-token`.
- Auth failures return HTTP 200 with envelope `status: 401`.
- Admin and student token resolution use separate injected resolvers.
- Login responses keep the current frontend contract: envelope `data` is the
  token string.

## Go Package

Package path:

```text
ai-education/server-go/internal/auth
```

Dependency interfaces:

- `ManagerStore`
- `StudentStore`
- `PasswordHasher`
- `TokenResolver[ManagerTokenClaims]`
- `TokenResolver[StudentTokenClaims]`

Route registration:

```go
auth.RegisterAdminRoutes(mux, handler)
auth.RegisterStudentRoutes(mux, handler)
```

The integration owner should call these registration functions from the shared
router after replacing the temporary auth placeholders.

## Admin Routes

Base path: `/api/admin`

| Method | Path | Response data |
| --- | --- | --- |
| POST | `/login` | `string` token |
| GET | `/check` | `Manager` |
| GET | `/configs` | subjects, semesters, providers |

## Student Routes

Base path: `/api/student`

| Method | Path | Response data |
| --- | --- | --- |
| POST | `/login` | `string` token |
| GET | `/check` | `string` student ID |

