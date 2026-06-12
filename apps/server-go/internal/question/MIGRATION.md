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

## Migrated

- question search/get/update/delete
- question type save/delete/search/detail
- prompt read/write through `FilePromptStore`
- configs update
- SQL repository for `ah_question` and `ah_question_type`
- service, handler, and SQL repository tests under `apps/server-go/tests/question`

Leave as AI-owned:

- `POST /api/admin/question/generate/{code}`

## Notes

- The Go question routes live in `internal/question/routes.go`; global router wiring is intentionally left to the cutover owner to avoid conflicts.
- `QuestionUpdate.Explanation` is applied to `answer.explanation`, matching the Go `QuestionAnswer` model.
