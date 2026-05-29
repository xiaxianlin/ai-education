# Student API Contract

Base path: `/api/student`

All protected routes require:

```text
x-access-token: <student token>
```

All responses use:

```json
{
  "status": 0,
  "message": "success",
  "data": {}
}
```

## Auth and Profile

| Method | Path | Status | Owner |
| --- | --- | --- | --- |
| GET | `/check` | Pending Go migration | Agent 5 |
| POST | `/login` | Pending Go migration | Agent 5 |
| GET | `/profile` | Pending Go migration | Agent 5 |
| PUT | `/profile` | Pending Go migration | Agent 5 |

## Ability

| Method | Path | Status | Owner |
| --- | --- | --- | --- |
| GET | `/ability/atomics` | Pending Go migration | Agent 6 |

Query:

```text
subject: string
grade: number
```

## Textbook

| Method | Path | Status | Owner |
| --- | --- | --- | --- |
| GET | `/textbook/{textbook_id}/units` | Pending Go migration | Agent 7 |

## Mastery

| Method | Path | Status | Owner |
| --- | --- | --- | --- |
| GET | `/mastery/list` | Pending Go migration | Agent 9 |
| GET | `/mastery/weak` | Pending Go migration | Agent 9 |
| GET | `/mastery/summary` | Pending Go migration | Agent 9 |

## Practice

See `practice.md`.

