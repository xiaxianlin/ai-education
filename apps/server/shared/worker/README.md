# Celery Worker 模块说明文档

## 概述

本模块实现了基于 Celery 的异步任务处理系统，用于处理耗时的后台任务（如练习生成）。Worker 进程独立于主应用运行，通过 Redis 消息队列接收任务并执行。

## 目录结构

```
shared/worker/
├── __init__.py          # 模块导出
├── celery.py            # Celery 应用配置和任务管理
├── executor.py          # 任务执行器（Worker 实际执行的函数）
└── README.md            # 本文档
```

## 核心组件

### 1. Celery 应用 (`celery.py`)

**主要功能：**
- 创建和配置 Celery 应用实例
- 定义任务提交、状态查询、取消等管理函数
- 配置任务队列、超时、重试等参数

**关键配置：**
- **Broker**: Redis（用于消息队列）
- **Backend**: Redis（用于结果存储）
- **序列化**: JSON
- **时区**: Asia/Shanghai
- **任务超时**: 30分钟（可配置）
- **重试策略**: 自动重试，最多3次，指数退避

**主要函数：**
- `submit_task()`: 提交任务到队列
- `get_task_status()`: 查询任务状态
- `cancel_task()`: 取消任务

### 2. 任务执行器 (`executor.py`)

**主要功能：**
- 定义实际执行的任务函数
- 处理异步代码（通过 `asyncio.run()` 包装）
- 管理数据库会话（Worker 中创建独立会话）

**当前支持的任务：**
- `execute_generate_practice_task`: 生成练习会话任务

**注意事项：**
- Celery 任务函数必须是**同步函数**
- 内部使用 `asyncio.run()` 执行异步代码
- 数据库会话在 Worker 中独立创建，不能共享主应用的会话

## 使用方式

### 1. 提交任务

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

### 2. 查询任务状态

```python
from shared.worker import get_task_status

status = get_task_status(task_id)
# 返回格式：
# {
#     "task_id": "...",
#     "status": "SUCCESS|PENDING|STARTED|FAILURE|RETRY",
#     "result": {...},  # 任务成功时的结果
#     "error": "...",   # 任务失败时的错误信息
#     "created_at": datetime,
#     "updated_at": datetime,
#     "processing_time": 123.45  # 处理耗时（秒）
# }
```

### 3. 取消任务

```python
from shared.worker import cancel_task

success = cancel_task(task_id)
# 只能取消 PENDING 或 STARTED 状态的任务
```

## 启动 Worker

### 开发环境

```bash
# 使用项目提供的脚本（推荐）
uv run worker.py

# 或使用 npm 脚本
npm run dev:worker

# 或直接使用 Celery 命令
celery -A shared.worker.celery worker --loglevel=info
```

### 生产环境

```bash
# 使用 PM2（推荐）
pm2 start ecosystem.config.js

# 或直接运行
uv run worker.py --loglevel=info --concurrency=4
```

### 配置选项

- `--queue`: 指定队列名称（默认使用 `TASK_QUEUE_NAME` 环境变量）
- `--loglevel`: 日志级别（debug/info/warning/error/critical）
- `--concurrency`: 并发工作进程数（默认使用 `CELERY_WORKER_CONCURRENCY` 环境变量，0 表示自动检测 CPU 核心数）

## 环境变量配置

在 `.env` 文件中配置以下变量：

```bash
# Redis 配置
REDIS_URL=redis://localhost:6379/0

# 任务队列配置
TASK_QUEUE_NAME=ai-education-task
TASK_TIMEOUT=1800  # 任务超时时间（秒），默认30分钟

# Worker 配置
CELERY_WORKER_CONCURRENCY=0  # 0 表示自动检测 CPU 核心数
```

## 任务状态说明

- **PENDING**: 任务已提交，等待执行
- **STARTED**: 任务正在执行
- **SUCCESS**: 任务执行成功
- **FAILURE**: 任务执行失败
- **RETRY**: 任务正在重试
- **REVOKED**: 任务已取消

