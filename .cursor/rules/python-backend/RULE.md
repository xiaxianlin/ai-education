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

### 导入规范

- **所有导入必须在文件头部**：禁止在函数内部或代码中间进行导入
- 导入顺序：标准库 → 第三方库 → 项目内部模块
- 使用绝对导入，避免相对导入（除非在包内部）

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
    from loguru import logger  # 禁止
```

### 函数定义规范

- **避免在函数内定义函数**：将内部函数提取到模块级别，提高可读性和可复用性
- 如果必须使用闭包，确保有充分的理由（如回调函数、装饰器等）

```python
# ✅ 正确：函数定义在模块级别
async def process_item(item: Item) -> Result:
    """处理单个项目"""
    # 处理逻辑
    return result

async def process_items(items: List[Item]) -> List[Result]:
    """处理多个项目"""
    return await asyncio.gather(*[process_item(item) for item in items])

# ❌ 错误：在函数内部定义函数
async def process_items(items: List[Item]) -> List[Result]:
    """处理多个项目"""
    async def process_item(item: Item):  # 禁止
        # 处理逻辑
        return result
    
    return await asyncio.gather(*[process_item(item) for item in items])
```

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

**路由文件命名规范**：
- 路由文件统一命名为 `route.py`（单数形式）
- 路由前缀使用复数形式（如 `/unit`, `/question`, `/prompt`）
- 每个模块的路由文件位于 `admin/[module]/route.py`

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

**重要**: 所有 SQLAlchemy 代码必须严格遵循 2.0 版本 ORM 风格，详细规范请参考 [SQLAlchemy 2.0 ORM 风格规范](./sqlalchemy-2.0.md)

**数据库模型位置**: `apps/server/shared/core/database/` 目录
- `base.py`: 数据库连接和基类
- `auth.py`: 认证相关模型（Manager）
- `textbook.py`: 教材相关模型（Textbook, Unit, Knowledge, TeacherBook）
- `practice.py`: 练习相关模型（Practice, PracticeSession, PracticeSessionAnswer, PracticeSessionReport）
- `student.py`: 学生相关模型（Student, StudentSubjectVersion, StudentPractice）
- `question.py`: 题目相关模型（QuestionType, Question）
- `ability.py`: 能力相关模型（AbilityDomain, AbilityAtomic）

**核心要求**：
- 使用异步 SQLAlchemy (`AsyncSession`)
- 使用 `select` 进行查询（禁止使用 `session.query()`）
- 使用 `Mapped[Type]` 类型注解和 `mapped_column()` 定义模型字段
- 使用 `joinedload` / `selectinload` / `noload` 优化关联查询
- 所有数据库操作必须使用 `async/await`
- 模型导入统一从 `shared.core.database` 导入

```python
from sqlalchemy import select
from sqlalchemy.orm import Mapped, mapped_column, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from shared.core.database import Base, Student, Database

# 模型定义（2.0 风格）
class Model(Base):
    __tablename__ = "some_table"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))

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
- **使用 `log_error` 函数记录错误**：会自动转义异常消息中的花括号，防止 loguru 解析错误

```python
from shared.core.logger import log_error

# ✅ 推荐：使用 log_error 函数（自动转义花括号）
log_error("创建单元失败", exc=e, unit_id=unit.id, textbook_id=textbook_id)

# ✅ 也可以直接使用 logger（简单场景）
from loguru import logger
logger.info("创建单元", unit_id=unit.id, textbook_id=textbook_id)
logger.error("创建单元失败", error=str(e), unit_id=unit.id)
```

**注意**: 当异常消息包含 JSON 字符串（如 `RequestValidationError`）时，必须使用 `log_error` 函数，它会自动转义花括号，防止 loguru 将 JSON 中的 `{` 和 `}` 解析为格式占位符。

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

**认证中间件**:
- 管理端使用 `admin_route_filter` 中间件（定义在 `admin/services/auth.py`）
- 学生端使用 `student_router_filter` 中间件（定义在 `student/services/auth.py`）
- 认证信息通过 `request.state` 传递（`request.state.manager` 或 `request.state.student`）

**优势**:
- 模块化设计，管理端和学生端完全隔离
- 独立的认证中间件和异常处理
- 便于未来拆分为微服务

## LangGraph 工作流规范

