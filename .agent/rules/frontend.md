---
description: "React frontend development standards for admin-web and student-web"
globs: "apps/admin-web/**, apps/student-web/**, packages/shared-web/**"
alwaysApply: false
---

# Frontend Development Standards

## Tech Stack

- **Base**: React 18 + TypeScript 5 + Rsbuild.
- **Admin-Web**: Ant Design 5 + Pro Components + ahooks.
- **Student-Web**: shadcn/ui + Tailwind CSS + unstated-next.

## Core Standards

- **Function Components**: Use functional components with Hooks ONLY.
- **State Management**: 
  - Page-level state MUST use `unstated-next` containers (standardized in `models/` folder).
  - Async data fetching MUST use `useRequest` from `ahooks`.
- **Component Structure**: 
  - Split large pages: `index.tsx` (entry/Providers), `views/` (layout), `parts/` (local items).
  - Keep UI components separate from business logic (hooks/models).

## Admin-Web Specifics (ProComponents)

- **ProTable**: MUST use standardized column creators from `@/hooks/useTableColumns` where possible:
  - `createTimeColumn`: For date-time display.
  - `createStatusColumn`: For boolean status with `StatusTag`.
  - `createStatusSearchColumn`: For status dropdown in search forms.
  - `createActionColumn`: For the right-side action menu.
- **Status Indicators**: Use `StatusTag` component for uniform success/error state display.

## API Calls

- ALL API calls MUST go through the centralized `ApiClient` in `@ai-education/shared-web`.
- Frontend endpoints MUST be defined in `lib/api.ts` (e.g., `adminApi`, `studentApi`).

## Styling

- **Admin**: Use Ant Design tokens and Less. Use Tailwind for layout utility only.
- **Student**: Use Tailwind CSS for almost all styling. Follow shadcn/ui patterns.

## Operational Instructions

1. When creating a new page, MUST follow the directory structure: `pages/[Feature]/[PageName]/index.tsx`.
2. MUST NOT use `any`. Define proper types in `@/types.d.ts` or `models/page.ts`.
3. After meaningful UI changes, MUST check responsiveness on both Desktop and Mobile (for student-web).
