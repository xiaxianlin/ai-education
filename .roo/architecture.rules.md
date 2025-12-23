# Architecture Rules

## Backend Layer Boundaries

Routes layer (apps/server/admin/routes/, apps/server/student/routes/) MUST only call services layer functions.

Routes layer MUST NOT directly access database models or execute database queries.

Services layer (apps/server/admin/services/, apps/server/student/services/) MUST only access database through AsyncSession dependency.

Services layer MUST NOT import from routes layer.

Services layer MAY import from apps/server/shared/ directory.

apps/server/shared/ directory MUST NOT import from apps/server/admin/ or apps/server/student/ directories.

Database models MUST be defined in apps/server/shared/core/database.py.

Database operations MUST use async/await with AsyncSession.

## Frontend Layer Boundaries

Pages layer (apps/admin-web/src/pages/, apps/student-web/src/pages/) MUST only access API through apps/*/src/lib/api.ts.

Pages layer MUST NOT directly call external HTTP clients.

Components MUST NOT import from pages directory.

API client MUST be instantiated from @ai-education/shared-web package.

apps/admin-web/ MUST NOT import from apps/student-web/.

apps/student-web/ MUST NOT import from apps/admin-web/.

packages/shared-web/ MUST NOT import from apps/ directory.

## Mobile Layer Boundaries

Screens layer (apps/student-app/lib/screens/) MUST access data through repository layer.

Data layer (apps/student-app/lib/screens/*/data/) MUST NOT contain UI code.

Presentation layer (apps/student-app/lib/screens/*/presentation/) MUST NOT contain business logic.

Providers MUST be defined in apps/student-app/lib/screens/*/providers/ directory.

## Cross-Module Boundaries

admin_app routes MUST be prefixed with /api/admin.

student_app routes MUST be prefixed with /api/student.

admin_app MUST use admin_route_filter middleware for authentication.

student_app MUST use student_router_filter middleware for authentication.

admin_app and student_app MUST NOT share routes or services.

admin-web MUST communicate with backend through /api/admin endpoints.

student-web MUST communicate with backend through /api/student endpoints.

student-app MUST communicate with backend through /api/student endpoints.

## Monorepo Boundaries

apps/ directory MUST NOT import from packages/ directory except for @ai-education/shared-web.

packages/ directory MUST NOT import from apps/ directory.

apps/server/ MUST NOT import from apps/admin-web/ or apps/student-web/.

apps/admin-web/ and apps/student-web/ MUST NOT import from apps/server/.

apps/student-app/ MUST NOT import from apps/admin-web/ or apps/student-web/.
