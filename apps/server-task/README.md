# AI Education Task Service

AI 生成任务处理服务，专注于处理各种 AI 生成任务，包括题目生成、图片生成、语音生成和答题分析。

## 功能特性

- ✅ **题目生成**: 使用 LLM 生成教育题目
- ✅ **图片生成**: 使用 AI 生成教育图片，支持提示词优化
- ✅ **语音生成**: 文本转语音（TTS）
- ✅ **答题分析**: 分析学生答题情况，提供反馈
- ✅ **异步任务处理**: 支持异步任务提交和状态查询
- ✅ **任务管理**: 支持任务状态查询、取消等操作

## 技术栈

- **框架**: FastAPI
- **任务队列**: RQ (Redis Queue)
- **AI**: LangChain, OpenAI API, DashScope
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
│   └── redis_client.py  # Redis 客户端
├── services/         # 服务层
│   ├── llm_service.py         # LLM 服务
│   ├── image_service.py       # 图片生成服务
│   ├── audio_service.py      # 语音生成服务
│   ├── analysis_service.py    # 答题分析服务
│   ├── prompt_service.py     # 提示词优化服务
│   ├── rq_service.py         # RQ 队列服务
│   └── task_manager.py       # 任务管理器
├── workers/          # Worker 层
│   ├── question_worker.py    # 题目生成 Worker
│   ├── resource_worker.py    # 资源生成 Worker
│   ├── analysis_worker.py    # 答题分析 Worker
│   └── task_executor.py      # RQ 任务执行器
├── routes/           # 路由层
│   ├── health.py     # 健康检查
│   └── task.py       # 任务相关 API
├── main.py           # API 服务入口
├── worker.py         # RQ Worker 启动脚本
├── start_worker.sh   # Worker 启动脚本
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
```

### 3. 启动服务

**启动 API 服务**:
```bash
# 开发模式
python main.py

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 7891 --workers 4
```

**启动 RQ Worker**（必需）:
```bash
# 使用脚本启动（推荐）
./start_worker.sh

# 或直接使用 Python
python worker.py

# 指定队列名称
python worker.py default
```

**注意**: RQ Worker 必须单独运行，用于处理队列中的任务。可以启动多个 Worker 实例来提高并发处理能力。

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
    "task_type": "image_generation",
    "payload": {
        "text": "一只可爱的小猫",
        "width": 1328,
        "height": 1328,
        "optimize_prompt": true
    },
    "priority": 0,
    "timeout": 300
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

### 1. 题目生成 (question_generation)

```json
{
    "task_id": "task_001",
    "task_type": "question_generation",
    "payload": {
        "prompt_text": "生成一道小学数学题",
        "prompt_input": {},
        "model_name": "qwen3-max",
        "temperature": 0.7
    }
}
```

### 2. 图片生成 (image_generation)

```json
{
    "task_id": "task_002",
    "task_type": "image_generation",
    "payload": {
        "text": "一只可爱的小猫",
        "width": 1328,
        "height": 1328,
        "optimize_prompt": true
    }
}
```

### 3. 语音生成 (audio_generation)

```json
{
    "task_id": "task_003",
    "task_type": "audio_generation",
    "payload": {
        "text": "这是一道数学题",
        "voice": "Cherry",
        "language": "Chinese"
    }
}
```

### 4. 答题分析 (answer_analysis)

```json
{
    "task_id": "task_004",
    "task_type": "answer_analysis",
    "payload": {
        "content": "题目内容",
        "options": "选项A、选项B",
        "knowledge": "知识点",
        "question_answer": "正确答案",
        "student_answer": "学生答案",
        "model_name": "qwen3-max-preview",
        "temperature": 0.7
    }
}
```

## RQ 任务队列

### 架构说明

本服务使用 RQ (Redis Queue) 进行任务队列管理：

1. **API 服务** (`main.py`): 接收任务请求，将任务提交到 RQ 队列
2. **RQ Worker** (`worker.py`): 从队列中获取任务并执行
3. **Redis**: 作为任务队列的存储后端

### 启动流程

1. **启动 Redis**（如果还没有运行）:
```bash
redis-server
```

2. **启动 API 服务**:
```bash
python main.py
```

3. **启动 RQ Worker**（可以启动多个）:
```bash
# 启动一个 Worker
python worker.py

# 或使用脚本
./start_worker.sh

# 启动多个 Worker（在不同终端）
python worker.py default
python worker.py default  # 第二个 Worker
```

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
  python worker.py
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
    command: python worker.py
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

