# 后端开发模式

我现在专注于**后端服务 (server/)** 的开发工作。

## 应用概述

后端服务是基于 FastAPI 的 Python 后端应用，为管理端、学生端和移动端提供 API 服务。

## 技术栈

- **框架**: FastAPI 0.115+
- **语言**: Python 3.12
- **数据库**: MySQL (通过 SQLAlchemy 2.0 异步 ORM)
- **缓存**: Redis
- **认证**: JWT (PyJWT)
- **验证**: Pydantic
- **日志**: Loguru
- **AI 平台**: 阿里云百炼AI (DashScope SDK)
- **对象存储**: 阿里云 OSS
- **异步运行时**: Uvicorn

## 工作目录

- `apps/server/` - 后端源代码
  - `admin/` - 管理端 API
    - `routes/` - 路由层（API 端点）
    - `services/` - 业务逻辑层
    - `schema.py` - 请求/响应模型
  - `student/` - 学生端 API
    - `routes/` - 路由层
    - `services/` - 业务逻辑层
    - `schema.py` - 数据模型
  - `core/` - 核心模块
    - `database.py` - 数据库模型和配置
    - `settings.py` - 环境配置
    - `middleware.py` - 中间件
    - `exception.py` - 异常处理
  - `shared/` - 共享模块
    - `services/` - 共享服务
    - `utils/` - 工具函数

## 项目结构

```
apps/server/
├── admin/                  # 管理端 API
│   ├── routes/            # 路由层（API 端点）
│   ├── services/          # 业务逻辑层
│   └── schema.py          # 请求/响应模型
├── student/               # 学生端 API
│   ├── routes/            # 路由层
│   ├── services/          # 业务逻辑层
│   └── schema.py          # 数据模型
├── core/                  # 核心模块
│   ├── database.py        # 数据库模型和配置
│   ├── settings.py        # 环境配置
│   ├── middleware.py      # 中间件
│   └── exception.py       # 异常处理
└── shared/                # 共享模块
    ├── services/          # 共享服务
    └── utils/             # 工具函数
```

## 开发原则

1. **分层架构**: 路由层 → 服务层 → 数据层
2. **异步优先**: 使用 `async/await` 处理异步操作
3. **类型安全**: 使用 Pydantic 进行数据验证
4. **错误处理**: 统一的异常处理机制
5. **安全性**: 认证、授权、数据验证
6. **性能**: 数据库查询优化、缓存策略
7. **代码规范**: 遵循 PEP 8 Python 代码规范

## 常用模式

### 路由定义
```python
# apps/server/admin/routes/some.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from admin.schema import SomeSchema, SomeResponse
from admin.services import some_service

router = APIRouter(prefix="/api/admin/some", tags=["Some"])

@router.post("/create", response_model=SomeResponse)
async def create_something(
    params: SomeSchema,
    db: AsyncSession = Depends(get_db)
):
    return await some_service.create(db, params)
```

### 服务层
```python
# apps/server/admin/services/some.py
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
# apps/server/core/database.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String
from core.database import BaseModel

class SomeModel(BaseModel):
    __tablename__ = "ah_some"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # ...
```

### Pydantic Schema
```python
# apps/server/admin/schema.py
from pydantic import BaseModel

class SomeSchema(BaseModel):
    name: str
    description: str | None = None

class SomeResponse(BaseModel):
    id: int
    name: str
    description: str | None
```

### 认证中间件
```python
# 已在 admin/services/auth.py 和 student/services/auth.py 中实现
# 使用 admin_route_filter 和 student_router_filter
from admin.services.auth import admin_route_filter

@router.get("/protected")
async def protected_route(
    current_user = Depends(admin_route_filter)
):
    return {"user": current_user}
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

result = await db.scalar(select(SomeModel).where(SomeModel.id == id))
results = await db.scalars(select(SomeModel).where(SomeModel.status == 1))
```

### 创建
```python
instance = SomeModel(**data)
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
- 区分管理端和学生端 API 的权限和业务逻辑

## 相关资源

- 管理端 API: `apps/server/admin/`
- 学生端 API: `apps/server/student/`
- FastAPI 文档: https://fastapi.tiangolo.com/
- SQLAlchemy 文档: https://docs.sqlalchemy.org/

