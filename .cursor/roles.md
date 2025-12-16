# 开发角色切换指南

## 项目概述

这是一个全栈教育平台项目，采用 Monorepo 架构，包含 6 个主要应用：

### 项目结构

1. **admin-web** - 管理端前端应用
   - React 18 + Rsbuild + Ant Design 5
   - 位置: `apps/admin-web/`

2. **student-web** - 学生端 Web 应用
   - React 18 + Rsbuild + shadcn/ui + Tailwind CSS
   - 位置: `apps/student-web/`

3. **student-app** - 学生端移动应用
   - Flutter 3.0+ + Dart 3.8+ + Riverpod + GoRouter
   - 位置: `apps/student-app/`

4. **server** - 服务端（单体应用）
   - FastAPI + Python 3.12 + SQLAlchemy + MySQL + Redis
   - LangChain + LangGraph（AI 工作流） / Celery (Redis 作为 Broker 和 Backend) 任务处理
   - 位置: `apps/server/`

## 技术栈详情

### 前端技术栈

#### 管理端 (admin-web)
- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: ahooks
- **HTTP 客户端**: Axios
- **样式**: Less + Tailwind CSS
- **语言**: TypeScript 5

#### 学生端 Web (student-web)
- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **状态管理**: Zustand
- **路由**: react-router-dom
- **HTTP 客户端**: Axios
- **样式**: Tailwind CSS
- **语言**: TypeScript 5

### 移动端技术栈 (student-app)

- **框架**: Flutter 3.0+
- **语言**: Dart 3.8+
- **状态管理**: Riverpod (flutter_riverpod, hooks_riverpod)
- **路由**: GoRouter 17.0
- **网络请求**: Dio 5.4.0
- **本地存储**: SharedPreferences 2.2.2
- **UI 组件**: Material Design + 自定义组件
- **代码生成**: json_serializable, freezed, build_runner
- **音频录制**: record 6.1.2
- **权限管理**: permission_handler 12.0.1
- **图片缓存**: cached_network_image, flutter_cache_manager

### 后端技术栈

#### 服务端（单体，apps/server）
- **框架**: FastAPI 0.115+
- **语言**: Python 3.12
- **数据库**: MySQL (SQLAlchemy 2.0 异步 ORM)
- **缓存/队列**: Redis + Celery (任务队列)
- **AI**: LangChain + LangGraph + 阿里云百炼AI (DashScope SDK)
- **对象存储**: 阿里云 OSS
- **认证**: JWT (PyJWT)
- **日志**: Loguru
- **异步运行时**: Uvicorn

## 角色定义

### 前端开发者 (Frontend Developer)
专注于 Web 客户端应用开发，包括：
- React 组件开发和架构设计
- 状态管理和数据流设计
- 路由和导航实现
- API 集成和数据获取
- 用户体验优化
- 性能优化（代码分割、懒加载、缓存）
- TypeScript 类型安全
- 响应式设计实现

**负责项目**: `apps/admin-web/`, `apps/student-web/`

**工作目录**: `apps/admin-web/src/`, `apps/student-web/src/`

### 后端开发者 (Backend Developer)
专注于服务端应用开发，包括：
- API 设计和 RESTful 规范实现
- 数据模型设计和数据库操作
- 业务逻辑实现
- 认证和授权机制
- 数据验证和错误处理
- 性能优化和缓存策略
- 日志记录和监控
- 异步编程和并发处理
- 任务队列和后台任务处理
- AI 服务集成和工作流设计

**负责项目**: `apps/server/`

**工作目录**: `apps/server/`

### 移动端开发者 (Mobile Developer)
专注于移动端应用开发，包括：
- Flutter 应用架构设计
- Widget 开发和 UI 实现
- 状态管理和数据流设计（Riverpod）
- 路由和导航实现（GoRouter）
- API 集成和数据获取（Dio）
- 平台特定功能实现（iOS/Android）
- 性能优化和内存管理
- 用户体验优化（动画、交互、响应式）
- 代码生成和模型序列化（json_serializable, freezed）

**负责项目**: `apps/student-app/`

**工作目录**: `apps/student-app/lib/`

### 架构师 (Architect)
专注于系统架构和技术决策，包括：
- 整体技术架构设计
- 系统模块划分和边界定义
- 技术选型和评估
- 性能架构设计
- 安全架构设计
- 可扩展性和可维护性设计
- 技术债务管理
- 代码审查和最佳实践指导

**负责范围**: 整个 Monorepo 项目

**工作目录**: 项目根目录及各应用目录

### 全栈开发者 (Fullstack Developer)
专注于端到端的完整功能开发，包括：
- 前后端完整功能实现
- API 设计和前端集成
- 数据模型设计和前后端数据流
- 完整的用户流程实现
- 前后端联调和测试
- 端到端性能优化
- 前后端安全性设计

**负责项目**: 所有项目

