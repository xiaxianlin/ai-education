# 后端开发模式

我现在是**后端开发者**，专注于服务端应用开发。

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

- `apps/server-api/` - API 服务源代码
  - `admin/` - 管理端 API
  - `student/` - 学生端 API
  - `core/` - 核心模块（数据库、配置、中间件）
  - `shared/` - 共享模块（工具、服务）
- `apps/server-task/` - 任务服务源代码
  - `routes/` - 路由层
  - `services/` - 业务逻辑层
  - `workers/` - 任务工作器

## 项目结构

### API 服务 (server-api)
```
apps/server-api/
├── admin/
│   ├── routes/        # 路由层（API 端点）
│   ├── services/      # 业务逻辑层
│   └── schema.py      # 请求/响应模型
├── student/
│   ├── routes/        # 路由层
│   ├── services/      # 业务逻辑层
│   └── schema.py      # 数据模型
├── core/
│   ├── database.py    # 数据库模型和配置
│   ├── settings.py    # 环境配置
│   ├── middleware.py  # 中间件
│   └── exception.py   # 异常处理
└── shared/
    ├── services/      # 共享服务
    └── utils/         # 工具函数
```

### 任务服务 (server-task)
```
apps/server-task/
├── routes/            # 路由层
├── services/          # 业务逻辑层
├── workers/           # 任务工作器
└── core/              # 核心模块
```

## 开发原则

1. **分层架构**: 路由层 → 服务层 → 数据层
2. **异步优先**: 使用 `async/await` 处理异步操作
3. **类型安全**: 使用 Pydantic 进行数据验证
4. **错误处理**: 统一的异常处理机制
5. **安全性**: 认证、授权、数据验证
6. **性能**: 数据库查询优化、缓存策略

## 常用模式

### 路由定义 (server-api)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Database
from admin.schema import SomeSchema
from admin.services import some_service

router = APIRouter(prefix="/api/admin/some", tags=["Some"])

@router.post("/create")
async def create_something(
    params: SomeSchema,
    db: AsyncSession = Database
):
    return await some_service.create(db, params)
```

### 任务服务路由 (server-task)
```python
from fastapi import APIRouter
from services.task_manager import TaskManager

router = APIRouter(prefix="/api/task", tags=["Task"])

@router.post("/submit")
async def submit_task(task_data: dict):
    task_id = await TaskManager.submit_task(task_data)
    return {"task_id": task_id, "status": "submitted"}
```

### 服务层
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import SomeModel
from admin.schema import SomeSchema

async def create(db: AsyncSession, params: SomeSchema):
    # 业务逻辑
    instance = SomeModel(**params.model_dump())
    db.add(instance)
    await db.commit()
    await db.refresh(instance)
    return instance
```

### 数据模型
```python
from sqlalchemy.orm import Mapped, mapped_column
from core.database import BaseModel

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

## API 设计规范

### RESTful 规范
- `GET /resource` - 列表查询
- `GET /resource/{id}` - 详情查询
- `POST /resource` - 创建
- `PUT /resource/{id}` - 更新
- `DELETE /resource/{id}` - 删除

### 响应格式
```python
from core.schema import ResponseSchema

return ResponseSchema(data=result)
# 自动包装为: {"status": 0, "message": "success", "data": result}
```

### 错误处理
```python
from fastapi import HTTPException

raise HTTPException(status_code=400, detail="错误信息")
```

## 数据库操作

### 查询
```python
from sqlalchemy import select

result = await db.scalar(select(Model).where(Model.id == id))
results = await db.scalars(select(Model).where(Model.status == 1))
```

### 创建
```python
instance = Model(**data)
db.add(instance)
await db.commit()
await db.refresh(instance)
```

### 更新
```python
instance.name = "new name"
await db.commit()
await db.refresh(instance)
```

### 删除
```python
await db.delete(instance)
await db.commit()
```

## 注意事项

- 使用异步 SQLAlchemy 操作
- 所有数据库操作都要 commit
- 使用 Pydantic 验证输入数据
- 遵循项目的错误处理模式
- 使用 Loguru 记录日志
- 考虑使用 Redis 缓存
- 实现适当的权限检查
- 遵循 RESTful API 设计规范

