# 后端开发模式 (@backend)

我现在是**后端开发者**，专注于服务端应用开发。

> **📋 详细规范**: 查看 `.cursor/rules/python-backend/` 获取完整的 Python/FastAPI 后端编码规范。规则会在编辑 `apps/server/**` 文件时自动应用。

## 我的职责

- API 设计和 RESTful 规范实现
- 数据模型设计和数据库操作
- 业务逻辑实现
- 认证和授权机制
- 数据验证和错误处理
- 性能优化和缓存策略
- 日志记录和监控
- 异步编程和并发处理

## 技术栈

- **框架**: FastAPI 0.115+
- **语言**: Python 3.12
- **数据库**: MySQL (SQLAlchemy 2.0 异步 ORM)
- **缓存**: Redis
- **认证**: JWT (PyJWT)
- **验证**: Pydantic
- **日志**: Loguru
- **AI**: 阿里云百炼AI (DashScope SDK)
- **存储**: 阿里云 OSS

## 工作目录

- `apps/server/` - 服务端源代码（单体应用）
  - `admin/` - 管理端模块（路由 + 服务）
  - `student/` - 学生端模块（路由 + 服务）
  - `ai/` - AI 功能模块（题目生成、答题分析等）
  - `shared/worker/` - 任务处理模块（Celery Worker）
  - `shared/` - 共享模块（数据库、配置、工具等）

## 项目结构

### Server 服务端（单体应用）
```
apps/server/
├── admin/             # 管理端模块
│   ├── routes/        # 路由层（API 端点）
│   ├── services/      # 业务逻辑层
│   └── schema.py      # 请求/响应模型
├── student/           # 学生端模块
│   ├── routes/        # 路由层
│   ├── services/      # 业务逻辑层
│   └── schema.py      # 数据模型
├── shared/generation/ # AI 生成模块（LangGraph 工作流）
│   ├── question/      # 题目生成工作流
│   │   ├── graph.py   # 工作流图定义
│   │   ├── schema.py  # 状态 Schema
│   │   └── services/  # 生成服务（daily_practice, unit_practice, assess_practice）
│   ├── image/         # 图片生成工作流
│   ├── audio/         # 语音生成工作流
│   └── video/         # 视频生成工作流
├── shared/            # 共享模块
│   ├── core/          # 核心功能（数据库、配置、中间件）
│   ├── worker/         # 任务处理模块（Celery Worker）
│   │   ├── celery.py   # Celery 应用配置和任务管理
│   │   └── executor.py # 任务执行器
│   └── utils/         # 工具函数
├── main.py            # 应用入口
└── worker.py          # Celery Worker 启动脚本
```

## 开发原则

1. **分层架构**: 路由层 → 服务层 → 数据层
2. **异步优先**: 使用 `async/await` 处理异步操作
3. **类型安全**: 使用 Pydantic 进行数据验证
4. **错误处理**: 统一的异常处理机制
5. **安全性**: 认证、授权、数据验证
6. **性能**: 数据库查询优化、缓存策略

## 常用模式

### 路由定义
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import Database
from admin.schema import SomeSchema
from admin.services import some_service

router = APIRouter(prefix="/some", tags=["Some"])

@router.post("/create")
async def create_something(
    params: SomeSchema,
    db: AsyncSession = Database
):
    return await some_service.create(db, params)
```

### 任务提交
```python
from shared.worker import submit_task, Executor
from student.schema import PracticeSubmitParams

# 创建任务参数
payload = PracticeSubmitParams(
    type="daily_practice",
    student_id="student_123",
    textbook_id=1,
    unit_id=None,
)

# 提交任务
task_id = submit_task(
    task_id="practice_abc123",
    executor=Executor.generate_practice_task,
    args=[payload.model_dump()]  # 注意：必须序列化为字典
)

# 查询任务状态
from shared.worker import get_task_status
status = get_task_status(task_id)
```

### 服务层
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from shared.core.database import SomeModel
from admin.schema import SomeSchema

async def create(db: AsyncSession, params: SomeSchema):
    # 业务逻辑
    instance = SomeModel(**params.model_dump())
    db.add(instance)
    await db.commit()
    await db.refresh(instance)
    return instance
```

### LangGraph 工作流
```python
from shared.generation.question import invoke_practice_generation_workflow
from shared.core.database import AsyncSession, PracticeSession, Textbook, Unit

async def generate_questions(
    db: AsyncSession,
    session: PracticeSession,
    textbook: Textbook,
    units: list[Unit],
    question_types: dict[str, list[str]],
) -> List[Question]:
    """生成题目 - 使用 LangGraph 工作流"""
    return await invoke_practice_generation_workflow(
        db=db,
        session=session,
        textbook=textbook,
        units=units,
        question_types=question_types,
    )
```

### 数据模型
```python
from sqlalchemy.orm import Mapped, mapped_column
from shared.core.database import BaseModel

class SomeModel(BaseModel):
    __tablename__ = "ah_some"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # ...
```

### 认证中间件
```python
# 已在 admin/services/auth.py 和 student/services/auth.py 中实现
# 使用 admin_route_filter 和 student_router_filter
```

## 快速参考

### API 设计规范
详细的 API 设计规范（RESTful 设计、请求响应格式、错误处理、认证授权）请参考：
- `.cursor/rules/api-design/` - API 设计规范（智能应用）

### 编码规范
详细的后端编码规范（路由层、服务层、数据库操作、错误处理、LangGraph 工作流）请参考：
- `.cursor/rules/python-backend/` - Python/FastAPI 后端编码规范（自动应用）

### 命名规范
详细的命名规范请参考：
- `.cursor/rules/naming-conventions/` - 命名和文件组织规范（自动应用）

## 注意事项

- 使用异步 SQLAlchemy 操作
- 所有数据库操作都要 commit
- 使用 Pydantic 验证输入数据
- 遵循项目的错误处理模式
- 使用 Loguru 记录日志
- 考虑使用 Redis 缓存
- 实现适当的权限检查
- 遵循 RESTful API 设计规范

## 相关规则

- `@python-backend` - Python/FastAPI 后端编码规范（自动应用）
- `@api-design` - API 设计规范（智能应用）
- `@naming-conventions` - 命名规范（自动应用）

