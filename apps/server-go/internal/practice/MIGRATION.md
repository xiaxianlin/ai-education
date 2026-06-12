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

## Generation Persistence

Python's active practice flow reads these tables after generation:

- `ah_practice`: owns the session and state counters. Generation starts with
  `generate_status = 0`; successful persistence sets `generate_status = 1`,
  updates `question_count`, optionally records `generate_time`, and leaves
  `status = 0` until the student begins.
- `ah_question`: stores each AI-generated question (`question_type_code`,
  `subject`, `grade`, `content`, `answer`, `difficulty`).
- `ah_practice_answer`: stores the ordered session-question link. New generated
  rows are created with `status = 0`, `time_spent = 0`, and no submitted answer.

Go now exposes `Service.PersistGeneratedPractice` and
`Repository.PersistGeneratedPractice` so a later AI adapter/worker can validate
`[]ai.GeneratedQuestion`, fill missing question IDs/subject/grade from the
session, write `ah_question` plus `ah_practice_answer`, and complete generation
without touching HTTP routing.

## Known Gaps

- Python `create_practice` route currently does not create a session.
- Progress endpoint is referenced by frontend but not found in Python routes.
- Answer evaluation needs a full implementation during migration.
- Practice generation prompt selection/input assembly is still owned by the
  future AI adapter worker; this cut only persists adapter output.
