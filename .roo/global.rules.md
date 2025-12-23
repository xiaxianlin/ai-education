# Global Rules

Database schema changes MUST be made through migration scripts in apps/server/migrations/ directory.

Database model definitions in apps/server/shared/core/database.py MUST NOT be modified without creating a corresponding migration script.

Public API routes MUST NOT be removed or renamed without versioning.

Authentication middleware (admin_route_filter, student_router_filter) MUST NOT be bypassed or disabled.

Environment variables MUST be defined in .env.sample before use in code.

New external dependencies MUST be added to the appropriate package.json or pyproject.toml file.

Shared code in packages/shared-web/ MUST NOT import from apps/ directory.

Shared code in apps/server/shared/ MUST NOT import from apps/server/admin/ or apps/server/student/ directories.
