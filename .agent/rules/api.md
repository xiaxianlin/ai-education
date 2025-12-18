---
description: "RESTful API design standards and data synchronization protocols"
globs: "**/routes/**, **/services/**, **/schema.py, **/types.d.ts"
alwaysApply: false
---

# API Design & Data Synchronization

## RESTful Standards

- **Resource Naming**: Use nouns (e.g., `/unit`, `/question`). Follow existing project convention of using **singular** names for resource paths.
- **Search/Filters**: Prefer `GET /search` or `GET /list` patterns for complex filtering.
- **HTTP Methods**: 
  - `POST` for creation.
  - `PATCH` for partial updates (standard).
  - `DELETE` for removal.
  - `GET` for retrieval.

## Response & Request Format

- **Request**: MUST use JSON in body and Pydantic/TypeScript types for validation.
- **Response**: 
  - Standard success wrapper: `{ "status": 0, "message": "ok", "data": { ... } }`.
  - Error format: `{ "detail": "error message" }`.

## Cross-Platform Sync

- When changing backend Schema/Models, MUST update corresponding `types.d.ts` in `packages/shared-web` and Flutter models in `student-app`.
- API response structures SHOULD be consistent across Admin and Student platforms for the same resource.

## Operational Instructions

1. Before implementing a new API, draft the Schema first and ensure it meets the standard response wrapper requirements.
2. ALL API changes that break existing clients MUST be communicated or versioned.
3. MUST use `x-access-token` header for JWT authentication as per project standards.
