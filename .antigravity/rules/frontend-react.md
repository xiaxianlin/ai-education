# Frontend React Configuration Rules

## Core Standards

- **Framework**: React 18+ (Functional Components + Hooks)
- **Language**: TypeScript 5+ (Strict Mode)
- **Styling**: Tailwind CSS
- **Build Tool**: Rsbuild

## Architecture

- **State Management**: `unstated-next` for container-based state sharing.
- **API Interaction**: `ahooks` (`useRequest`) for managed fetching.
- **Component Separation**:
  - `models/page.ts`: Logic and state.
  - `views/`: Presentation components.
  - `hooks/`: Reusable logic.

## UI Guidelines

- **Admin**: Ant Design 5 + Ant Design Pro Components.
- **Student (Web)**: shadcn/ui.
- **Student (Mobile)**: Tamagui + React Native Expo.

## Tailwind Patterns

- **Multi-state Styles**: Strictly use state mapping objects.
- **No `cn` Abuse**: Prefer array `.join(" ")` for clarity.
- **Typography**: Use Google Fonts (Inter, Roboto, etc.).

## Coding Patterns

- **Optional Chaining**: Use `obj?.prop?.sub` consistently.
- **Type Safety**: No `any`. Use `ApiResponse<T>` for API results.
- **Imports**: Strict ordering (React -> Third-party -> Business -> UI -> Types -> Utils).
