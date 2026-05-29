# Practice Migration

Owner: Agent 10

## Scope

Migrate student practice state machine and session data APIs.

## Python Sources

- `apps/server/student/practice/route.py`
- `apps/server/student/practice/schema.py`
- `apps/server/shared/practice/practice.py`
- `apps/server/shared/practice/answer.py`
- `apps/server/shared/practice/report.py`
- `apps/server/shared/core/database/practice.py`

## Endpoints

- `GET /api/student/practice/`
- `POST /api/student/practice/create`
- `GET /api/student/practice/records`
- `GET /api/student/practice/{session_id}`
- `POST /api/student/practice/{session_id}/begin`
- `POST /api/student/practice/{session_id}/complete`
- `POST /api/student/practice/answer`
- `GET /api/student/practice/progress/{session_id}`

## State Rule

Always check `generate_status` before `status`.

## Known Gaps

- Python `create_practice` route currently does not create a session.
- Progress endpoint is referenced by frontend but not found in Python routes.
- Answer evaluation needs a full implementation during migration.

