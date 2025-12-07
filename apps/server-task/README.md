# AI Education Task Service

AI 题目生成任务处理服务，专注于处理题目生成的后台任务。

## 功能特性

- ✅ **题目生成**: 使用 LLM 生成教育题目（当前唯一支持的任务类型）
- ✅ **异步任务处理**: 支持异步任务提交和状态查询
- ✅ **任务管理**: 支持任务状态查询、取消等操作

## 技术栈

- **框架**: FastAPI
- **任务队列**: RQ (Redis Queue)
- **异步**: asyncio
- **日志**: Loguru
- **配置**: Pydantic Settings
- **缓存**: Redis

## 项目结构

```
apps/server-task/
├── core/              # 核心模块
│   ├── settings.py   # 配置管理
│   └── logger.py     # 日志配置
├── models/           # 数据模型
│   └── task.py       # 任务模型
├── core/              # 核心模块
│   ├── settings.py   # 配置管理
│   ├── logger.py     # 日志配置
│   └── redis.py  # Redis 客户端
├── services/         # 服务层
│   └── rq_service.py         # RQ 队列服务
├── workers/          # Worker 层
│   └── question_worker.py    # 题目生成 Worker
├── core/             # 核心模块
│   ├── settings.py   # 配置管理
│   ├── logger.py     # 日志配置
│   ├── redis.py  # Redis 客户端
│   └── executor.py   # RQ 任务执行器
├── utils/            # 工具模块
├── routes/           # 路由层
│   ├── health.py     # 健康检查
│   └── task.py       # 任务相关 API
├── main.py           # API 服务入口
├── pyproject.toml    # 依赖配置
└── Dockerfile        # Docker 镜像
```

## 快速开始

### 1. 安装依赖

```bash
# 使用 uv（推荐）
pip install uv
uv sync

# 或使用 pip
pip install -r requirements.txt
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# 运行环境
RUN_ENV=development

# 服务配置
TASK_SERVER_HOST=0.0.0.0
TASK_SERVER_PORT=7891

# Redis 配置（RQ 必需）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# AI 配置
AI_PLATFORM=dashscope
AI_PLATFORM_KEY=your-api-key
AI_PLATFORM_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 日志配置
LOG_DIR=./tmp/logs
LOG_TO_FILE=false

# 任务队列配置
RQ_QUEUE_NAME=default  # RQ 队列名称
ENABLE_WORKER=true     # 是否在启动应用时同时启动 Worker
```

### 3. 启动服务

**启动服务**（默认同时启动 API 服务和 Worker）:
```bash
# 开发模式
python main.py

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 7891 --workers 4
```

**配置说明**:
- `ENABLE_WORKER=true` (默认): 启动应用时同时启动 Worker
- `ENABLE_WORKER=false`: 仅启动 API 服务，不启动 Worker
- `RQ_QUEUE_NAME=default`: Worker 监听的队列名称（默认 "default"）

**仅启动 Worker**（用于单独运行 Worker）:
```bash
# 使用默认队列
python main.py worker

# 指定队列名称
python main.py worker default
```

**注意**: 
- 默认情况下，启动应用时会自动在后台启动 Worker，无需单独运行
- 如果需要启动多个 Worker 实例，可以使用 `python main.py worker` 命令单独启动
- 可以通过设置 `ENABLE_WORKER=false` 来禁用自动启动 Worker

## API 文档

服务启动后，可以访问：

- **Swagger UI**: http://localhost:7891/docs
- **ReDoc**: http://localhost:7891/redoc

### 主要接口

#### 1. 提交任务

```bash
POST /api/task/submit
Content-Type: application/json

{
    "task_id": "task_123",
    "task_type": "question_generation",
    "payload": {
        "type": "unit",
        "count": 10,
        "textbook_id": "textbook_001",
        "unit_id": "unit_001"
    },
    "priority": 0,
    "timeout": 600
}
```

#### 2. 查询任务状态

```bash
GET /api/task/{task_id}
```

#### 3. 取消任务

```bash
POST /api/task/{task_id}/cancel
```

#### 4. 列出任务

```bash
GET /api/task/?status=completed&limit=100
```

## 任务类型

### 题目生成 (question_generation)

当前服务只支持题目生成任务。

```json
{
    "task_id": "task_001",
    "task_type": "question_generation",
    "payload": {
        "type": "unit",
        "count": 10,
        "textbook_id": "textbook_001",
        "unit_id": "unit_001"
    },
    "priority": 0,
    "timeout": 600
}
```

