# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI education admin panel built with Ant Design Pro v6.0.0, using Umi Max framework with TypeScript. The application provides a web interface for managing AI education system accounts and configurations.

## Architecture

- **Framework**: Umi Max (based on React 18)
- **UI Library**: Ant Design 5.x with ProComponents
- **Build Tool**: Umi Max (bundled Vite/Webpack)
- **Testing**: Jest with React Testing Library
- **Package Manager**: pnpm (lockfile present)

## Key Directories

- `src/pages/` - Route-based page components
  - `Auth/` - Login and password management
  - `Home/` - Dashboard/main view
  - `System/Manager/` - Account management interface
- `src/services/` - API service layer (auth.ts, manager.ts)
- `src/components/` - Reusable UI components
  - `Header/AvatarDropdown/` - User profile dropdown
- `config/` - Umi configuration (routes, proxy, config)

## Authentication Flow

1. Initial state loads via `getInitialState()` in `src/app.tsx`
2. Auth check via `/api/admin/check` endpoint
3. Token stored in localStorage as 'token'
4. Auto-redirect to `/login` on 401 responses
5. Password change required redirect on 499 responses

## API Configuration

- Base URL: `/api/admin` (configured in `src/app.tsx`)
- Authentication: Bearer token via `x-access-token` header
- Response format: `{ status: number, message: string, data: any }`

## Available Commands

### Development
```bash
npm start          # Start development server
npm run dev        # Alias for start:dev
npm run start:dev  # Development without mock
npm run start:no-mock  # Development without mock data
```

### Build & Deploy
```bash
npm run build      # Production build
npm run preview    # Preview production build locally
npm run analyze    # Bundle analysis with ANALYZE=1
```

### Code Quality
```bash
npm run lint       # Run all linting (ESLint + Prettier + TypeScript)
npm run lint:fix   # Auto-fix linting issues
npm run tsc        # TypeScript type checking
npm run prettier   # Format all files with Prettier
```

### Testing
```bash
npm test           # Run all tests
npm run test:coverage  # Run tests with coverage
npm run test:update    # Update Jest snapshots
```

## Route Structure

- `/` → `/home` (redirect)
- `/home` - Dashboard with '首页' title
- `/system/manager` - Account management under '系统管理'
- `/login` - Authentication page (no layout)
- `/password` - Password change page
- `*` - 404 page

## Environment Variables

- `REACT_APP_ENV`: dev/test/pre (set via npm scripts)
- `UMI_ENV`: dev (set via npm scripts)
- `MOCK`: none (set via npm scripts to disable mock)

## Type Definitions

- Global types in `types/` directory (auth.d.ts, manager.d.ts, index.d.ts)
- API response format: `ApiData<T>`
- Manager type: `Manager`
- Login model: `LoginModel`
- Password modification: `ModifyPasswordModel`

## Styling

- Ant Design theme customization via `antd-style`
- Global styles in `src/global.less`
- Component-specific styles use CSS modules or inline styles