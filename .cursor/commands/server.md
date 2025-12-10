# Server 服务端架构文档

## 概述

`apps/server` 是一个基于 FastAPI 的单体应用，采用模块化设计，包含管理端、学生端、AI 功能、任务处理等核心模块。

## 技术栈

- **Web框架**: FastAPI 0.115+
- **语言**: Python 3.12
- **数据库**: MySQL (SQLAlchemy 2.0 异步 ORM)
- **缓存/队列**: Redis (用于 Celery 任务队列)
- **认证**: JWT (PyJWT)
- **验证**: Pydantic
- **日志**: Loguru
- **AI**: 阿里云百炼AI (DashScope SDK) + LangChain + LangGraph
- **存储**: 阿里云 OSS
- **任务队列**: Celery (Redis 作为 Broker 和 Backend)
- **文档处理**: PyMuPDF
- **语音处理**: PyTorch + TorchAudio

## 项目结构

```
apps/server/
├── admin/                  # 管理端模块
│   ├── routes/            # 路由层（API 端点）
│   │   ├── auth.py       # 认证相关
│   │   ├── manager.py    # 管理员管理
│   │   ├── textbook.py   # 教材管理
│   │   ├── teacher_book.py  # 教师用书管理
│   │   ├── unit.py       # 单元管理
│   │   ├── knowledge.py  # 知识点管理
│   │   ├── question.py   # 题目管理
│   │   ├── student.py    # 学生管理
│   │   ├── practice.py   # 练习管理
│   │   └── config.py     # 配置管理
│   ├── services/         # 业务逻辑层
│   │   ├── auth.py       # 认证服务
│   │   ├── manager.py    # 管理员服务
│   │   ├── textbook.py   # 教材服务
│   │   ├── teacher_book.py
│   │   ├── unit.py
│   │   ├── knowledge.py
│   │   ├── question.py
│   │   ├── student.py
│   │   └── practice.py
│   └── schema.py          # 请求/响应模型定义
│
├── student/               # 学生端模块
│   ├── routes/            # 路由层
│   │   ├── auth.py       # 学生认证
│   │   ├── profile.py    # 学生资料
│   │   ├── textbook.py   # 教材功能
│   │   ├── practice.py   # 练习功能（每日/单元/评估）
│   │   └── wrong_records.py  # 错题记录
│   ├── services/          # 业务逻辑层
│   │   ├── auth.py       # 认证服务
│   │   ├── textbook.py   # 教材服务
│   │   ├── practice.py   # 练习服务
│   │   ├── practice_generate.py  # 练习生成服务
│   │   ├── answer.py     # 答题服务
│   │   ├── report.py     # 报告生成服务
│   │   └── wrong_records.py
│   └── schema.py          # 数据模型定义
│
├── ai/                    # AI 功能模块
│   ├── question/         # 题目相关 AI
│   │   ├── answer.py     # 答题分析
│   │   └── resource.py  # 资源生成（图片/语音）
│   ├── question_generate/ # 题目生成（LangGraph 工作流）
│   │   ├── graph.py      # 工作流定义
│   │   ├── prompts/      # Prompt 模板
│   │   │   ├── daily_practice.py
│   │   │   ├── unit_practice.py
│   │   │   ├── assessment.py
│   │   │   ├── image.py
│   │   │   └── utils.py
│   │   └── services/     # 生成服务
│   │       ├── llm.py    # LLM 调用服务
│   │       ├── recall.py  # RAG 召回服务
│   │       ├── resource.py  # 资源生成服务
│   │       ├── storage.py   # 存储服务
│   │       ├── daily_practice.py
│   │       ├── unit_practice.py
│   │       └── assessment.py
│   ├── practice/         # 练习分析
│   │   └── analysis.py  # 能力分析
│   ├── texttbook/        # 教材解析
│   │   └── parse.py     # PDF 解析
│   ├── utils/            # AI 工具
│   │   ├── llm.py        # LLM 工具函数
│   │   ├── question.py   # 题目处理工具
│   │   └── rag.py        # RAG 工具
│   └── schema.py         # AI 相关数据模型
│
├── shared/               # 共享模块
│   ├── core/             # 核心功能
│   │   ├── database.py   # 数据库模型和配置
│   │   ├── settings.py   # 环境配置
│   │   ├── logger.py     # 日志配置
│   │   ├── middleware.py # 中间件
│   │   ├── exception.py  # 异常处理
│   │   ├── constants.py  # 常量定义
│   │   └── schema.py     # 共享数据模型
│   ├── worker/           # 任务处理模块（Celery Worker）
│   │   ├── celery.py     # Celery 应用配置和任务管理
│   │   ├── executor.py   # 任务执行器（Worker 实际执行的函数）
│   │   ├── README.md     # Worker 模块文档
│   │   └── CONFIG.md     # Worker 配置文档
│   └── utils/            # 工具函数
│       ├── encrypt.py    # 加密工具
│       ├── oss.py        # OSS 存储工具
│       ├── time.py       # 时间工具
│       └── validation.py # 验证工具
│
├── main.py               # 应用入口
├── worker.py             # Celery Worker 启动脚本
├── pyproject.toml        # 项目依赖配置
├── ecosystem.config.js   # PM2 配置
├── langgraph.json        # LangGraph 配置
└── README.md             # 项目文档
```

