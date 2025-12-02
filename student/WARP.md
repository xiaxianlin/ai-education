# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
This is a React 18 application built with Rsbuild, TypeScript, and Tailwind CSS. It is containerized for deployment using Docker and Nginx.

### Tech Stack
- **Framework:** React 18
- **Build Tool:** Rsbuild
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn/ui (`src/components/ui`)
- **Routing:** `react-router-dom`
- **State Management:** Zustand
- **API Client:** Axios
- **Utility:** Lodash-es, class-variance-authority, clsx, tailwind-merge

## Development Workflow

### Prerequisites
- Node.js 18+
- pnpm

### Commands
- **Install Dependencies:** `pnpm install`
- **Start Dev Server:** `pnpm dev` (Runs on port 7030, proxies `/api` to `http://127.0.0.1:7890`)
- **Build for Production:** `pnpm build`
- **Preview Production Build:** `pnpm preview`
- **Type Check:** `pnpm type-check` (Runs `tsc --noEmit`)

## Architecture

### Directory Structure
The source code is located in `src/` with the path alias `@/` pointing to `./src/`.

- **`src/pages/`**: Application route components.
- **`src/components/`**: Reusable UI components.
  - **`src/components/ui/`**: Base UI components (likely shadcn/ui).
- **`src/layouts/`**: Page layout components (e.g., headers, sidebars).
- **`src/stores/`**: Global state management using Zustand.
- **`src/services/`**: API integration layers (axios instances and endpoints).
- **`src/hooks/`**: Custom React hooks.
- **`src/lib/`**: Utility functions and helpers.
- **`src/types/`**: TypeScript type definitions.
- **`src/constants/`**: Application constants.

### Configuration Files
- **`rsbuild.config.ts`**: Build configuration. Defines the proxy, entry point, and output settings.
- **`tailwind.config.js`**: Tailwind CSS configuration.
- **`tsconfig.json`**: TypeScript configuration.
- **`Dockerfile`**: Multi-stage build (Node.js builder -> Nginx runner).
- **`nginx.conf`**: Nginx configuration for serving the app and proxying API requests.

## Deployment
The application is deployed as a Docker container serving static assets via Nginx.
- **Build:** `docker build -t student-app .`
- **Nginx:** Configured to handle SPA routing (redirecting 404s to `index.html`) and proxy `/api` requests to a backend service named `server` on port 7890 within the Docker network.
