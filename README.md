# 小学生练习系统

一款面向小学生的在线练习系统，包括后台管理、学生 PC 端和 Go 后端服务。

## 项目结构

本项目采用 Monorepo 架构，使用 pnpm workspace 和 Turborepo 进行管理。

```
├── apps/                 # 应用目录
│   ├── admin-web/        # 后台管理端 (React 18 + Rsbuild + Ant Design 5)
│   ├── student-web/      # 学生 PC 端 (React 18 + Rsbuild + shadcn/ui)
│   └── server-go/        # Go 后端服务
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

# 运行 Go 后端测试
cd apps/server-go && go test ./...
```

### 开发

```bash
# 启动所有服务
pnpm dev:all

# 或单独启动
pnpm dev:admin    # 后台管理端
pnpm dev:student  # 学生 PC 端
pnpm dev:server   # Go 后端服务 @ 7891
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
-   apps/server-go: Go 后端服务
-   packages/shared-web: Web 端共享包
-   infra: 基础设施配置（MySQL 初始化、Nginx 配置）
-   docs: 文档目录（API 与设计文档等）
