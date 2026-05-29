# Agent Workstreams

Use this file to assign independent agents. Agents should avoid editing shared files unless their workstream says they own them.

## Agent 0: Contract Auditor

Owns:

- `docs/migration-go-adk/api-contracts/`

Tasks:

- Freeze current Python API contracts.
- Record known frontend/backend mismatches.
- Keep route migration status current.

Deliverables:

- `api-contracts/admin.md`
- `api-contracts/student.md`
- `api-contracts/practice.md`
- `api-contracts/known-gaps.md`

## Agent 1: Go Foundation

Owns:

- `apps/server-go/cmd/api/`
- `apps/server-go/internal/config/`
- `apps/server-go/internal/response/`
- `apps/server-go/internal/middleware/`
- `apps/server-go/internal/router/`

Tasks:

- Keep the Go API service compiling.
- Implement response envelope helpers.
- Register shared health and placeholder routes.
- Add CORS, gzip, panic recovery, request logging, and auth middleware.

Acceptance:

- `go test ./...` passes from `apps/server-go`.
- `GET /health` returns status `0`.
- Unauthenticated protected placeholders return status `401`.

## Agent 2: Database Foundation

Owns:

- `apps/server-go/internal/db/`
- `apps/server-go/sql/`
- `apps/server-go/migrations/`

Tasks:

- Add MySQL connection pool.
- Introduce SQL generation strategy.
- Preserve current `ah_*` schema compatibility.
- Add queries for token lookup and core entity fetches.

Acceptance:

- DB package can connect using `DATABASE_URL`.
- Manager/student lookup by token is implemented.
- No migration mutates existing tables without explicit review.

## Agent 3: Queue Foundation

Owns:

- `apps/server-go/cmd/worker/`
- `apps/server-go/internal/queue/`

Tasks:

- Add Redis-backed worker boundary.
- Define task names and payload schemas.
- Provide enqueue and handler registration APIs.

Task names:

- `practice.generate`
- `question.generate`
- `answer.evaluate`
- `report.generate`

## Agent 4: Admin Auth

Owns:

- `apps/server-go/internal/auth/`
- `apps/server-go/sql/auth.sql`
- `apps/server-go/tests/auth/`

Endpoints:

- `POST /api/admin/login`
- `GET /api/admin/check`
- `GET /api/admin/configs`
- `POST /api/admin/password`
- manager CRUD endpoints

## Agent 5: Student Auth/Profile

Owns:

- `apps/server-go/internal/auth/`
- `apps/server-go/internal/student/`
- `apps/server-go/sql/student.sql`
- `apps/server-go/tests/student/`

Endpoints:

- `POST /api/student/login`
- `GET /api/student/check`
- `GET /api/student/profile`
- `PUT /api/student/profile`

## Agent 6: Ability

Owns:

- `apps/server-go/internal/ability/`
- `apps/server-go/sql/ability.sql`
- `apps/server-go/tests/ability/`

Endpoints:

- admin ability CRUD/import/export
- `GET /api/student/ability/atomics`

## Agent 7: Textbook

Owns:

- `apps/server-go/internal/textbook/`
- `apps/server-go/sql/textbook.sql`
- `apps/server-go/tests/textbook/`

Endpoints:

- admin textbook CRUD
- textbook version CRUD
- teacher book CRUD
- `GET /api/student/textbook/{textbook_id}/units`

File upload and parsing may remain on Python until explicitly migrated.

## Agent 8: Question CRUD

Owns:

- `apps/server-go/internal/question/`
- `apps/server-go/sql/question.sql`
- `apps/server-go/tests/question/`

Endpoints:

- question search/get/update/delete
- question type CRUD
- prompt get/update
- configs update

AI generation is owned by the AI agents.

## Agent 9: Mastery and Statistics

Owns:

- `apps/server-go/internal/mastery/`
- `apps/server-go/sql/mastery.sql`
- `apps/server-go/tests/mastery/`

Endpoints:

- `GET /api/student/mastery/list`
- `GET /api/student/mastery/weak`
- `GET /api/student/mastery/summary`
- `GET /api/student/practice/statistics`

## Agent 10: Practice Core

Owns:

- `apps/server-go/internal/practice/`
- `apps/server-go/sql/practice.sql`
- `apps/server-go/tests/practice/`

Endpoints:

- `GET /api/student/practice/`
- `POST /api/student/practice/create`
- `GET /api/student/practice/records`
- `GET /api/student/practice/{session_id}`
- `POST /api/student/practice/{session_id}/begin`
- `POST /api/student/practice/{session_id}/complete`
- `POST /api/student/practice/answer`
- `GET /api/student/practice/progress/{session_id}`

## Agent 11: Admin Practice

Owns:

- `apps/server-go/internal/practice/admin/`
- `apps/server-go/sql/admin_practice.sql`
- `apps/server-go/tests/admin_practice/`

Endpoints:

- admin practice search/detail/delete/reset
- answer reset

## Agent 12: Google ADK Foundation

Owns:

- `apps/server-go/internal/ai/`

Tasks:

- Add Google ADK integration boundary.
- Define Go interfaces for generation, evaluation, and reporting.
- Add schema validation, retry policy, and observability hooks.

## Agent 13: Question Generation Agent

Owns:

- `apps/server-go/internal/ai/agents/question_generator.go`
- `apps/server-go/internal/ai/prompts/`
- `apps/server-go/internal/ai/tools/resource_tools.go`

Tasks:

- Migrate `apps/server/shared/question/generate.py`.
- Preserve prompt behavior from `apps/server/prompt/*.md`.
- Return validated question JSON before database writes.

## Agent 14: Answer Evaluation Agent

Owns:

- `apps/server-go/internal/ai/agents/answer_evaluator.go`
- `apps/server-go/internal/practice/evaluator/`

Tasks:

- Implement local deterministic evaluators for objective questions.
- Use Google ADK only for subjective/open/audio evaluation.

## Agent 15: Report Agent

Owns:

- `apps/server-go/internal/ai/agents/report_generator.go`
- `apps/server-go/internal/practice/report/`

Tasks:

- Generate practice report drafts.
- Persist report rows in `ah_practice_report`.

## Agent 16: Frontend Contract Alignment

Owns:

- `apps/student-web/src/lib/api.ts`
- `apps/student-mobile/src/api/client.ts`
- `packages/shared-web/src/`

Tasks:

- Normalize practice answer path.
- Normalize practice create response.
- Keep shared-web GET parameter rule intact.

## Agent 17: Gateway Cutover

Owns:

- `infra/nginx/default.conf`
- `docs/migration-go-adk/cutover.md`

Tasks:

- Add route-level cutover and rollback plan.
- Track migrated route ownership.

