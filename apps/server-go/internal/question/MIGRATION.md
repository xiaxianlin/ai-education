# Question Migration

Owner: Agent 8

## Scope

Migrate question and question type CRUD. AI question generation is owned by the Google ADK agents.

## Python Sources

- `apps/server/admin/question/route.py`
- `apps/server/admin/question/services/question.py`
- `apps/server/admin/question/services/question_type.py`
- `apps/server/shared/core/database/question.py`
- `apps/server/shared/core/schema/question.py`

## First Cut

Migrate:

- question search/get/update/delete
- question type save/delete/search/detail
- prompt read/write
- configs update

Leave as AI-owned:

- `POST /api/admin/question/generate/{code}`

