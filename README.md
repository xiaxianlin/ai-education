# 小学生练习系统

一款面向小学生的在线练习系统，包括后台管理、学生 PC 端、学生移动端。

## 项目结构

本项目采用 Monorepo 架构，使用 pnpm workspace 和 Turborepo 进行管理。

```
├── apps/                 # 应用目录
│   ├── admin-web/        # 后台管理端 (React 18 + Rsbuild + Ant Design 5)
│   ├── student-web/      # 学生 PC 端 (React 18 + Rsbuild + shadcn/ui)
│   ├── student-mobile/   # 学生移动端 (React Native + Expo + Tamagui)
│   └── server/           # 服务端单体 (Python FastAPI + SQLAlchemy + Celery + LangChain/LangGraph)
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
pnpm dev:admin    # 后台管理端
pnpm dev:student  # 学生 PC 端
pnpm dev:mobile   # 学生移动端
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

-   apps/admin-web: 后台管理端 (React 18 + Rsbuild + Ant Design 5)
-   apps/student-web: 学生 PC 端 (React 18 + Rsbuild + shadcn/ui)
-   apps/student-mobile: 学生移动端 (React Native + Expo + Tamagui)
-   apps/server: 服务端单体 (FastAPI + SQLAlchemy + Celery + LangChain/LangGraph)
-   packages/shared-web: Web 端共享包
-   infra: 基础设施配置（MySQL 初始化、Nginx 配置）
-   docs: 文档目录（API 与设计文档等）

