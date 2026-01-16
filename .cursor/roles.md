# Cursor 角色切换指南

本文档说明如何在 Cursor 中切换不同的开发角色，以及各角色的职责和常用命令。

## 项目结构

这是一个 Monorepo 项目，包含以下应用：

- **apps/admin-web**: 后台管理端（React + Ant Design）
- **apps/student-web**: 学生 PC 端（React + shadcn/ui）
- **apps/student-mobile**: 学生移动端（React Native + Expo）
- **apps/server**: 服务端（FastAPI + Python）
- **packages/shared-web**: Web 端共享包

## 快速命令

### 开发命令
```bash
pnpm dev:admin        # 启动后台管理端
pnpm dev:student      # 启动学生 PC 端
pnpm dev:mobile       # 启动学生移动端
pnpm dev:server       # 启动服务端 (FastAPI @ 7890)
pnpm dev:worker       # 启动 Celery 任务队列工作进程
pnpm dev:all          # 同时启动所有服务
```

### 构建命令
```bash
pnpm build:admin      # 构建后台管理端
pnpm build:student    # 构建学生 PC 端
pnpm build:server     # 构建后端
pnpm build:all        # 构建所有应用
```

### 测试与检查
```bash
pnpm test            # 运行所有测试
pnpm lint            # 运行 lint
pnpm format          # Prettier 格式化
```

## 角色说明

### 前端开发（admin-web / student-web）

**技术栈**:
- React 18 + TypeScript 5 + Rsbuild
- admin-web: Ant Design 5 + Ant Design Pro
- student-web: shadcn/ui + Tailwind CSS
- 状态管理: unstated-next + ahooks

**关键文件位置**:
- 页面: `apps/[app-name]/src/pages/[Feature]/[PageName]/`
- 组件: `apps/[app-name]/src/components/`
- API: `apps/[app-name]/src/lib/api.ts` 或 `apps/[app-name]/src/pages/[Feature]/api.ts`

**开发规范**:
- 页面结构: `index.tsx` → `models/page.ts` → `views/Main.tsx`
- 状态管理: 使用 `unstated-next` 的 `createContainer`
- API 调用: 使用 `@ai-education/shared-web` 的 `ApiClient`
- Tailwind: 使用状态映射函数，禁止 `cn` 封装

### 后端开发（server）

**技术栈**:
- Python 3.12 + FastAPI 0.115+
- SQLAlchemy 2.0 异步 ORM
- MySQL + Redis + Celery
- LangChain + LangGraph

**关键文件位置**:
- 路由: `apps/server/admin/[module]/route.py` 或 `apps/server/student/[module]/route.py`
- 服务: `apps/server/admin/[module]/services/` 或 `apps/server/student/[module]/services/`
- 模型: `apps/server/shared/core/database/`

**开发规范**:
- 分层架构: 路由层 → 服务层 → 数据层
- SQLAlchemy: 强制使用 2.0 异步 ORM 风格
- 导入顺序: 标准库 → 第三方库 → 本地模块
- 错误处理: 使用 `ValueError` 抛出业务错误

### 移动端开发（student-mobile）

**技术栈**:
- React Native + Expo
- TypeScript 5
- Tamagui UI 组件
- Zustand 状态管理

**关键文件位置**:
- 页面: `apps/student-mobile/app/`
- 组件: `apps/student-mobile/src/components/`
- API: `apps/student-mobile/src/api/`

## 常用工作流

### 开发新功能

1. **前端功能**:
   - 在 `pages/[Feature]/[PageName]/` 创建页面目录
   - 创建 `models/page.ts` 管理状态
   - 创建 `views/Main.tsx` 渲染 UI
   - 在对应 `api.ts` 中添加 API 调用

2. **后端功能**:
   - 在 `admin/[module]/route.py` 或 `student/[module]/route.py` 添加路由
   - 在 `services/` 目录实现业务逻辑
   - 在 `schema.py` 定义请求/响应模型

### 代码审查

使用 `.cursor/commands/cr.md` 中的检查清单进行代码审查。

### 更新规则

使用 `/update-rules` 命令更新所有 Cursor 规则和 AGENTS.md 文件。

## 相关资源

- 项目概述: `.cursor/rules/project-overview/RULE.md`
- React 前端规范: `.cursor/rules/react-frontend/RULE.md`
- Python 后端规范: `.cursor/rules/python-backend/RULE.md`
- API 设计规范: `.cursor/rules/api-design/RULE.md`
- 命名规范: `.cursor/rules/naming-conventions/RULE.md`
- 根目录 AGENTS.md: `AGENTS.md`
