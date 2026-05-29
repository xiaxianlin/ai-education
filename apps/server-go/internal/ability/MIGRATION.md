# Ability Migration

Owner: Agent 6

## Scope

Migrate admin ability management and student ability atomics.

## Python Sources

- `apps/server/admin/ability/route.py`
- `apps/server/admin/ability/services/ability.py`
- `apps/server/admin/ability/schema.py`
- `apps/server/student/ability/route.py`
- `apps/server/shared/core/database/ability.py`

## Endpoints

- `GET /api/admin/ability`
- `POST /api/admin/ability`
- `PATCH /api/admin/ability/{id}`
- `DELETE /api/admin/ability/{id}`
- `POST /api/admin/ability/batch_delete`
- `GET /api/admin/ability/search`
- `GET /api/admin/ability/{id}`
- `POST /api/admin/ability/export`
- `POST /api/admin/ability/import`
- `GET /api/student/ability/atomics`

## Notes

Preserve uniqueness behavior for `subject + grade + code`.

