# AI 教育辅导平台 - Agent 指令

K12 教育辅导工具的 Monorepo 项目，使用 pnpm workspace + Turborepo 管理。

## 技术栈

- **前端**: React 18 + TypeScript 5 + Rsbuild
  - admin-web: Ant Design 5 + Ant Design Pro + unstated-next + ahooks
  - student-web: shadcn/ui + unstated-next + ahooks
  - 共享包: `@ai-education/shared-web` (API 客户端、类型定义、工具函数)
- **后端**: Python 3.12 + FastAPI + SQLAlchemy 2.0 (强制使用 2.0 ORM 风格)
  - AI 工作流: LangChain + LangGraph
  - 任务队列: Celery + Redis

## 快速命令

```bash
# 开发
pnpm dev:admin        # 管理端
pnpm dev:student      # 学生端 Web
pnpm dev:server       # 启动服务端 (FastAPI @ 7890)
pnpm dev:all         # 同时启动所有服务

# 构建
pnpm build:admin      # 管理端构建
pnpm build:student    # 学生端构建
pnpm build:server     # 后端构建

# 测试与类型检查
pnpm test            # 运行所有测试 (via turbo)
pnpm lint            # 运行 lint (via turbo)
pnpm format          # Prettier 格式化

# 单个测试运行
# Python: pytest apps/server/tests/unit/test_file.py::TestClassName::test_method
# TypeScript: cd apps/admin-web && jest -- tests/path/to/test.tsx
```

## 核心原则

1. **类型安全**: 所有代码必须使用类型系统（TypeScript/Python Type Hints）
2. **错误处理**: 所有 API 调用和异步操作必须有错误处理
3. **分层架构**: 后端路由层 → 服务层 → 数据层
4. **UI 和逻辑分离**:
   - 视图组件只负责 UI 渲染，不包含复杂业务逻辑
   - 工具函数和常量提取到 `utils.tsx` 文件
   - 可复用逻辑提取为独立的 Hooks
   - 业务逻辑与 UI 完全分离

## 代码风格指南

### Python (FastAPI)

- **代码风格**: PEP 8, 使用类型提示 (Type Hints)
- **导入顺序**: 标准库 → 第三方库 → 本地模块（禁止在函数内导入）
- **命名**: `snake_case` (变量/函数), `PascalCase` (类), `UPPER_SNAKE_CASE` (常量)
- **数据库**: SQLAlchemy 2.0 异步 ORM，使用 `AsyncSession` + `select()` (禁止 `session.query()`)
- **错误处理**: 使用 `ValueError` 抛出业务错误，由全局异常处理器统一处理
- **日志**: 使用 Loguru，异常消息含花括号时用 `log_error()` 函数自动转义

### TypeScript (React)

- **代码风格**: ESLint + Prettier, 函数式组件 + Hooks
- **导入顺序**: React → 第三方库 → 业务组件 → UI 组件 → 类型定义 → 工具函数
- **命名**: `camelCase` (变量/函数), `PascalCase` (组件/类型), `UPPER_SNAKE_CASE` (常量)
- **状态管理**: `unstated-next` (页面/全局状态) + `ahooks` (异步操作)
- **Tailwind**: 禁止使用 `cn` 封装和三元运算符链式判断，必须使用状态映射函数

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
# route.py (单数形式)
router = APIRouter(prefix="/resource")
@router.post("/")
async def create(params: Schema, db: AsyncSession = Database):
    return await service.create(db, params)
```

## API 调用规范

- **后端返回格式**: `{ status: 0, message: "ok", data: T }`
- **前端 ApiClient**: 自动提取 `response.data.data`，错误时抛出异常
- **GET 请求参数**: 直接传递对象，不要嵌套在 `params` 字段中
  ```typescript
  apiClient.get("/ability/atomics", { subject, grade }); // ✅
  apiClient.get("/ability/atomics", { params: { subject, grade } }); // ❌
  ```
- **Token**: 存储在 `localStorage['_token_']`，请求自动携带 `x-access-token` 头

## 重要提醒

1. **SQLAlchemy 2.0**: 强制使用 2.0 异步 ORM 风格，详见 `.cursor/rules/python-backend/sqlalchemy-2.0.md`
2. **Tailwind 样式**: 严格使用状态映射函数，禁止 `cn` 封装和三元运算符链
3. **LangGraph 工作流**: 复杂业务逻辑使用 LangGraph，状态字段用 `TypedDict` 定义
4. **可选链访问**: 访问嵌套对象属性时使用完整可选链 `obj?.prop?.subProp`
5. **状态检查顺序**: 判断练习会话等复合状态时，先检查 `generate_status` 再检查 `status`

## 详细规范

查看 `.cursor/rules/` 目录获取详细的编码规范：

- `project-overview/` - 项目概述
- `react-frontend/` - React 前端规范
- `python-backend/` - Python 后端规范（含 SQLAlchemy 2.0 规范）
- `naming-conventions/` - 命名规范
- `api-design/` - API 设计规范
- `code-review/` - 代码审查要点
- `tailwind/` - Tailwind CSS 样式规范
- `cursor-rules-update/` - 更新 Cursor 规则的工作流程