**payload 字段说明**:
- `type`: 生成类型 (unit, textbook, daily_practice, unit_practice, assessment)
- `count`: 生成题目数量
- `textbook_id`: 教材ID
- `unit_id`: 单元ID（可选）
- `student_id`: 学生ID（可选，每日练习时需要）

## RQ 任务队列

### 架构说明

本服务使用 RQ (Redis Queue) 进行任务队列管理：

1. **API 服务** (`main.py`): 接收任务请求，将任务提交到 RQ 队列
2. **RQ Worker**: 从队列中获取任务并执行（默认在后台自动启动）
3. **Redis**: 作为任务队列的存储后端

### 启动流程

1. **启动 Redis**（如果还没有运行）:
```bash
redis-server
```

2. **启动服务**（默认同时启动 API 服务和 Worker）:
```bash
python main.py
```

3. **单独启动 Worker**（可选，用于启动多个 Worker 实例）:
```bash
# 启动一个 Worker（使用默认队列）
python main.py worker

# 启动多个 Worker（在不同终端）
python main.py worker default
python main.py worker default  # 第二个 Worker
```

**配置说明**:
- 默认情况下，启动应用时会自动在后台启动一个 Worker
- 可以通过 `ENABLE_WORKER=false` 禁用自动启动 Worker
- 可以通过 `RQ_QUEUE_NAME` 配置 Worker 监听的队列名称

### 任务状态

任务状态通过 RQ Job 状态映射：
- `QUEUED` → `pending` - 任务在队列中等待
- `STARTED` → `processing` - 任务正在处理
- `FINISHED` → `completed` - 任务完成
- `FAILED` → `failed` - 任务失败
- `CANCELED` → `cancelled` - 任务已取消

### 监控任务

可以使用 RQ Dashboard 监控任务：
```bash
pip install rq-dashboard
rq-dashboard
```

访问 http://localhost:9181 查看任务队列状态。

## Docker 部署

### 构建镜像

```bash
docker build -t ai-education-task:latest .
```

### 运行容器

**运行 API 服务**:
```bash
docker run -d \
  --name ai-education-task-api \
  -p 7891:7891 \
  --link redis:redis \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e AI_PLATFORM_KEY=your-api-key \
  -e AI_PLATFORM_URL=https://dashscope.aliyuncs.com/compatible-mode/v1 \
  ai-education-task:latest
```

**运行 RQ Worker**:
```bash
docker run -d \
  --name ai-education-task-worker \
  --link redis:redis \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e AI_PLATFORM_KEY=your-api-key \
  -e AI_PLATFORM_URL=https://dashscope.aliyuncs.com/compatible-mode/v1 \
  ai-education-task:latest \
  python main.py worker
```

### Docker Compose 示例

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  task-api:
    build: .
    ports:
      - "7891:7891"
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
      AI_PLATFORM_KEY: ${AI_PLATFORM_KEY}
      AI_PLATFORM_URL: ${AI_PLATFORM_URL}
    depends_on:
      - redis
  
  task-worker:
    build: .
    command: python main.py worker
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
      AI_PLATFORM_KEY: ${AI_PLATFORM_KEY}
      AI_PLATFORM_URL: ${AI_PLATFORM_URL}
    depends_on:
      - redis
      - task-api
    deploy:
      replicas: 2  # 启动 2 个 Worker 实例
```

## 开发规范

### 代码规范

- 遵循 PEP 8 Python 代码规范
- 使用类型注解（Type Hints）
- 业务逻辑放在 `services/` 层
- Worker 层负责具体任务执行
- 路由层只负责参数验证和调用服务
- 使用异步编程（async/await）
- 统一的错误处理和日志记录

### 日志规范

- 使用 Loguru 进行日志记录
- 关键操作记录 INFO 级别日志
- 错误记录 ERROR 级别日志，包含异常堆栈
- 调试信息使用 DEBUG 级别

## 性能优化

- **异步处理**: 使用 asyncio 异步处理任务
- **并发控制**: 支持多个任务并发执行
- **错误重试**: 支持任务重试机制（可扩展）
- **资源管理**: 合理管理 AI API 调用频率

## 监控与日志

### 日志配置

日志默认输出到控制台，生产环境可以配置输出到文件：

```env
LOG_TO_FILE=true
LOG_DIR=/app/tmp/logs
```

### 健康检查

```bash
GET /health
```

## 许可证

MIT License

