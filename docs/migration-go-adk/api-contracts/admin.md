# Admin API Contract

Base path: `/api/admin`

All protected routes require:

```text
x-access-token: <manager token>
```

## Auth

| Method | Path | Status | Owner |
| --- | --- | --- | --- |
| GET | `/check` | Pending Go migration | Agent 4 |
| GET | `/configs` | Pending Go migration | Agent 4 |
| POST | `/login` | Pending Go migration | Agent 4 |
| POST | `/password` | Pending Go migration | Agent 4 |
| POST | `/manager` | Pending Go migration | Agent 4 |
| POST | `/manager/{id}/reset_password` | Pending Go migration | Agent 4 |
| PATCH | `/manager/{id}/type` | Pending Go migration | Agent 4 |
| DELETE | `/manager/{id}` | Pending Go migration | Agent 4 |
| GET | `/manager` | Pending Go migration | Agent 4 |

## Ability

| Method | Path | Status | Owner |
| --- | --- | --- | --- |
| GET | `/ability` | Pending Go migration | Agent 6 |
| POST | `/ability` | Pending Go migration | Agent 6 |
| PATCH | `/ability/{id}` | Pending Go migration | Agent 6 |
| DELETE | `/ability/{id}` | Pending Go migration | Agent 6 |
| POST | `/ability/batch_delete` | Pending Go migration | Agent 6 |
| GET | `/ability/search` | Pending Go migration | Agent 6 |
| GET | `/ability/{id}` | Pending Go migration | Agent 6 |
| POST | `/ability/export` | Pending Go migration | Agent 6 |
| POST | `/ability/import` | Pending Go migration | Agent 6 |

## Textbook and Teacher Book

| Method | Path Prefix | Status | Owner |
| --- | --- | --- | --- |
| mixed | `/textbook/*` | Pending Go migration | Agent 7 |
| mixed | `/textbook_version/*` | Pending Go migration | Agent 7 |
| mixed | `/teacher_book/*` | Pending Go migration | Agent 7 |

File upload and parsing can remain routed to Frozen legacy during the first cutover.

## Question

| Method | Path Prefix | Status | Owner |
| --- | --- | --- | --- |
| mixed | `/question/type*` | Pending Go migration | Agent 8 |
| mixed | `/question/search` | Pending Go migration | Agent 8 |
| mixed | `/question/{id}` | Pending Go migration | Agent 8 |
| POST | `/question/generate/{code}` | Pending ADK migration | Agent 13 |

## Student Admin

| Method | Path Prefix | Status | Owner |
| --- | --- | --- | --- |
| mixed | `/student/*` | Go handler/service/repository added for CRUD, search, textbook config, unused_textbooks, mastery list/summary; router cutover pending integration slot | Agent 5 + Agent 11 |

Implemented in `apps/server-go/internal/student` without changing `cmd/api/router`:

- `GET /student/search`
- `POST /student`
- `PUT /student/{id}`
- `DELETE /student/{id}`
- `POST /student/{id}/reset_password`
- `GET /student/{id}`
- `GET /student/{id}/unused_textbooks`
- `POST /student/{id}/textbook-config`
- `PUT /student/{id}/textbook-config/{config_id}`
- `DELETE /student/{id}/textbook-config/{config_id}`
- `GET /student/{id}/textbook-configs`
- `POST /student/{id}/textbook-configs`
- `GET /student/{id}/mastery`
- `GET /student/{id}/mastery/summary`

## Practice Admin

| Method | Path Prefix | Status | Owner |
| --- | --- | --- | --- |
| mixed | `/practice/*` | Pending Go migration | Agent 11 |
