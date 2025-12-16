# CLINE_AGENTS.md

这是 Cline 的快速参考指南。详细规范请参考 `CLINE.md` 和 `.cursor/rules/` 目录。

## 项目概述

K12 教育辅导工具的 Monorepo 项目，使用 pnpm workspace 和 Turborepo 管理。

## 技术栈

- **前端**: React 18 + TypeScript 5 + Rsbuild
  - admin-web: Ant Design 5 + ahooks
  - student-web: shadcn/ui + Zustand
- **后端**: Python 3.12 + FastAPI + SQLAlchemy 2.0
- **移动端**: Flutter 3.0+ + Dart 3.8+ + Riverpod

## 快速命令

```bash
# 前端开发
pnpm dev:admin        # 管理端
pnpm dev:student      # 学生端 Web

# 后端开发
pnpm dev:server       # 启动服务端

# 移动端开发
cd apps/student-app
./build.sh            # 生成代码（必须！）
flutter run           # 运行应用
```

## 核心原则

1. **类型安全**: 所有代码必须使用类型系统
2. **错误处理**: 所有 API 调用和异步操作必须有错误处理
3. **分层架构**: 路由层 → 服务层 → 数据层
4. **跨平台一致性**: 移动端参考 Web 端实现逻辑

## 编码规范

### 前端页面结构
```
pages/[Feature]/[PageName]/
├── index.tsx          # 页面入口
├── models/PageModel.ts
├── views/Main.tsx
├── hooks/use[PageName]Hook.ts
└── components/
```

### 后端路由结构
```python
# routes/[resource].py
router = APIRouter(prefix="/resource")
@router.post("/")
async def create(params: Schema, db: AsyncSession = Database):
    return await service.create(db, params)
```

### Flutter 代码生成
修改模型后必须运行：`./build.sh`

## 详细规范

查看 `.cursor/rules/` 目录获取详细的编码规范：
- `project-overview/` - 项目概述
- `react-frontend/` - React 前端规范
- `python-backend/` - Python 后端规范
- `flutter-mobile/` - Flutter 移动端规范
- `naming-conventions/` - 命名规范
- `api-design/` - API 设计规范
- `code-review/` - 代码审查要点

## 角色切换

Cline 应该根据当前文件上下文自动切换开发角色：

### 全局角色
- **@frontend** - 前端开发（admin-web + student-web）
- **@backend** - 后端开发（server）
- **@app** - 移动端开发（student-app）
- **@architect** - 系统架构
- **@fullstack** - 全栈开发
- **@ui-designer** - UI/UX 设计

### 应用特定角色
- **@admin-web** - 管理端开发
- **@student-web** - 学生端 Web 开发
- **@student-app** - 移动应用开发
- **@server** - 服务端开发

## 上下文感知开发

Cline 应该根据文件路径自动应用相应的开发规范：

### 前端上下文 (`apps/admin-web/` 和 `apps/student-web/`)
- 应用 React 前端编码规范
- 使用 TypeScript 类型系统
- 遵循组件化和状态管理模式
- admin-web 使用 Ant Design + ahooks
- student-web 使用 shadcn/ui + Zustand

### 后端上下文 (`apps/server/`)
- 应用 Python/FastAPI 编码规范
- 使用异步编程模式
- 遵循分层架构：路由 → 服务 → 数据
- 使用 Pydantic 进行数据验证
- 使用 SQLAlchemy 2.0 异步 ORM

### 移动端上下文 (`apps/student-app/`)
- 应用 Flutter/Dart 编码规范
- 使用 Riverpod 状态管理
- 使用 GoRouter 路由
- 注意代码生成要求（修改模型后运行 `./build.sh`）
- 保持与 Web 端的功能一致性

## 文件模式匹配

Cline 应该根据文件扩展名和路径应用相应规则：

### 始终应用的规则
- 项目概述和架构原则
- 命名规范和文件组织
- 代码审查要点

### 文件特定规则
- **.tsx/.ts 文件**: React 前端规范
- **.py 文件**: Python 后端规范  
- **.dart 文件**: Flutter 移动端规范
- **routes/** 文件: API 设计规范
- **修改操作**: 代码审查规范

## 开发模式识别

Cline 应该识别并强制执行以下模式：

### 前端页面模式
```
pages/[Feature]/[PageName]/
├── index.tsx                    # 页面入口
├── models/PageModel.ts         # 页面级状态管理
├── views/Main.tsx              # 主视图组件
├── hooks/use[PageName]Hook.ts  # 业务逻辑 Hook
└── components/                 # 子组件
```

### 后端路由模式
```
routes/[resource].py            # 路由定义
services/[resource].py          # 服务实现
schema.py                      # 数据模型
```

### 移动端屏幕模式
```
screens/[feature]/
├── data/                      # 数据层
├── presentation/              # UI 层
└── providers/                 # 状态管理
```

## API 设计模式
- RESTful 路由设计
- Pydantic Schema 验证
- 统一错误处理
- JWT 认证机制

## 质量检查清单

在完成任务前，Cline 应该验证：

- [ ] 类型安全性（TypeScript/Python Type Hints/Dart）
- [ ] 异步操作的错误处理
- [ ] 命名规范的一致性
- [ ] 分层架构的遵循
- [ ] API 响应的 Schema 验证
- [ ] Flutter 代码生成（如适用）
- [ ] 跨平台一致性（如适用）
- [ ] 环境变量使用（非硬编码）

## 工具使用指南

使用 Cline 工具时，遵循以下指南：

1. **文件操作**: 尊重现有目录结构和命名规范
2. **代码生成**: Flutter 更改后，模型修改后运行 `./build.sh`
3. **API 更改**: 确保路由和服务层一致更新
4. **前端更改**: 遵循页面结构（models, views, hooks, components）
5. **数据库更改**: 更新模型和 Schema，必要时提供迁移脚本
6. **测试**: 完成前运行适当的组件测试

## 常见问题解决

- 依赖缺失: `pnpm install:all`
- Python 依赖缺失: `cd apps/server && uv sync`
- Flutter 依赖缺失: `cd apps/student-app && flutter pub get`
- 构建失败: `pnpm clean && pnpm build`
- Flutter 问题: `cd apps/student-app && flutter clean && flutter pub get && ./build.sh`
- 后端问题: 检查数据库和 Redis 运行状态
- 移动端开发: 启动应用前运行代码生成

## Cline 特定指南

### 上下文感知规则应用

Cline 应该根据文件上下文智能应用规则：

1. **检测文件路径**确定当前应用类型
2. **分析文件类型**选择相应编码规范
3. **识别操作模式**应用相应的设计模式
4. **检查依赖关系**确保修改的完整性

### 自动化质量检查

Cline 应该在代码修改时自动检查：

- 导入顺序是否符合规范
- 命名约定是否一致
- 错误处理是否完整
- 类型定义是否明确
- 架构层次是否正确

### 智能提示和建议

基于上下文提供智能建议：

- 前端组件的 Hook 模式
- 后端服务层的异步处理
- 移动端的 Riverpod Provider 模式
- API 设计的最佳实践
- 性能优化建议

## 相关资源

- 详细规范: `.cursor/rules/` 目录
- 项目配置: `CLINE.md`
- API 文档: `docs/API.md`
- 数据库: `infra/mysql/00-init.sql`
- 构建配置: `turbo.json`, `pnpm-workspace.yaml`
