---
description: "Python/FastAPI 后端编码规范，包含路由、服务层、数据库操作和错误处理"
globs:
  - "apps/server/**"
alwaysApply: false
---

# Python/FastAPI 后端编码规范

## 代码风格

- 遵循 PEP 8 代码风格
- 使用类型提示 (Type Hints)
- 使用 FastAPI 的依赖注入系统
- API 路由使用 Pydantic 进行数据验证
- 使用异步编程 (async/await)

## 分层架构

遵循项目的分层架构：**路由层 → 服务层 → 数据层**

### 路由层 (routes/)

路由定义标准模板：

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import Database
from admin.schema import CreateUnitSchema, UpdateUnitSchema
from admin.services import unit

router = APIRouter(prefix="/unit")

@router.post("/")
async def create_unit(
    params: CreateUnitSchema,
    db: AsyncSession = Database
):
    """创建课程单元"""
    return await unit.create_unit(db, params)

@router.patch("/{id}")
async def update_unit(
    id: int,
    unit_update: UpdateUnitSchema,
    db: AsyncSession = Database
):
    """更新课程单元"""
    await unit.update_unit(db, id, unit_update)
```

### 服务层 (services/)

服务层标准模板：

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from shared.core.database import SomeModel
from admin.schema import SomeSchema

async def create(db: AsyncSession, params: SomeSchema):
    """创建资源"""
    instance = SomeModel(**params.model_dump())
    db.add(instance)
    await db.commit()
    await db.refresh(instance)
    return instance

async def update(db: AsyncSession, id: int, update: UpdateSchema):
    """更新资源"""
    instance = await db.scalar(select(SomeModel).where(SomeModel.id == id))
    if not instance:
        raise ValueError("资源不存在")
    
    # 更新字段
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(instance, field, value)
    
    await db.commit()
    await db.refresh(instance)
    return instance
```

### 数据库操作

- 使用异步 SQLAlchemy (`AsyncSession`)
- 使用 `select` 进行查询
- 使用 `joinedload` 或 `noload` 优化关联查询
- 所有数据库操作必须使用 `async/await`

```python
from sqlalchemy import select
from sqlalchemy.orm import joinedload

# 基础查询
result = await db.scalar(select(Model).where(Model.id == id))

# 关联查询优化
result = await db.scalar(
    select(Model)
    .options(joinedload(Model.relation))
    .where(Model.id == id)
)
```

## 错误处理

- 使用统一的异常处理机制（`shared/core/exception.py`）
- 业务错误使用 `ValueError` 抛出
- HTTP 错误使用 `HTTPException`
- 所有错误都会被全局异常处理器捕获

```python
# 业务逻辑中
if not resource:
    raise ValueError("资源不存在")

# 路由层会自动转换为 HTTPException
```

## 数据验证

- 使用 Pydantic Schema 进行数据验证
- Schema 定义在 `schema.py` 文件中
- 请求和响应都使用 Schema 进行验证

```python
from pydantic import BaseModel

class CreateUnitSchema(BaseModel):
    name: str
    textbook_id: int
    order: int | None = None
```

## 日志记录

- 使用 Loguru 记录日志
- 在关键操作点记录日志
- 错误日志包含足够的上下文信息

```python
from loguru import logger

logger.info("创建单元", unit_id=unit.id, textbook_id=textbook_id)
logger.error("创建单元失败", error=str(e), unit_id=unit.id)
```

## 任务队列

长时间任务使用 Celery 异步处理：

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
```

## 认证和授权

- 管理端使用 `admin_route_filter` 中间件
- 学生端使用 `student_router_filter` 中间件
- 认证信息通过 `request.state` 传递

## FastAPI 应用架构

项目采用子应用挂载架构，使用 `app.mount()` 将管理端和学生端作为独立的 FastAPI 应用挂载到主应用：

```python
# main.py
from admin import admin_app
from student import student_app

app = FastAPI(lifespan=lifespan)
app.mount("/api/admin", admin_app)
app.mount("/api/student", student_app)
```

**架构说明**:
- 每个子应用（`admin_app`、`student_app`）是独立的 FastAPI 实例
- 子应用可以有自己的中间件、异常处理器、依赖注入等
- 子应用的 OpenAPI 文档独立生成，访问路径为 `/api/admin/docs` 和 `/api/student/docs`
- 根应用的 `/docs` 和 `/openapi.json` 不会包含子应用的路由（这是 FastAPI 的设计行为）

**优势**:
- 模块化设计，管理端和学生端完全隔离
- 独立的认证中间件和异常处理
- 便于未来拆分为微服务

## 注意事项

1. **异步优先**: 所有数据库操作使用异步 SQLAlchemy
2. **类型安全**: 使用 Pydantic 进行数据验证
3. **错误处理**: 统一的异常处理机制
4. **日志记录**: 使用 Loguru 记录日志
5. **任务队列**: 长时间任务使用 Celery 异步处理
6. **工作流**: 复杂业务逻辑使用 LangGraph 工作流
7. **API 文档**: 访问子应用的 `/docs` 路径查看 OpenAPI 文档，而非根路径
