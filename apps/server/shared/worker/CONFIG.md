# Celery Worker 配置文档

## 配置文件位置

Worker 配置主要在以下文件中：

- `shared/worker/celery.py`: Celery 应用配置
- `shared/core/settings.py`: 环境变量配置
- `.env`: 环境变量文件

## 配置项说明

### 1. Celery 应用配置 (`celery.py`)

#### 基础配置

```python
app = Celery(
    "ai-education",                    # 应用名称
    broker=envs.REDIS_URL,            # 消息代理（Redis URL）
    backend=envs.REDIS_URL,            # 结果后端（Redis URL）
    include=["shared.worker.executor"], # 包含的任务模块
)
```

#### 序列化配置

```python
task_serializer="json"           # 任务序列化格式
accept_content=["json"]          # 接受的内容类型
result_serializer="json"         # 结果序列化格式
```

**说明**: 使用 JSON 序列化，确保跨语言兼容性和安全性。

#### 时区配置

```python
timezone="Asia/Shanghai"  # 时区设置
enable_utc=True          # 启用 UTC
```

#### 任务超时配置

```python
task_time_limit=envs.TASK_TIMEOUT + 60      # 硬超时（秒）
task_soft_time_limit=envs.TASK_TIMEOUT      # 软超时（秒）
task_track_started=True                     # 跟踪任务开始时间
```

**说明**:
- 硬超时：任务执行超过此时间会被强制终止
- 软超时：任务执行超过此时间会收到 `SoftTimeLimitExceeded` 异常，可以优雅退出
- 默认超时时间：30分钟（1800秒）

#### 结果存储配置

```python
result_expires=3600  # 结果保留时间（秒），默认1小时
```

**说明**: 任务执行结果在 Redis 中保留的时间，过期后自动删除。

#### Worker 可靠性配置

```python
task_reject_on_worker_lost=True    # Worker 丢失时拒绝任务
task_acks_late=True                # 任务完成后才确认
worker_prefetch_multiplier=1       # 每个 worker 只预取 1 个任务
```

**说明**:
- `task_reject_on_worker_lost=True`: 如果 Worker 进程崩溃，任务会被重新分发
- `task_acks_late=True`: 任务执行完成后才确认，避免任务丢失
- `worker_prefetch_multiplier=1`: 避免任务堆积在单个 Worker 中

#### 重试配置

```python
task_default_retry_delay=60  # 默认重试延迟（秒）
task_max_retries=3           # 最大重试次数
```

**说明**: 任务级别的重试配置，可以在任务装饰器中覆盖。

#### 性能优化配置

```python
worker_max_tasks_per_child=1000  # 每个子进程最多处理任务数
worker_disable_rate_limits=False # 启用速率限制
```

**说明**:
- `worker_max_tasks_per_child`: 子进程处理一定数量任务后重启，避免内存泄漏
- `worker_disable_rate_limits`: 是否禁用速率限制

#### 队列配置

```python
task_default_queue=envs.TASK_QUEUE_NAME           # 默认队列名称
task_default_exchange=envs.TASK_QUEUE_NAME        # 默认交换机名称
task_default_exchange_type="direct"               # 交换机类型
task_default_routing_key=envs.TASK_QUEUE_NAME     # 默认路由键
```

**说明**: 使用 Direct 交换机，任务直接路由到指定队列。

#### 监控配置

```python
worker_send_task_events=True  # 发送任务事件
task_send_sent_event=True     # 发送任务发送事件
```

**说明**: 启用事件发送，支持 Flower 等监控工具。

### 2. 环境变量配置 (`.env`)

#### Redis 配置

```bash
# Redis 连接 URL
REDIS_URL=redis://localhost:6379/0

# 格式说明：
# redis://[password@]host[:port][/database]
# 示例：
# redis://localhost:6379/0                    # 本地 Redis，无密码，数据库 0
# redis://:password@redis:6379/0              # 带密码
# redis://redis-cluster:6379/2                # 使用数据库 2
```

#### 任务队列配置

```bash
# 队列名称
TASK_QUEUE_NAME=ai-education-task

# 任务超时时间（秒）
TASK_TIMEOUT=1800  # 30分钟
```

#### Worker 配置

```bash
# Worker 并发数
CELERY_WORKER_CONCURRENCY=0  # 0 表示自动检测 CPU 核心数
```

**并发数规则**:
- `0`: 自动检测 CPU 核心数（推荐）
- `1`: 单进程模式（调试用）
- `>1`: 指定的进程数

### 3. 任务级别配置 (`executor.py`)

每个任务可以在装饰器中配置：

```python
@app.task(
    bind=True,                              # 绑定任务实例
    name=Executor.generate_practice_task.value,  # 任务名称
    autoretry_for=(Exception,),             # 自动重试的异常类型
    retry_backoff=60,                      # 重试延迟（秒），指数退避
    retry_kwargs={"max_retries": 3},       # 重试参数
    retry_jitter=True,                     # 启用随机抖动
)
```

