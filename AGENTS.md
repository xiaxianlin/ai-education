# AI 教育辅导平台 - Agent 指令

这是项目的快速参考指南。详细规范请查看 `.cursor/rules/` 目录。

## 项目概述

K12 教育辅导工具的 Monorepo 项目，使用 pnpm workspace 和 Turborepo 管理。

## 技术栈

- **前端**: React 18 + TypeScript 5 + Rsbuild
  - admin-web: Ant Design 5 + Ant Design Pro + unstated-next + ahooks
  - student-web: shadcn/ui + unstated-next + ahooks
  - 共享包: `@ai-education/shared-web` (API 客户端、类型定义、工具函数)
- **后端**: Python 3.12 + FastAPI + SQLAlchemy 2.0 (强制使用 2.0 ORM 风格)
  - AI 工作流: LangChain + LangGraph
  - 任务队列: Celery + Redis
- **移动端**: Flutter 3.0+ + Dart 3.8+ + Riverpod 3.0.3 + GoRouter 17.0

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

# Git 工作流
pnpm keep-all         # 自动提交并推送所有变更（keep all 后使用）
```

## 核心原则

1. **类型安全**: 所有代码必须使用类型系统
2. **错误处理**: 所有 API 调用和异步操作必须有错误处理
3. **分层架构**: 路由层 → 服务层 → 数据层
4. **跨平台一致性**: 移动端参考 Web 端实现逻辑
5. **UI 和逻辑分离**: 
   - 视图组件只负责 UI 渲染，不包含复杂业务逻辑
   - 工具函数和常量提取到 `utils.tsx` 文件
   - 可复用逻辑提取为独立的 Hooks
   - 业务逻辑与 UI 完全分离，提高可维护性和可测试性

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
# route.py (单数形式)
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
- `cursor-rules-update/` - 更新 Cursor 规则的工作流程说明

## 角色切换

使用 `@frontend`, `@backend`, `@app`, `@fullstack` 等命令切换开发角色。
详细说明请查看 `.cursor/roles.md`。