**工作目录**: `apps/admin-web/`, `apps/student-web/`, `apps/student-app/`, `apps/server/`

### UI 设计师 (UI Designer)
专注于用户界面和体验设计，包括：
- 视觉设计系统设计
- 交互设计和用户体验优化
- 响应式布局设计
- 组件样式实现
- 动画和过渡效果
- 可访问性 (a11y) 设计
- 设计一致性维护
- 用户流程设计

**负责项目**: `apps/admin-web/`, `apps/student-web/`, `apps/student-app/`

**工作目录**: 所有前端样式和组件文件

## 角色切换方法

### 方法一：使用命令文件

#### 通用角色命令
在对话中使用以下命令切换通用开发角色：
- `@frontend` - 前端开发者（管理端 + 学生端 Web）
- `@backend` - 后端开发者（API 服务 + 任务服务）
- `@app` - 移动端开发者（Flutter）
- `@architect` - 架构师
- `@fullstack` - 全栈开发者
- `@ui-designer` - UI 设计师

#### 应用专用命令
在对话中使用以下命令专注于特定应用开发：
- `@admin-web` - 管理端开发（React + Rsbuild + Ant Design）
- `@student-web` - 学生端 Web 开发（React + Rsbuild + shadcn/ui）
- `@student-app` - 学生端移动应用开发（Flutter + Riverpod + GoRouter）
- `@server` - 服务端单体应用（FastAPI + SQLAlchemy + LangGraph + Celery）

### 方法二：明确声明
在对话开始时明确说明：
```
我现在是前端开发者，请帮我...
我现在是后端开发者，请帮我...
我现在是移动端开发者，请帮我...
我现在是架构师，请帮我...
我现在是全栈开发者，请帮我实现一个完整功能...
我现在是 UI 设计师，请帮我...
```

### 方法三：通过文件上下文
打开相关文件后，AI 会自动识别上下文：
- 打开 `apps/admin-web/src/` 或 `apps/student-web/src/` 下的文件 → 前端开发模式
- 打开 `apps/student-app/lib/` 下的文件 → 移动端开发模式
- 打开 `apps/server/` 下的文件 → 后端开发模式
- 打开样式文件 → UI 设计模式
- 同时打开前后端文件 → 全栈开发模式
- 打开项目根目录配置文件 → 架构师模式

## 开发工作流

### 典型功能开发流程

#### 方式一：分角色协作（适合团队开发）

1. **需求分析** (UI 设计师 + 架构师)
   - 分析用户需求
   - 设计界面布局
   - 定义交互流程
   - 确定技术方案

2. **架构设计** (架构师)
   - 设计系统架构
   - 定义模块边界
   - 确定技术选型

3. **后端开发** (后端开发者)
   - 设计 API 接口
   - 实现数据模型
   - 编写业务逻辑
   - 添加数据验证

4. **前端/移动端开发** (前端/移动端开发者)
   - 实现 UI 组件
   - 集成后端 API
   - 实现状态管理
   - 优化用户体验

5. **测试和优化** (全角色协作)
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

4. **前端/移动端实现** (全栈开发者)
   - 实现 UI 组件
   - 集成后端 API
   - 状态管理和用户体验

5. **联调和测试** (全栈开发者)
   - 前后端联调
   - 完整功能测试
   - 性能优化

## 代码规范

详细的编码规范请参考 `.cursor/rules/` 目录下的规则文件：

- **React 前端规范**: `.cursor/rules/react-frontend/` - 适用于 `apps/admin-web/**` 和 `apps/student-web/**`
- **Python 后端规范**: `.cursor/rules/python-backend/` - 适用于 `apps/server/**`
- **Flutter 移动端规范**: `.cursor/rules/flutter-mobile/` - 适用于 `apps/student-app/**`
- **命名规范**: `.cursor/rules/naming-conventions/` - 适用于所有文件
- **API 设计规范**: `.cursor/rules/api-design/` - API 设计时自动应用
- **代码审查要点**: `.cursor/rules/code-review/` - 代码审查时自动应用

这些规则会根据文件类型自动应用，也可以在对话中使用 `@rule-name` 手动触发。

## 常用命令

### 前端开发
```bash
# 管理端
cd apps/admin-web && pnpm dev        # 启动开发服务器
cd apps/admin-web && pnpm build      # 构建生产版本
cd apps/admin-web && pnpm tsc        # 类型检查

# 学生端 Web
cd apps/student-web && pnpm dev      # 启动开发服务器
cd apps/student-web && pnpm build    # 构建生产版本
cd apps/student-web && pnpm type-check # 类型检查
```

### 移动端开发
```bash
cd apps/student-app
flutter pub get               # 安装依赖
./build.sh                   # 生成代码（json_serializable, freezed）
flutter run                  # 运行应用
flutter run -d android       # 运行 Android 应用
flutter run -d ios           # 运行 iOS 应用
flutter analyze              # 代码检查
flutter format .             # 格式化代码
flutter test                 # 运行测试
```