复杂业务逻辑使用 LangGraph 构建工作流，特别是 AI 生成类任务。

### 工作流结构

工作流定义在 `shared/generation/[type]/graph.py`，遵循以下结构：

```python
"""问题生成流程图 - 使用LangGraph构建题目生成工作流"""

from typing import Any, Dict, List
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from loguru import logger
from shared.core.database import AsyncSession

# 1. 定义状态 Schema（使用 TypedDict）
class WorkflowState(TypedDict, total=False):
    """工作流状态定义"""
    # 外部传入状态
    db: AsyncSession
    input_data: str
    
    # 内部构建状态
    processed_data: NotRequired[Any]
    result: NotRequired[Any]

# 2. 定义节点函数
async def entry_node(state: WorkflowState) -> Dict[str, Any]:
    """入口节点，负责基础校验"""
    if state.get("db") is None:
        raise ValueError("数据库会话（db）不能为空")
    
    logger.info("工作流开始")
    return {}

async def process_node(state: WorkflowState) -> Dict[str, Any]:
    """处理节点"""
    # 处理逻辑
    return {"processed_data": result}

# 3. 创建并编译图
def create_workflow_graph() -> CompiledStateGraph:
    """创建工作流图"""
    workflow = StateGraph(WorkflowState)
    
    # 添加节点
    workflow.add_node("entry", entry_node)
    workflow.add_node("process", process_node)
    
    # 设置入口点和边
    workflow.set_entry_point("entry")
    workflow.add_edge("entry", "process")
    workflow.add_edge("process", END)
    
    return workflow.compile()

# 4. 创建全局图实例
workflow_graph = create_workflow_graph()

# 5. 定义调用函数
async def invoke_workflow(
    *,
    db: AsyncSession,
    input_data: str,
) -> Any:
    """调用工作流"""
    state = WorkflowState(
        db=db,
        input_data=input_data,
    )
    result = await workflow_graph.ainvoke(state)
    return result.get("result")
```

### 状态定义规范

- 使用 `TypedDict` 定义状态 Schema
- 外部传入的状态字段不使用 `NotRequired`
- 内部构建的状态字段使用 `NotRequired[Type]`
- 状态字段必须有清晰的注释说明用途

### 节点函数规范

- 节点函数必须是异步函数：`async def node_name(state: State) -> Dict[str, Any]`
- 返回值是字典，包含要更新的状态字段
- 入口节点负责参数校验，使用 `ValueError` 抛出错误
- 每个节点使用 `logger` 记录关键操作
- 节点函数应该职责单一，便于测试和维护

### 服务路由模式

对于需要根据条件路由到不同服务的场景，使用服务字典模式：

```python
SERVICES = {
    "type_a": service_a,
    "type_b": service_b,
}

async def route_node(state: WorkflowState) -> Dict[str, Any]:
    """路由节点，根据条件调用不同服务"""
    service_type = state["type"]
    if service_type not in SERVICES:
        raise ValueError(f"服务类型 {service_type} 暂不支持")
    
    return await SERVICES[service_type].handle(state)
```

### 错误处理

- 工作流中的错误使用 `ValueError` 抛出
- 关键节点记录错误日志
- 考虑错误恢复机制（如重试、降级）

### 工作流调用

- 工作流在服务层调用，不在路由层直接调用
- 传入必要的数据库会话和参数
- 处理工作流返回的结果

```python
# 服务层调用示例
async def generate_questions(
    db: AsyncSession,
    session: PracticeSession,
    textbook: Textbook,
    units: list[Unit],
    question_types: dict[str, list[str]],
) -> List[Question]:
    """生成题目"""
    return await invoke_practice_generation_workflow(
        db=db,
        session=session,
        textbook=textbook,
        units=units,
        question_types=question_types,
    )
```

## 注意事项

1. **异步优先**: 所有数据库操作使用异步 SQLAlchemy
2. **类型安全**: 使用 Pydantic 进行数据验证
3. **错误处理**: 统一的异常处理机制
4. **日志记录**: 使用 Loguru 记录日志
5. **任务队列**: 长时间任务使用 Celery 异步处理
6. **工作流**: 复杂业务逻辑使用 LangGraph 工作流，遵循工作流规范
7. **API 文档**: 访问子应用的 `/docs` 路径查看 OpenAPI 文档，而非根路径
