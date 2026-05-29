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

File upload and parsing can remain routed to Python during the first cutover.

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
| mixed | `/student/*` | Pending Go migration | Agent 5 + Agent 11 |

## Practice Admin

| Method | Path Prefix | Status | Owner |
| --- | --- | --- | --- |
| mixed | `/practice/*` | Pending Go migration | Agent 11 |

