# Auth Migration

Owners: Agent 4 and Agent 5

## Scope

Migrate admin and student authentication while preserving token compatibility.

## Python Sources

- `apps/server/admin/auth/route.py`
- `apps/server/admin/auth/services/auth.py`
- `apps/server/admin/auth/services/manager.py`
- `apps/server/student/auth/route.py`
- `apps/server/student/auth/services/auth.py`
- `apps/server/shared/core/database/auth.py`
- `apps/server/shared/core/database/student.py`

## Rules

- Request header remains `x-access-token`.
- Admin and student token resolution must stay separate.
- Error envelope uses `status=401` with HTTP 200.
- Password hashing must remain compatible with existing database rows.

## Initial Endpoints

Admin:

- `POST /api/admin/login`
- `GET /api/admin/check`
- `GET /api/admin/configs`

Student:

- `POST /api/student/login`
- `GET /api/student/check`

