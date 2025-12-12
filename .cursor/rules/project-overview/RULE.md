---
description: "项目概述和架构信息，包含 Monorepo 结构、技术栈和开发工作流"
alwaysApply: true
---

# 项目概述

这是一个 K12 教育辅导工具的 Monorepo 项目，使用 pnpm workspace 和 Turborepo 进行管理。

## 项目结构

### 前端应用
- **apps/admin-web**: 管理后台前端 (React 18 + Rsbuild + Ant Design 5)
  - TypeScript 5, Less + Tailwind CSS
  - 状态管理: ahooks, HTTP 客户端: Axios

- **apps/student-web**: 学生端前端 (React 18 + Rsbuild + shadcn/ui)
  - TypeScript 5, Tailwind CSS
  - 状态管理: Zustand, 路由: react-router-dom, HTTP 客户端: Axios

### 后端服务
- **apps/server**: 服务端单体 (Python 3.12 + FastAPI)
  - FastAPI 0.115+, SQLAlchemy 2.0 异步 ORM
  - MySQL 数据库, Redis + Celery 任务队列
  - AI 工作流: LangChain + LangGraph
  - 认证: JWT, AI 平台: 阿里云百炼AI, 对象存储: 阿里云 OSS
  - 日志: Loguru, 包管理器: uv

### 移动应用
- **apps/student-app**: 移动应用 (Flutter 3.0+)
  - Dart 3.8+, 状态管理: Riverpod
  - 路由: GoRouter 17.0, 网络请求: Dio 5.4.0
  - UI: Material Design, 代码生成: json_serializable, freezed

## 开发工作流

1. **前端开发**: `pnpm dev:admin` 或 `pnpm dev:student`
2. **后端开发**: `pnpm dev:server` 启动服务端（FastAPI 单体 + 任务）
3. **移动应用**: `cd apps/student-app && flutter run`（需要先运行 `./build.sh` 生成代码）
4. **全部启动**: `pnpm dev:all` 启动所有前端和后端服务

## 依赖管理

- **Node.js**: 使用 pnpm (版本 >= 8.0.0, packageManager: pnpm@8.15.0)
- **Python**: 使用 uv 进行依赖管理
- **Flutter**: 使用 `flutter pub get` 进行依赖管理，使用 `build_runner` 生成代码

## 数据库

- 使用 MySQL 数据库
- 初始化脚本位于 `infra/mysql/00-init.sql`

## 架构原则

1. **Monorepo 管理**: 使用 pnpm workspace 和 Turborepo
2. **分层架构**: 路由层 → 服务层 → 数据层
3. **类型安全**: 所有代码必须使用类型系统（TypeScript/Python Type Hints）
4. **错误处理**: 所有 API 调用和异步操作必须有错误处理
5. **环境变量**: 所有配置通过环境变量管理，不要硬编码
6. **跨平台一致性**: 移动端应参考 Web 端（student-web）的实现逻辑，保持功能一致性
