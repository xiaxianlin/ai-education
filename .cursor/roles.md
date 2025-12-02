# 开发角色切换指南

## 项目概述

这是一个全栈教育平台项目，包含：
- **管理端 (admin/)**: React + UmiJS + Ant Design
- **学生端 (student/)**: React + Rsbuild + shadcn/ui + Tailwind CSS
- **后端 (server/)**: FastAPI + Python + SQLAlchemy + MySQL

## 技术栈详情

### 前端技术栈

#### 管理端 (admin/)
- **框架**: React 18 + UmiJS 4
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: ahooks
- **HTTP 客户端**: umi-request (基于 axios)
- **构建工具**: Webpack 5 (通过 UmiJS)
- **语言**: TypeScript 5
- **样式**: Less + Tailwind CSS

#### 学生端 (student/)
- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: react-router-dom
- **HTTP 客户端**: Axios
- **语言**: TypeScript 5

### 后端技术栈

- **框架**: FastAPI 0.115+
- **语言**: Python 3.12
- **数据库**: MySQL (通过 SQLAlchemy 2.0 异步 ORM)
- **缓存**: Redis
- **认证**: JWT (PyJWT)
- **AI 平台**: 阿里云百炼AI (DashScope SDK)
- **对象存储**: 阿里云 OSS
- **日志**: Loguru
- **异步运行时**: Uvicorn

## 角色定义

### 前端开发者 (Frontend Developer)
专注于客户端应用开发，包括：
- React 组件开发
- 状态管理和数据流
- 路由和导航
- API 集成
- 用户体验优化
- 性能优化
- TypeScript 类型安全

**工作目录**: `admin/src/`, `student/src/`

### 后端开发者 (Backend Developer)
专注于服务端应用开发，包括：
- API 设计和实现
- 数据模型设计
- 业务逻辑实现
- 数据库操作
- 认证和授权
- 错误处理
- 性能优化

**工作目录**: `server/`

### UI 设计师 (UI Designer)
专注于用户界面和体验设计，包括：
- 视觉设计系统
- 交互设计
- 响应式布局
- 组件样式
- 用户体验优化
- 可访问性

**工作目录**: 所有前端样式和组件文件

### 全栈开发者 (Fullstack Developer)
专注于端到端的完整功能开发，包括：
- 前后端完整功能实现
- API 设计和前端集成
- 数据模型设计和前后端数据流
- 完整的用户流程实现
- 前后端联调和测试
- 端到端性能优化
- 前后端安全性设计

**工作目录**: `admin/src/`, `student/src/`, `server/`

## 角色切换方法

### 方法一：使用命令文件
在对话中使用 `@frontend`, `@backend`, `@ui-designer`, `@fullstack` 命令

### 方法二：明确声明
在对话开始时明确说明：
```
我现在是前端开发者，请帮我...
我现在是后端开发者，请帮我...
我现在是 UI 设计师，请帮我...
我现在是全栈开发者，请帮我实现一个完整功能...
```

### 方法三：通过文件上下文
打开相关文件后，AI 会自动识别上下文：
- 打开 `student/src/` 或 `admin/src/` 下的文件 → 前端开发模式
- 打开 `server/` 下的文件 → 后端开发模式
- 打开样式文件 → UI 设计模式
- 同时打开前后端文件 → 全栈开发模式

## 开发工作流

### 典型功能开发流程

#### 方式一：分角色协作（适合团队开发）

1. **需求分析** (UI 设计师)
   - 分析用户需求
   - 设计界面布局
   - 定义交互流程

2. **后端开发** (后端开发者)
   - 设计 API 接口
   - 实现数据模型
   - 编写业务逻辑
   - 添加数据验证

3. **前端开发** (前端开发者)
   - 实现 UI 组件
   - 集成后端 API
   - 实现状态管理
   - 优化用户体验

4. **测试和优化** (全角色协作)
   - 功能测试
   - 性能优化
   - 用户体验优化

#### 方式二：全栈开发（适合独立开发）

1. **需求分析** (全栈开发者)
   - 理解业务需求
   - 设计完整技术方案
   - 确定前后端接口

2. **数据模型设计** (全栈开发者)
   - 设计数据库模型
   - 定义前后端数据结构
   - 确保数据一致性

3. **后端实现** (全栈开发者)
   - 实现 API 接口
   - 编写业务逻辑
   - 数据验证和错误处理

4. **前端实现** (全栈开发者)
   - 实现 UI 组件
   - 集成后端 API
   - 状态管理和用户体验

5. **联调和测试** (全栈开发者)
   - 前后端联调
   - 完整功能测试
   - 性能优化

## 代码规范

### 前端规范
- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 遵循 React Hooks 规则
- 使用 ESLint 和 Prettier
- 组件文件使用 PascalCase
- 工具函数使用 camelCase

### 后端规范
- 遵循 PEP 8 Python 代码规范
- 使用类型提示 (Type Hints)
- 异步函数使用 `async/await`
- 路由使用 RESTful 规范
- 使用 Pydantic 进行数据验证
- 错误处理使用 HTTPException

### UI 设计规范
- 使用 Tailwind CSS 工具类
- 遵循设计系统规范
- 确保响应式设计
- 考虑可访问性 (a11y)
- 保持设计一致性

## 常用命令

### 前端开发
```bash
# 学生端
cd student && pnpm dev        # 启动开发服务器 (端口 7030)
cd student && pnpm build      # 构建生产版本
cd student && pnpm type-check # 类型检查

# 管理端
cd admin && pnpm start        # 启动开发服务器
cd admin && pnpm build        # 构建生产版本
cd admin && pnpm tsc         # 类型检查
```

### 后端开发
```bash
cd server
uvicorn main:app --reload    # 启动开发服务器
pytest                        # 运行测试
```

## 项目结构

```
ai-eduaction/
├── admin/              # 管理端前端
│   └── src/
│       ├── pages/      # 页面组件
│       ├── components/ # 业务组件
│       ├── services/   # API 服务
│       └── hooks/      # 自定义 Hooks
├── student/            # 学生端前端
│   └── src/
│       ├── pages/      # 页面组件
│       ├── components/ # UI 组件
│       ├── stores/     # Zustand 状态
│       └── services/   # API 服务
└── server/             # 后端服务
    ├── admin/          # 管理端 API
    ├── student/        # 学生端 API
    ├── core/           # 核心模块
    └── shared/         # 共享模块
```

## 最佳实践

1. **一次对话一个角色**: 避免在同一对话中频繁切换角色（全栈开发者除外）
2. **明确上下文**: 切换角色时提供足够的上下文信息
3. **参考现有代码**: 利用项目中的现有代码作为参考
4. **保持一致性**: 遵循项目的代码风格和架构模式
5. **分阶段完成**: 先设计再实现，先后端再前端
6. **全栈开发**: 全栈开发者可以一次性完成前后端，但建议先完成后端再实现前端
7. **数据一致性**: 确保前后端数据模型和类型定义保持一致

