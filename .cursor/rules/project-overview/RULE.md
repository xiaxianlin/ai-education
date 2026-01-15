---
description: "项目概述和架构信息，包含 Monorepo 结构、技术栈和开发工作流"
alwaysApply: true
---

# 项目概述

这是一个小学生练习系统的 Monorepo 项目，包括后台管理、学生 PC 端、学生移动端，使用 pnpm workspace 和 Turborepo 进行管理。

## 项目结构

### 前端应用

- **apps/admin-web**: 后台管理端 (React 18 + Rsbuild + Ant Design 5)
  - TypeScript 5, Less + Tailwind CSS
  - UI 库: Ant Design 5 + Ant Design Pro Components
  - 状态管理: unstated-next（页面/模块模型）+ ahooks（异步/请求辅助）
  - HTTP 客户端: 基于 `@ai-education/shared-web` 的 `ApiClient`，业务 API 按模块拆分到各业务目录下的 `api.ts`
  - 路由: react-router-dom

- **apps/student-web**: 学生 PC 端 (React 18 + Rsbuild + shadcn/ui)
  - TypeScript 5, Tailwind CSS
  - UI 组件: shadcn/ui (基于 Radix UI)
  - 状态管理: unstated-next（全局/页面模型）+ ahooks（异步/请求辅助）
  - HTTP 客户端: 基于 `@ai-education/shared-web` 的 `ApiClient`，API 统一封装在 `src/lib/api.ts` 的 `studentApi`
  - 路由: react-router-dom

- **apps/student-mobile**: 学生移动端 (React Native + Expo + Tamagui)
  - TypeScript 5, NativeWind (Tailwind CSS for React Native)
  - UI 组件: Tamagui
  - 状态管理: Zustand
  - HTTP 客户端: Axios，基于 `@ai-education/shared-web` 的 `ApiClient`
  - 路由: Expo Router

### 后端服务

- **apps/server**: 服务端单体 (Python 3.12 + FastAPI)
  - FastAPI 0.115+, SQLAlchemy 2.0 异步 ORM（强制使用 2.0 风格）
  - MySQL 数据库, Redis + Celery 任务队列
  - AI 工作流: LangChain + LangGraph（用于复杂业务逻辑）
  - 认证: JWT (PyJWT), AI 平台: 阿里云百炼AI (DashScope SDK), 对象存储: 阿里云 OSS
  - 日志: Loguru, 包管理器: uv
  - 应用架构: 子应用挂载架构（`admin_app` 和 `student_app` 挂载到主应用）

## 开发工作流

1. **前端开发**: `pnpm dev:admin`（后台管理端）、`pnpm dev:student`（学生 PC 端）、`pnpm dev:mobile`（学生移动端）
2. **后端开发**: `pnpm dev:server` 启动服务端（FastAPI 单体，默认端口 7890）
3. **全部启动**: `pnpm dev:all` 启动所有前端和后端服务

## 依赖管理

- **Node.js**: 使用 pnpm（与根 `package.json` 的 `packageManager` 保持一致，当前为 pnpm@9.x；Node >= 18）
- **Python**: 使用 uv 进行依赖管理

## 共享包

- **packages/shared-web**: Web 端共享包
  - API 客户端基类 (`ApiClient`)
  - 类型定义（API 响应、数据模型等）
  - 工具函数（路由跳转等）
  - 导出路径: `@ai-education/shared-web`

## 数据库

- 使用 MySQL 数据库
- 初始化脚本位于 `infra/mysql/ai_education.sql`
- 数据库模型定义在 `apps/server/shared/core/database/` 目录

## 架构原则

1. **Monorepo 管理**: 使用 pnpm workspace 和 Turborepo
2. **分层架构**: 路由层 → 服务层 → 数据层
3. **类型安全**: 所有代码必须使用类型系统（TypeScript/Python Type Hints）
4. **错误处理**: 所有 API 调用和异步操作必须有错误处理
5. **环境变量**: 所有配置通过环境变量管理，不要硬编码
