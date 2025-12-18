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
   - 功能模块:
     - 认证管理: `admin/routes/auth.py`
     - 管理员管理: `admin/routes/manager.py`
     - 教材管理: `admin/routes/textbook.py`
     - 单元管理: `admin/routes/unit.py`
     - 知识点管理: `admin/routes/knowledge.py`
     - 题目管理: `admin/routes/question.py`
     - 题型管理: `admin/routes/question_type.py`
     - 学生管理: `admin/routes/student.py`
     - 练习管理: `admin/routes/practice.py`
     - 配置管理: `admin/routes/config.py`
     - Prompt 管理: `admin/routes/prompt.py`

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
- 题型管理: 题型包含 AI 生成指令（prompt），用于指导 AI 生成特定类型的题目
- Prompt 管理: 系统化的 Prompt 版本管理，支持创建、更新、发布 Prompt 版本

### 数据模型
- 数据库模型定义在 `shared/core/database.py`
- 主要模型:
  - `QuestionType`: 题型表，包含题型标题、类型、科目、年级、描述、资源类型、AI 生成指令等
  - `Question`: 题目表，关联题型信息
  - `Textbook`: 教材表
  - `Unit`: 单元表
  - `Knowledge`: 知识点表
  - `PracticeSession`: 练习会话表
  - `PracticeAnswer`: 答题记录表
  - `Prompt`: Prompt 表，包含 Prompt 基本信息（名称、slug、场景、描述、标签等）
  - `PromptVersion`: Prompt 版本表，包含版本内容（模板内容、负面提示、模型参数等）

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
- API 文档: `docs/API.md`
- FastAPI 文档: `https://fastapi.tiangolo.com/`

## 核心功能模块

### 题型管理
题型管理模块用于管理题型的配置信息，包括：
- **题型标题** (title): 如"看图选词"、"根据首字母填空"等
- **类型** (scene): 如"选择题"、"填空题"、"判断题"、"口语题"、"应用题"等
- **科目和年级**: 题型与特定科目、年级关联
- **资源类型** (resource_type): 标识题型是否需要图片或语音资源
- **AI 生成指令** (prompt): 用于指导 AI 生成该类型题目的指令

题型管理接口:
- `POST /api/admin/question_type/` - 创建题型
- `PATCH /api/admin/question_type/{id}` - 更新题型
- `DELETE /api/admin/question_type/{id}` - 删除题型
- `GET /api/admin/question_type/{id}` - 获取题型详情
- `GET /api/admin/question_type/search` - 搜索题型

相关文件:
- 数据模型: `shared/core/database.py` (QuestionType)
- Schema: `admin/schema.py` (CreateQuestionTypeSchema, UpdateQuestionTypeSchema, SearchQuestionTypeSchema)
- 服务层: `admin/services/question_type.py`
- 路由层: `admin/routes/question_type.py`

### Prompt 管理
Prompt 管理模块用于系统化管理 AI 提示词模板，支持版本控制和发布管理：
- **Prompt 基本信息**: 名称、slug（唯一标识）、场景、描述、标签等
- **版本管理**: 每个 Prompt 可以有多个版本，支持版本历史记录
- **模板内容**: 包含模板内容（template_content）、负面提示（negative_content）、模型参数（model_params）等
- **发布机制**: 支持发布特定版本，发布后的版本成为当前使用的版本

Prompt 管理接口:
- `POST /api/admin/prompt/` - 创建 Prompt
- `PUT /api/admin/prompt/{version_id}` - 更新 Prompt 版本
- `POST /api/admin/prompt/{version_id}/publish` - 发布 Prompt 版本
- `GET /api/admin/prompt/list` - 获取 Prompt 列表
- `GET /api/admin/prompt/versions` - 获取 Prompt 版本列表
- `GET /api/admin/prompt/{version_id}` - 获取 Prompt 详情

相关文件:
- 数据模型: `shared/core/database.py` (Prompt, PromptVersion)
- Schema: `admin/schema.py` (SavePromptSchema, PromptDetailSchema, SearchPromptSchema, SearchPromptVersionSchema)
- 服务层: `admin/services/prompt.py`
- 路由层: `admin/routes/prompt.py`
