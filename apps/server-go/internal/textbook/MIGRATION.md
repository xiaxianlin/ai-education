# Textbook Migration

Owner: Agent 7

## Scope

Migrate textbook, unit, textbook version, and teacher book CRUD where no long-running parsing or upload behavior is required.

## Python Sources

- `apps/server/admin/textbook/route.py`
- `apps/server/admin/textbook/services/textbook.py`
- `apps/server/admin/textbook/services/unit.py`
- `apps/server/admin/textbook_version/route.py`
- `apps/server/admin/teacher_book/route.py`
- `apps/server/student/textbook/route.py`
- `apps/server/shared/core/database/textbook.py`

## First Cut

Migrate:

- `GET /api/student/textbook/{textbook_id}/units`
- textbook version CRUD
- admin textbook search/detail/unit CRUD

Keep on Python initially:

- file upload
- textbook parsing
- teacher book upload

## Current Go Coverage

- SQL repository covers textbook, unit, textbook version, and teacher book database CRUD.
- Handler/routes tests cover student unit lookup and upload placeholders.
- Repository tests cover textbook/unit persistence, duplicate textbook checks, version in-use deletion guard, and teacher book search.
