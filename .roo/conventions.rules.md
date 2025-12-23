# Conventions Rules

## Type Safety

TypeScript files MUST use TypeScript types for all variables, function parameters, and return values.

Python files MUST use type hints for all function parameters and return values.

Dart files MUST use type annotations for all variables and function parameters.

any type MUST NOT be used in TypeScript code except for legacy code or external library compatibility.

## Async and Synchronous

Database operations in Python MUST use async/await with AsyncSession.

API route handlers in Python MUST be async functions.

Celery task functions in Python MUST be async functions.

HTTP requests in TypeScript MUST use async/await with ApiClient methods.

## Error Handling

All API calls in TypeScript MUST be wrapped in try-catch blocks.

All async operations in Python MUST have error handling.

Business logic errors in Python MUST raise ValueError.

HTTP errors in Python MUST raise HTTPException.

All database operations in Python MUST handle potential exceptions.

## API Response Format

Backend API responses MUST follow ApiResponse<T> format with status, message, and data fields.

Frontend API clients MUST extract data from response.data.data.

Error responses MUST have status code and message fields.

## Authentication

All admin API routes MUST use admin_route_filter dependency.

All student API routes MUST use student_router_filter dependency.

Authentication token MUST be passed in x-access-token header.

## Database

Database queries MUST use SQLAlchemy select() syntax.

Database relationships MUST use lazy="joined" for eager loading.

Database sessions MUST be obtained through Database dependency.

## State Management

React pages MUST use unstated-next createContainer for page-level state.

React hooks MUST use useRequest from ahooks for async operations.

Flutter screens MUST use Riverpod StateNotifierProvider for state management.

## File Organization

React pages MUST follow pages/[Feature]/[PageName]/ structure.

Python routes MUST be in routes/[resource].py files.

Python services MUST be in services/[resource].py files.

Flutter screens MUST follow screens/[feature]/ structure.

## Code Generation

Flutter model changes MUST be followed by running ./build.sh.

Flutter models MUST use @freezed annotation with json_serializable.

## Import Order

TypeScript imports MUST follow: React, third-party, project components, UI components, types, utils.

Python imports MUST follow: standard library, third-party, local imports.