## 架构设计

### 模块划分

1. **admin/** - 管理端模块
   - 提供管理后台的 API 接口
   - 包含认证、教材管理、题目管理、学生管理等

2. **student/** - 学生端模块
   - 提供学生端的 API 接口
   - 包含认证、练习功能、错题记录等

3. **ai/** - AI 功能模块
   - 题目生成（使用 LangGraph 工作流）
   - 答题分析
   - 资源生成（图片/语音）
   - 教材解析

4. **shared/worker/** - 任务处理模块
   - 异步任务管理（基于 Celery）
   - 任务执行器（Worker）
   - 任务队列服务

5. **shared/** - 共享模块
   - 数据库模型和配置
   - 工具函数
   - 核心服务

### 应用启动

应用通过 `main.py` 启动，挂载两个子应用：
- `/api/admin` - 管理端应用 (`admin_app`)
- `/api/student` - 学生端应用 (`student_app`)

### 任务处理流程

1. **任务提交**: API 层调用 `shared.worker.celery.submit_task()` 提交任务到 Celery 队列
2. **任务执行**: Celery Worker (`worker.py`) 从队列获取任务，调用 `shared.worker.executor.execute_generate_practice_task()`
3. **业务逻辑执行**: 执行器调用 `student.services.practice_generate.generate_practice_session()` 生成练习会话
4. **结果存储**: 任务完成后，结果存储到数据库

### AI 题目生成工作流

使用 LangGraph 构建的题目生成工作流：

1. **入口节点** (`entry_node`) - 基础校验
2. **路由节点** (`router_node`) - 根据类型分发
3. **生成节点** - 根据类型调用不同的生成服务：
   - `daily_practice` - 每日练习生成
   - `unit_practice` - 单元练习生成
   - `assessment` - 能力评估生成
4. **资源生成节点** - 生成题目图片和语音
5. **存储节点** - 保存题目到数据库

## 开发规范

### 分层架构

```
路由层 (routes/) 
  ↓
服务层 (services/)
  ↓
数据层 (database.py)
```

### 路由定义

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
    db: AsyncSession = Database
):
    return await some_service.create(db, params)
```

### 服务层

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

## 数据模型

主要数据模型定义在 `shared/core/database.py`：

- `Manager` - 管理员
- `Textbook` - 教材
- `TeacherBook` - 教师用书
- `Unit` - 课程单元
- `Knowledge` - 知识点
- `Question` - 题目
- `Student` - 学生
- `StudentTextbook` - 学生教材关联
- `PracticeSession` - 练习会话
- `PracticeAnswer` - 答题记录
- `PracticeWrongRecord` - 错题记录
- `PracticeReport` - 练习报告

## 环境配置

主要配置在 `shared/core/settings.py`：

- 数据库配置 (`DATABASE_URL`, `DATABASE_POOL_SIZE` 等)
- Redis 配置 (`REDIS_URL` 等)
- 阿里云配置 (`ALIYUN_ACCESS_KEY_ID` 等)
- AI 配置 (`AI_PLATFORM`, `AI_PLATFORM_KEY` 等)
- 任务配置 (`TASK_QUEUE_NAME`, `TASK_TIMEOUT` 等)

## 启动方式

### 开发模式

```bash
# 启动主应用
uv run main.py

# 启动 Worker（另开终端）
uv run worker.py

# 或使用 npm 脚本
npm run dev:worker
```

### 生产模式

```bash
# 使用 PM2
pm2 start ecosystem.config.js

# 或使用 uvicorn
uvicorn main:app --host 0.0.0.0 --port 7890 --workers 4
```

## 注意事项

1. **异步优先**: 所有数据库操作使用异步 SQLAlchemy
2. **类型安全**: 使用 Pydantic 进行数据验证
3. **错误处理**: 统一的异常处理机制（`shared/core/exception.py`）
4. **日志记录**: 使用 Loguru 记录日志
5. **任务队列**: 长时间任务使用 Celery 异步处理
6. **工作流**: 复杂业务逻辑使用 LangGraph 工作流
7. **认证**: 管理端和学生端使用不同的认证中间件

## 相关文档

- [API 文档](./api.md)
- [README.md](../apps/server/README.md)
- [后端开发指南](./backend.md)