### 后端开发
```bash
cd apps/server
uv run main.py          # 开发启动（热重载）
uv run worker.py        # 启动 Celery Worker（异步任务）
# 或仅启动 API
uvicorn main:app --reload --port 7890
```

## 项目结构

```
ai-eduaction/
├── apps/
│   ├── admin-web/           # 管理端前端
│   │   └── src/
│   │       ├── pages/       # 页面组件
│   │       ├── components/  # 业务组件
│   │       ├── hooks/       # 自定义 Hooks
│   │       └── utils/       # 工具函数
│   ├── student-web/         # 学生端 Web
│   │   └── src/
│   │       ├── pages/       # 页面组件
│   │       ├── components/ # UI 组件
│   │       ├── stores/      # Zustand 状态
│   │       └── hooks/       # 自定义 Hooks
│   ├── student-app/         # 学生端移动应用
│   │   └── lib/
│   │       ├── screens/     # 功能模块（auth, home, practice, profile, textbook, wrong_records）
│   │       ├── core/        # 核心功能（api, models, theme, utils）
│   │       ├── shared/      # 共享组件和工具
│   │       └── app/         # 应用配置（路由等）
│   ├── server/              # 服务端（单体）
│   │   ├── admin/           # 管理端模块
│   │   │   ├── routes/      # 路由层（auth, manager, textbook, unit, knowledge, question, question_type, student, practice, config, prompt, teacher_book）
│   │   │   └── services/    # 服务层
│   │   ├── student/         # 学生端模块
│   │   │   ├── routes/      # 路由层（auth, profile, textbook, practice）
│   │   │   └── services/    # 服务层
│   │   ├── ai/              # AI 功能（LangGraph 工作流）
│   │   ├── shared/          # 共享模块
│   │   │   ├── core/        # 核心功能
│   │   │   ├── worker/      # 任务处理（Celery Worker）
│   │   │   └── utils/       # 工具函数
├── packages/
│   └── shared-web/          # Web 端共享包（类型、API 客户端、工具函数）
└── .cursor/
    ├── roles.md             # 角色切换指南
    └── commands/            # 命令文件
        ├── frontend.md      # 前端开发模式 (@frontend)
        ├── backend.md       # 后端开发模式 (@backend)
        ├── app.md           # 移动端开发模式 (@app)
        ├── ui-designer.md   # UI 设计师模式 (@ui-designer)
        ├── auth.md          # 安全审计与认证相关检查 (@auth)
        ├── cr.md            # 代码评审流程与检查清单 (@cr)
        ├── new-feature.md   # 新功能规划与拆分 (@new-feature)
        ├── pr.md            # 创建和编写 Pull Request (@pr)
        └── test-fix.md      # 运行测试并修复失败用例 (@test-fix)
```

## 规则系统

项目使用 Cursor 的新规则系统（`.cursor/rules`），规则会根据文件类型自动应用：

- **Always Apply**: 每个聊天会话都会应用（如 `project-overview`, `naming-conventions`）
- **Apply to Specific Files**: 编辑匹配的文件时自动应用（如 `react-frontend`, `python-backend`, `flutter-mobile`）
- **Apply Intelligently**: Agent 根据上下文判断是否需要应用（如 `api-design`, `code-review`）

查看所有规则：**Cursor Settings → Rules, Commands**

## 最佳实践

1. **一次对话一个角色**: 避免在同一对话中频繁切换角色（全栈开发者除外）
2. **明确上下文**: 切换角色时提供足够的上下文信息
3. **参考规则系统**: 详细的编码规范在 `.cursor/rules/` 目录下，会根据文件类型自动应用
4. **参考现有代码**: 利用项目中的现有代码作为参考
5. **保持一致性**: 遵循项目的代码风格和架构模式
6. **分阶段完成**: 先设计再实现，先后端再前端/移动端
7. **全栈开发**: 全栈开发者可以一次性完成前后端，但建议先完成后端再实现前端/移动端
8. **数据一致性**: 确保前后端/移动端数据模型和类型定义保持一致
9. **跨平台一致性**: 移动端应参考 Web 端（student-web）的实现逻辑，保持功能一致性
10. **代码生成**: Flutter 项目使用 json_serializable 和 freezed，修改模型后必须运行 `./build.sh`
11. **应用专用命令**: 使用 `@admin-web`, `@student-web`, `@student-app`, `@server` 命令可以更精确地专注于特定应用的开发
12. **架构决策**: 重大技术决策应由架构师参与，确保系统整体一致性

## 相关文档

- **规则系统**: `.cursor/rules/README.md` - 规则系统说明
- **快速参考**: `AGENTS.md` - 项目根目录的快速参考指南
- **项目规则**: `.cursor/rules/` - 详细的编码规范
