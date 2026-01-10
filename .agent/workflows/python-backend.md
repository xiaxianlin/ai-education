---
description: Python/FastAPI 后端编码规范，包含路由、服务层、数据库操作和错误处理
---

# Python/FastAPI 后端编码规范

## 代码风格

- 遵循 PEP 8 代码风格
- 使用类型提示 (Type Hints)
- 使用 FastAPI 的依赖注入系统
- API 路由使用 Pydantic 进行数据验证
- 使用异步编程 (async/await)

### 导入规范

- **所有导入必须在文件头部**：禁止在函数内部或代码中间进行导入
- 导入顺序：标准库 → 第三方库 → 项目内部模块
- 使用绝对导入，避免相对导入

```python
# ✅ 正确：所有导入在文件头部
import asyncio
from typing import Any, Dict, List

from langgraph.graph import END, StateGraph
from loguru import logger

from shared.core.database import Question, QuestionType
from .service import build_question_generation_prompt

# ❌ 错误：在函数内部导入
async def some_function():
    import asyncio  # 禁止
```

### 函数定义规范

- **避免在函数内定义函数**：将内部函数提取到模块级别
- 如果必须使用闭包，确保有充分的理由

## 分层架构

遵循项目的分层架构：**路由层 → 服务层 → 数据层**

### 路由层 (routes/)

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import Database
from admin.schema import CreateUnitSchema
from admin.services import unit

router = APIRouter(prefix="/unit")

@router.post("/")
async def create_unit(
    params: CreateUnitSchema,
    db: AsyncSession = Database
):
    """创建课程单元"""
    return await unit.create_unit(db, params)
```

**路由文件命名规范**：

- 路由文件统一命名为 `route.py`（单数形式）
- 路由前缀使用复数形式（如 `/unit`, `/question`）

### 服务层 (services/)

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from shared.core.database import SomeModel

async def create(db: AsyncSession, params: SomeSchema):
    """创建资源"""
    instance = SomeModel(**params.model_dump())
    db.add(instance)
    await db.commit()
    await db.refresh(instance)
    return instance
```

## SQLAlchemy 2.0 ORM 规范

**强制要求**: 所有 SQLAlchemy 代码必须使用 2.0 版本 ORM 风格。

### 模型定义

```python
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

class Student(Base):
    __tablename__ = "ah_student"

    # 使用 Mapped 类型注解
    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # 可选字段
    token: Mapped[str | None] = mapped_column(String(255), nullable=True)
```

### 查询操作

```python
from sqlalchemy import select

# ✅ 正确：使用 select()
student = await db.scalar(
    select(Student).where(Student.id == student_id)
)

# ❌ 错误：使用旧式 query()（禁止）
student = await db.query(Student).filter(Student.id == student_id).first()
```

### 关联查询

```python
from sqlalchemy.orm import selectinload, joinedload

# 一对多关系：使用 selectinload
student = await db.scalar(
    select(Student)
    .options(selectinload(Student.textbooks))
    .where(Student.id == student_id)
)

# 多对一关系：使用 joinedload
question = await db.scalar(
    select(Question)
    .options(joinedload(Question.question_type))
    .where(Question.id == question_id)
)
```

## 错误处理

- 业务错误使用 `ValueError` 抛出
- HTTP 错误使用 `HTTPException`
- 所有错误都会被全局异常处理器捕获

```python
if not resource:
    raise ValueError("资源不存在")
```

## 日志记录

```python
from shared.core.logger import log_error
from loguru import logger

# ✅ 推荐：使用 log_error 函数（自动转义花括号）
log_error("创建单元失败", exc=e, unit_id=unit.id)

# ✅ 简单场景
logger.info("创建单元", unit_id=unit.id)
```

## LangGraph 工作流规范

复杂业务逻辑使用 LangGraph 构建工作流：

```python
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph

# 1. 定义状态 Schema
class WorkflowState(TypedDict, total=False):
    db: AsyncSession
    input_data: str
    result: NotRequired[Any]

# 2. 定义节点函数
async def entry_node(state: WorkflowState) -> Dict[str, Any]:
    if state.get("db") is None:
        raise ValueError("数据库会话不能为空")
    return {}

# 3. 创建并编译图
def create_workflow_graph() -> CompiledStateGraph:
    workflow = StateGraph(WorkflowState)
    workflow.add_node("entry", entry_node)
    workflow.set_entry_point("entry")
    workflow.add_edge("entry", END)
    return workflow.compile()

workflow_graph = create_workflow_graph()
```

## 任务队列

长时间任务使用 Celery 异步处理：

```python
from shared.worker import submit_task, Executor

task_id = submit_task(
    task_id="practice_abc123",
    executor=Executor.generate_practice_task,
    args=[payload.model_dump()]
)
```
