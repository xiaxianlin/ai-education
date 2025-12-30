# 服务端 - Agent 配置

## 应用概述

基于 FastAPI 的单体应用，包含管理端、学生端、AI 生成、任务处理等核心模块。

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

#### 1. admin/ - 管理端模块

管理后台 API，供管理端 Web 应用调用。

| 子模块       | 路由文件                | 服务文件                                                                           | 说明                     |
| ------------ | ----------------------- | ---------------------------------------------------------------------------------- | ------------------------ |
| auth         | `auth/route.py`         | `auth/services/auth.py`, `manager.py`                                              | 认证、管理员管理         |
| textbook     | `textbook/route.py`     | `textbook/services/textbook.py`, `unit.py`, `knowledge.py`                         | 教材、单元、知识点管理   |
| teacher_book | `teacher_book/route.py` | `teacher_book/services/teacher_book.py`                                            | 教师参考书管理           |
| question     | `question/route.py`     | `question/services/question.py`, `question_type.py`                                | 题目、题型管理           |
| practice     | `practice/route.py`     | `practice/services/practice.py`                                                     | 练习类型管理             |
| student      | `student/route.py`      | `student/services/student.py`, `textbook.py`, `practice.py`, `practice_session.py` | 学生管理                 |
| data         | `data/practice.py`      | -                                                                                  | 练习静态数据             |

#### 2. student/ - 学生端模块

学生端 API，供学生端 Web 和移动端应用调用。

| 路由文件             | 服务文件                                                                 | 说明                           |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------ |
| `routes/auth.py`     | `services/auth.py`                                                       | 学生认证（登录、注册）         |
| `routes/textbook.py` | `services/textbook.py`                                                   | 教材查询                       |
| `routes/practice.py` | `services/practice.py`, `practice_generate.py`, `answer.py`, `report.py` | 练习会话、题目生成、答题、报告 |
| `routes/profile.py`  | -                                                                        | 学生个人信息                   |

#### 3. generation/ - AI 生成模块

基于 LangGraph 的 AI 内容生成工作流。

| 子模块   | 说明     | 核心文件                                                                                     |
| -------- | -------- | -------------------------------------------------------------------------------------------- |
| question | 题目生成 | `graph.py`, `services/daily_practice.py`, `unit_practice.py`, `assess_practice.py`, `llm.py` |
| audio    | 语音生成 | `graph.py`, `services/generate.py`                                                           |
| image    | 图片生成 | `graph.py`, `services/generate.py`                                                           |
| video    | 视频生成 | `graph.py`, `services/generate.py`                                                           |

**题目生成流程：**

- 日常练习 (daily_practice): 基于学生教材生成日常练习题
- 单元练习 (unit_practice): 基于特定单元和知识点生成练习题
- 综合评估 (assess_practice): 基于能力评估算法生成自适应测试题

#### 4. shared/ - 共享模块

| 子模块   | 文件                   | 说明                  |
| -------- | ---------------------- | --------------------- |
| core     | `database.py`          | 数据库模型与连接      |
| core     | `settings.py`          | 环境配置              |
| core     | `logger.py`            | 日志配置              |
| core     | `exception.py`         | 统一异常处理          |
| core     | `middleware.py`        | 中间件                |
| core     | `schema.py`            | 通用 Schema           |
| core     | `constants.py`         | 常量定义              |
| provider | `aliyun.py`            | 阿里云服务（OSS、AI） |
| services | `ai.py`                | AI 服务调用           |
| services | `answer.py`            | 答题处理              |
| services | `practice_analysis.py` | 练习分析              |
| services | `practice_session.py`  | 练习会话管理          |
| services | `prompt.py`            | Prompt 获取           |
| services | `textbook_parser.py`   | 教材解析              |
| utils    | `oss.py`               | OSS 工具              |
| utils    | `question.py`          | 题目工具              |
| utils    | `rag.py`               | RAG 检索              |
| utils    | `practice_config.py`   | 练习配置              |
| utils    | `encrypt.py`           | 加密工具              |
| utils    | `validation.py`        | 验证工具              |
| worker   | `celery.py`            | Celery 配置与任务提交 |
| worker   | `executor.py`          | 任务执行器            |

## 数据模型

主要数据模型定义在 `shared/core/database/` 目录：

| 模型                  | 表名                       | 说明           |
| --------------------- | -------------------------- | -------------- |
| Manager               | ah_manager                 | 管理员         |
| Textbook              | ah_textbook                | 教材           |
| Unit                  | ah_unit                    | 单元           |
| Knowledge             | ah_knowledge               | 知识点         |
| TeacherBook           | ah_teacher_book            | 教师参考书     |
| Question              | ah_question                | 题目           |
| QuestionType          | ah_question_type           | 题型           |
| Practice              | ah_practice                | 练习类型       |
| PracticeSession       | ah_practice_session        | 练习会话       |
| PracticeSessionAnswer | ah_practice_session_answer | 答题记录       |
| PracticeSessionReport | ah_practice_session_report | 练习报告       |
| Student               | ah_student                 | 学生           |
| StudentTextbook       | ah_student_textbook        | 学生教材关联   |
| StudentPractice       | ah_student_practice        | 学生练习关联   |

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
from admin.[module].schema import SomeSchema
from admin.[module].services import some_service

router = APIRouter(prefix="/some", tags=["Some"])

@router.post("/")
async def create_something(
    params: SomeSchema,
    db: AsyncSession = Depends(Database)
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

### AI 工作流 (LangGraph)

- 工作流定义: `generation/[type]/graph.py`
- 服务实现: `generation/[type]/services/`
- Schema 定义: `generation/[type]/schema.py`

## 应用架构

项目采用子应用挂载架构：

- `main.py` 创建主 FastAPI 应用
- `admin_app` 和 `student_app` 作为独立的 FastAPI 实例
- 使用 `app.mount()` 将子应用挂载到 `/api/admin` 和 `/api/student` 路径
- 每个子应用有独立的中间件、异常处理器和依赖注入

## API 文档访问

- **管理端 API 文档**: `http://localhost:7890/api/admin/docs`
- **学生端 API 文档**: `http://localhost:7890/api/student/docs`
- **管理端 OpenAPI JSON**: `http://localhost:7890/api/admin/openapi.json`
- **学生端 OpenAPI JSON**: `http://localhost:7890/api/student/openapi.json`

**注意**: 根应用的 `/docs` 和 `/openapi.json` 不会包含子应用的路由（这是 FastAPI 的设计行为），需要访问子应用的独立文档路径。

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
