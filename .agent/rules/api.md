---
description: "RESTful API design standards and data synchronization protocols"
globs: "**/routes/**, **/services/**, **/schema.py, **/types.d.ts"
alwaysApply: false
---

# API Design & Data Synchronization

## RESTful Standards

- **Resource Naming**: Use nouns (e.g., `/unit`, `/question`). Use **singular** names for resource paths.
- **Search/Filters**: Prefer `GET /list` or `GET /search` patterns for collections.
- **HTTP Methods**: 
  - `POST` for creation.
  - `PUT` or `PATCH` for updates.
  - `DELETE` for removal.
  - `GET` for retrieval.

## Response & Request Format

- **Request**: MUST use JSON in body and Pydantic/TypeScript types for validation.
- **Response Wrapper**: 
  - Standard success: `{ "status": 0, "message": "ok", "data": { ... } }`.
  - Error: `{ "detail": "error message" }` or custom error objects.

## Authentication

- **Auth Header**: MUST use `x-access-token` header for JWT authentication.
- **Token Storage**: Managed via `ApiClient` in shared packages.

## Cross-Platform Sync

- When changing backend Schema, MUST update corresponding `types.d.ts` in relevant frontend feature folders or shared package.
- Use `scripts/generate-types.ts` if available to automate sync.

## Operational Instructions

1. Before implementing a new API, draft the Schema first and ensure it meets the standard response wrapper requirements.
2. ALL API changes that break existing clients MUST be versioned or carefully migrated.
