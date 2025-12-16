# AI 教育辅导

一款 K12 教育辅导工具

## 项目结构

本项目采用 Monorepo 架构，使用 pnpm workspace 和 Turborepo 进行管理。

```
├── apps/                 # 应用目录
│   ├── admin-web/        # 管理后台前端 (React 18 + Rsbuild + Ant Design 5)
│   ├── student-web/      # 学生端前端 (React 18 + Rsbuild + shadcn/ui)
│   ├── server/           # 服务端单体 (Python FastAPI + SQLAlchemy + Celery + LangChain/LangGraph)
│   └── student-app/      # 移动应用 (Flutter 3 + Riverpod + GoRouter)
├── packages/             # 共享包目录
│   └── shared-web/       # Web 共享包（类型、API 客户端、工具函数）
├── infra/                # 基础设施配置
│   ├── mysql/            # 数据库初始化脚本
│   └── nginx/            # Nginx 配置
└── docs/                 # 文档目录
```

## 快速开始

### 安装依赖

```bash
# 安装所有 Node.js 依赖
pnpm install

# 安装 Python 依赖（服务端）
cd apps/server && uv sync
```

### 开发

```bash
# 启动所有服务
pnpm dev:all

# 或单独启动
pnpm dev:admin    # 管理后台
pnpm dev:student  # 学生端
pnpm dev:server   # 后端服务
```

### 构建

```bash
# 构建所有项目
pnpm build:all

# 或单独构建
pnpm build:admin
pnpm build:student
```

## 目录说明

-   apps/admin-web: 管理后台前端 (React 18 + Rsbuild + Ant Design 5)
-   apps/student-web: 学生端前端 (React 18 + Rsbuild + shadcn/ui)
-   apps/server: 服务端单体 (FastAPI + SQLAlchemy + Celery + LangChain/LangGraph)
-   apps/student-app: 移动应用 (Flutter + Riverpod + GoRouter)
-   packages/shared-web: Web 端共享包
-   infra: 基础设施配置（MySQL 初始化、Nginx 配置）
-   docs: 文档目录（API 与设计文档等）