## 错误处理和重试

### 自动重试机制

- **触发条件**: 任务执行抛出任何异常
- **重试次数**: 最多 3 次
- **重试延迟**: 60秒，然后指数退避（120秒、240秒...）
- **随机抖动**: 启用，避免多个任务同时重试（雷群效应）

### 超时处理

- **软超时**: `TASK_TIMEOUT`（默认30分钟），任务会收到 `SoftTimeLimitExceeded` 异常
- **硬超时**: `TASK_TIMEOUT + 60`（默认31分钟），任务会被强制终止

## 常见问题

### 1. 任务一直处于 PENDING 状态

**原因**: Worker 未启动或未连接到正确的队列

**解决方案**:
- 检查 Worker 是否正在运行
- 确认 Worker 监听的队列名称与任务提交的队列名称一致
- 检查 Redis 连接是否正常

### 2. 任务执行失败但无错误信息

**原因**: 可能是序列化问题或数据库连接问题

**解决方案**:
- 检查任务参数是否可序列化（不能包含数据库会话等不可序列化对象）
- 检查 Worker 日志文件：`tmp/logs/celery_worker.log`
- 确认数据库连接配置正确

### 3. 数据库会话错误

**原因**: 尝试在 Worker 中使用主应用的数据库会话

**解决方案**:
- 任务参数中不能包含数据库会话对象
- Worker 中会自动创建新的数据库会话
- 确保数据库连接池配置足够大

### 4. 任务重复执行

**原因**: 可能是任务确认机制问题

**解决方案**:
- 检查 `task_acks_late` 配置（已设置为 `True`，任务完成后才确认）
- 检查 `task_reject_on_worker_lost` 配置（已设置为 `True`，Worker 丢失时拒绝任务）

## 性能优化建议

1. **并发数设置**: 根据服务器 CPU 核心数和任务特性调整 `CELERY_WORKER_CONCURRENCY`
2. **任务超时**: 根据实际任务执行时间调整 `TASK_TIMEOUT`
3. **结果过期**: 任务结果默认保留1小时，可根据需要调整 `result_expires`
4. **预取数量**: 已设置为1，避免任务堆积在单个 Worker 中

## 监控和日志

### 日志位置

- Worker 日志: `tmp/logs/celery_worker.log`
- 应用日志: `tmp/logs/app.log`

### 监控工具

可以使用以下工具监控 Celery：

- **Flower**: Celery 的 Web 监控工具
  ```bash
  pip install flower
  celery -A shared.worker.celery flower
  ```

- **Redis CLI**: 查看队列状态
  ```bash
  redis-cli
  > LLEN ai-education-task
  ```

## 扩展新任务

要添加新的任务类型：

1. 在 `executor.py` 中添加新的任务函数：

```python
@app.task(
    bind=True,
    name=Executor.your_new_task.value,
    autoretry_for=(Exception,),
    retry_backoff=60,
    retry_kwargs={"max_retries": 3},
    retry_jitter=True,
)
def execute_your_new_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    """执行新任务"""
    # 将字典转换为参数对象
    params = YourParams(**payload)
    
    async def _execute():
        async with AsyncSessionLocal() as db:
            # 执行异步任务逻辑
            await your_async_function(db, params)
    
    asyncio.run(_execute())
    return {"success": True}
```

2. 在 `celery.py` 的 `Executor` 枚举中添加新任务：

```python
class Executor(Enum):
    generate_practice_task = "shared.worker.executor.execute_generate_practice_task"
    your_new_task = "shared.worker.executor.execute_your_new_task"
```

3. 在调用处使用：

```python
from shared.worker import submit_task, Executor

task_id = submit_task(
    task_id="your_task_123",
    executor=Executor.your_new_task,
    args=[params.model_dump()]
)
```

## 版本历史

- **v1.0.0** (2024): 初始版本
  - 支持练习生成任务
  - 基础的任务管理和状态查询
  - 自动重试和超时处理

