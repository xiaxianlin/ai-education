---
description: "Standard procedure for adding a new backend feature module"
---

1. **Define Schema**: Create a new or update an existing `schema.py` in the module directory (e.g., `apps/server/admin/module/schema.py`).
2. **Implement DB Models**: Ensure relevant models are defined in `apps/server/shared/core/database/`.
3. **Create Service**: Implement business logic in `apps/server/admin/module/services/service_name.py`.
4. **Implement Route**:
   - Create `apps/server/admin/module/route.py`.
   - define `APIRouter(prefix="/module")`.
   - Call service functions and use Pydantic schemas for validation.
5. **Register Router**: Add the router to `apps/server/admin/__init__.py`.
6. **Verify**: Use `pnpm dev:server` and check `/api/admin/docs`.
