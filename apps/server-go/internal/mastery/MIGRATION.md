# Mastery Migration

Owner: Agent 9

## Scope

Migrate student mastery queries and practice statistics.

## Python Sources

- `apps/server/student/mastery/route.py`
- `apps/server/shared/practice/mastery.py`
- `apps/server/student/practice/services/statistics.py`
- `apps/server/shared/core/database/mastery.py`

## Endpoints

- `GET /api/student/mastery/list`
- `GET /api/student/mastery/weak`
- `GET /api/student/mastery/summary`
- `GET /api/student/practice/statistics`

## Rule

Statistics must match existing Python behavior before route cutover.

## Current Go Coverage

- SQL repository covers mastery list, weak mastery recommendation, summary aggregation, and practice statistics.
- Service/handler tests cover current-student injection, filters, weak defaults/limits, and statistics time windows.
- Repository tests cover ability join metadata, weak filtering, level distribution, and all-time/recent-compatible statistics aggregation.