**参数说明**:
- `bind=True`: 任务函数可以访问 `self`（任务实例）
- `name`: 任务的唯一名称
- `autoretry_for`: 遇到这些异常时自动重试
- `retry_backoff`: 重试延迟，会指数增长（60s, 120s, 240s...）
- `retry_kwargs`: 重试相关参数
- `retry_jitter=True`: 添加随机抖动，避免多个任务同时重试

## 配置最佳实践

### 1. 生产环境配置

```bash
# .env
REDIS_URL=redis://redis-prod:6379/0
TASK_QUEUE_NAME=ai-education-task-prod
TASK_TIMEOUT=1800
CELERY_WORKER_CONCURRENCY=4  # 根据服务器 CPU 核心数调整
```

### 2. 开发环境配置

```bash
# .env
REDIS_URL=redis://localhost:6379/0
TASK_QUEUE_NAME=ai-education-task-dev
TASK_TIMEOUT=1800
CELERY_WORKER_CONCURRENCY=2  # 开发环境可以使用较小的并发数
```

### 3. 高负载场景配置

```bash
# .env
CELERY_WORKER_CONCURRENCY=8  # 增加并发数
TASK_TIMEOUT=3600            # 增加超时时间（如果任务确实需要更长时间）
```

```python
# celery.py
worker_prefetch_multiplier=2  # 可以适当增加预取数量
worker_max_tasks_per_child=500  # 降低重启频率
```

### 4. 调试场景配置

```bash
# .env
CELERY_WORKER_CONCURRENCY=1  # 单进程，便于调试
```

```python
# executor.py
@app.task(
    ...
    autoretry_for=(),  # 禁用自动重试，立即看到错误
)
```

## 配置验证

### 1. 检查 Redis 连接

```bash
redis-cli -u $REDIS_URL ping
# 应该返回: PONG
```

### 2. 检查队列状态

```bash
redis-cli -u $REDIS_URL
> LLEN ai-education-task  # 查看队列长度
> KEYS celery*            # 查看 Celery 相关键
```

### 3. 检查 Worker 状态

```bash
# 启动 Worker 后，查看日志
tail -f tmp/logs/celery_worker.log

# 或使用 Flower
celery -A shared.worker.celery flower
# 访问 http://localhost:5555
```

## 配置调优指南

### 1. 超时时间调优

**问题**: 任务经常超时

**解决方案**:
- 分析任务执行时间，设置合理的 `TASK_TIMEOUT`
- 优化任务逻辑，减少执行时间
- 考虑将大任务拆分为多个小任务

### 2. 并发数调优

**问题**: Worker 利用率低或 CPU 占用过高

**解决方案**:
- CPU 密集型任务：并发数 = CPU 核心数
- IO 密集型任务：并发数 = CPU 核心数 × 2-4
- 混合型任务：根据实际情况调整

### 3. 内存使用调优

**问题**: Worker 内存占用过高

**解决方案**:
- 降低 `worker_max_tasks_per_child`，更频繁地重启子进程
- 检查任务中是否有内存泄漏
- 减少并发数

### 4. 队列积压调优

**问题**: 任务队列积压严重

**解决方案**:
- 增加 Worker 并发数
- 增加 Worker 实例数量
- 优化任务执行逻辑
- 考虑使用优先级队列

## 安全配置

### 1. Redis 密码保护

```bash
REDIS_URL=redis://:your-password@redis:6379/0
```

### 2. 任务结果敏感信息

任务结果可能包含敏感信息，建议：
- 设置合理的 `result_expires`，及时清理结果
- 不在结果中返回敏感数据
- 使用加密存储（如果需要）

### 3. 任务参数验证

确保任务参数经过验证：
- 使用 Pydantic 模型验证
- 检查参数类型和范围
- 防止注入攻击

## 故障排查配置

### 启用详细日志

```bash
# worker.py 启动参数
--loglevel=debug
```

### 启用任务跟踪

```python
# celery.py
task_track_started=True
task_send_sent_event=True
worker_send_task_events=True
```

### 禁用重试（调试用）

```python
# executor.py
@app.task(
    ...
    autoretry_for=(),  # 空元组，禁用自动重试
)
```

## 配置变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2024 | 初始配置 |
| | | - 基础 Celery 配置 |
| | | - Redis 作为 broker 和 backend |
| | | - JSON 序列化 |
| | | - 30分钟超时 |
| | | - 自动重试机制 |

## 参考资源

- [Celery 官方文档](https://docs.celeryq.dev/)
- [Celery 配置参考](https://docs.celeryq.dev/en/stable/userguide/configuration.html)
- [Redis 配置](https://redis.io/docs/manual/config/)

