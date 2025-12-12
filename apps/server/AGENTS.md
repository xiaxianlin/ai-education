# 服务端 - Agent 配置

## 应用概述
基于 FastAPI 的单体应用，包含管理端、学生端、AI 功能、任务处理等核心模块。

## 技术栈
- **框架**: FastAPI 0.115+
- **语言**: Python 3.12
- **数据库**: MySQL (SQLAlchemy 2.0 异步 ORM)
- **缓存/队列**: Redis + Celery
- **AI**: LangChain + LangGraph + 阿里云百炼AI (DashScope SDK)
- **存储**: 阿里云 OSS
- **认证**: JWT (PyJWT)
- **日志**: Loguru
- **包管理**: uv

## 架构设计

### 分层架构
```
路由层 (routes/) 
  ↓
服务层 (services/)
  ↓
数据层 (database.py)
```

### 模块划分
1. **admin/** - 管理端模块
   - 路由: `admin/routes/`
   - 服务: `admin/services/`
   - 模型: `admin/schema.py`

2. **student/** - 学生端模块
   - 路由: `student/routes/`
   - 服务: `student/services/`
   - 模型: `student/schema.py`

3. **ai/** - AI 功能模块
   - 题目生成: `ai/question_generate/` (LangGraph 工作流)
   - 答题分析: `ai/question/answer.py`
   - 资源生成: `ai/question/resource.py`

4. **shared/** - 共享模块
   - 核心: `shared/core/` (数据库、配置、日志等)
   - 任务: `shared/worker/` (Celery Worker)
   - 工具: `shared/utils/`

## 开发规范

### Python 编码规范
1. 遵循 PEP 8 代码风格
2. 使用类型提示 (Type Hints)
3. 使用异步编程 (async/await)
4. 使用 Pydantic 进行数据验证

### API 设计规范
1. 遵循 RESTful API 设计原则
2. 使用 Pydantic Schema 进行请求/响应验证
3. 使用 FastAPI 的依赖注入系统
4. 统一的错误处理机制

### 路由定义示例
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import Database
from admin.schema import SomeSchema
from admin.services import some_service

router = APIRouter(prefix="/some", tags=["Some"])

@router.post("/create")
async def create_something(
    params: SomeSchema,
    db: AsyncSession = Depends(Database.get_session)
):
    return await some_service.create(db, params)
```

### 服务层示例
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from shared.core.database import SomeModel

async def create(db: AsyncSession, params: SomeSchema):
    instance = SomeModel(**params.model_dump())
    db.add(instance)
    await db.commit()
    await db.refresh(instance)
    return instance
```

### 任务队列
- 长时间任务使用 Celery 异步处理
- 任务提交: `shared.worker.celery.submit_task()`
- 任务执行: `shared.worker.executor.execute_*_task()`

### AI 工作流
- 使用 LangGraph 构建题目生成工作流
- 工作流定义: `ai/question_generate/graph.py`
- Prompt 模板: `ai/question_generate/prompts/`

## 注意事项

1. **异步优先**: 所有数据库操作使用异步 SQLAlchemy
2. **类型安全**: 使用 Pydantic 和类型提示
3. **错误处理**: 使用统一的异常处理机制
4. **日志记录**: 使用 Loguru 记录关键操作
5. **安全性**: 实现适当的认证和授权
6. **性能**: 使用缓存、查询优化、连接池

## 相关资源

- 数据库模型: `shared/core/database.py`
- 环境配置: `shared/core/settings.py`
- 任务配置: `shared/worker/CONFIG.md`
- FastAPI 文档: https://fastapi.tiangolo.com/
