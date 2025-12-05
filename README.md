# AI 教育辅导

一款 K12 教育辅导工具

## 项目结构

本项目采用 Monorepo 架构，使用 pnpm workspace 和 Turborepo 进行管理。

```
├── apps/              # 应用目录
│   ├── admin/         # 管理后台前端 (React + UmiJS)
│   ├── student/       # 学生端前端 (React + Rsbuild)
│   ├── server/        # 后端服务 (Python FastAPI)
│   └── mobile/        # 移动应用 (Flutter)
├── packages/          # 共享包目录
│   ├── shared-types/  # 共享 TypeScript 类型定义
│   ├── shared-utils/  # 共享工具函数
│   └── shared-api-client/ # 共享 API 客户端
├── infra/     # 基础设施配置
│   ├── mysql/         # 数据库初始化脚本
│   └── nginx/         # Nginx 配置
└── docs/              # 文档目录
```

## 快速开始

### 安装依赖

```bash
# 安装所有 Node.js 依赖
pnpm install

# 安装 Python 依赖
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

-   apps/server: 服务端
-   apps/student: 学生系统
-   apps/admin: 后台管理
-   apps/mobile: 移动应用
-   docs: 文档目录

详细迁移说明请查看 [docs/MONOREPO_MIGRATION.md](docs/MONOREPO_MIGRATION.md)
