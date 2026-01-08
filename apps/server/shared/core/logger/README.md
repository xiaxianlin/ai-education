# 日志系统使用指南

## 概述

本项目的日志系统基于 `loguru` 构建，提供了完整的日志记录、分类和性能监控功能。

## 日志配置

### 环境变量

在 `.env` 文件中可以配置以下日志相关变量：

- `LOG_LEVEL`: 日志级别（DEBUG/INFO/WARNING/ERROR），默认根据环境自动设置
  - 开发环境：DEBUG
  - 生产环境：INFO
  - 测试环境：WARNING

- `LOG_FORMAT`: 日志格式（text/json），默认根据环境自动设置
  - 开发环境：text（人类可读）
  - 生产环境：json（便于分析）

- `LOG_SQL_ENABLED`: 是否启用SQL日志（默认false）
  - 开发环境可以设置为 `true` 来记录所有SQL查询
  - 生产环境建议保持 `false`，只记录慢查询

- `LOG_PERFORMANCE_ENABLED`: 是否启用性能日志（默认true）
  - 记录请求耗时和慢请求

- `LOG_SLOW_QUERY_THRESHOLD`: 慢查询阈值（毫秒，默认1000）
  - 超过此阈值的SQL查询会被记录为慢查询

- `LOG_SLOW_REQUEST_THRESHOLD`: 慢请求阈值（毫秒，默认2000）
  - 超过此阈值的HTTP请求会被记录为慢请求

## 日志分类

日志系统将日志分为以下几类，分别存储在不同的文件中：

### 1. app.log - 应用日志

记录所有应用级别的日志（INFO、WARNING、DEBUG）。

**使用示例：**

```python
from shared.core.logger import logger

logger.info("用户登录成功")
logger.warning("缓存未命中")
logger.debug("调试信息")
```

### 2. error.log - 错误日志

记录所有错误级别的日志（ERROR及以上），包含完整的堆栈跟踪。

**使用示例：**

```python
from shared.core.logger import logger, log_error

# 方式1：使用 logger
try:
    # 业务逻辑
    pass
except Exception as e:
    logger.exception("处理失败")

# 方式2：使用 log_error（推荐，包含上下文）
log_error("处理失败", exc=e, user_id=user_id, operation="create_question")
```

### 3. access.log - 访问日志

记录所有HTTP请求和响应信息，由 `LoggingMiddleware` 自动记录。

**包含信息：**
- 请求路径、方法
- 请求ID
- 用户ID（如果已认证）
- 响应状态码
- 请求耗时

### 4. performance.log - 性能日志

记录性能相关的指标，由 `PerformanceMiddleware` 自动记录。

**包含信息：**
- 请求耗时
- 慢请求（超过阈值）
- 自定义性能指标

**使用示例：**

```python
from shared.core.logger import log_performance

log_performance("database_query", value=150.5, unit="ms", query="SELECT * FROM users")
```

### 5. sql.log - SQL日志（可选）

当 `LOG_SQL_ENABLED=true` 时启用，记录所有SQL查询。

**使用示例：**

```python
from shared.core.logger import log_sql, print_sql

# 方式1：使用 log_sql（推荐）
log_sql("SELECT * FROM users WHERE id = ?", duration=0.05, params={"id": 1})

# 方式2：使用 print_sql（兼容旧代码）
print_sql(query, duration=0.05)
```

## 日志级别使用指南

### DEBUG

用于详细的调试信息，通常只在开发环境使用。

```python
logger.debug("变量值: {}", variable_value)
logger.debug("函数参数: {}", params)
```

### INFO

用于记录重要的业务事件和流程。

```python
logger.info("用户 {} 登录成功", user_id)
logger.info("题目生成完成，共 {} 道", count)
```

### WARNING

用于记录可能的问题，但不影响系统正常运行。

```python
logger.warning("缓存未命中，从数据库查询")
logger.warning("目标生成 {} 道题目，实际生成 {} 道", target, actual)
```

### ERROR

用于记录错误，需要关注和修复。

```python
logger.error("数据库连接失败")
logger.exception("处理请求时发生异常")
```

## 结构化日志

### 文本格式（开发环境）

```
2024-01-01 12:00:00.123 | INFO     | req-123 | admin.question:create_question:45 - 题目创建成功
```

### JSON格式（生产环境）

```json
{
  "time": "2024-01-01T12:00:00.123",
  "level": "INFO",
  "request_id": "req-123",
  "user_id": "user-456",
  "module": "admin.question",
  "function": "create_question",
  "line": 45,
  "message": "题目创建成功",
  "path": "/api/admin/question",
  "method": "POST"
}
```

## 请求上下文

日志系统自动管理请求上下文，包括：

- `request_id`: 每个请求的唯一标识
- `user_id`: 当前用户ID（如果已认证）
- `path`: 请求路径
- `method`: HTTP方法

这些信息会自动添加到所有日志记录中。

**手动设置上下文：**

```python
from shared.core.logger import set_request_context, clear_request_context

# 设置上下文
set_request_context(
    request_id="req-123",
    user_id="user-456",
    path="/api/admin/question",
    method="POST"
)

# 清除上下文
clear_request_context()
```

## 便捷函数

### log_request()

记录请求信息。

```python
from shared.core.logger import log_request

log_request(
    path="/api/admin/question",
    method="POST",
    request_id="req-123",
    user_id="user-456"
)
```

### log_response()

记录响应信息。

```python
from shared.core.logger import log_response

log_response(
    path="/api/admin/question",
    method="POST",
    status_code=200,
    duration=0.15,
    request_id="req-123"
)
```

### log_error()

记录错误（带上下文）。

```python
from shared.core.logger import log_error

try:
    # 业务逻辑
    pass
except Exception as e:
    log_error(
        "处理失败",
        exc=e,
        user_id=user_id,
        operation="create_question",
        question_id=question_id
    )
```

### log_performance()

记录性能指标。

```python
from shared.core.logger import log_performance

log_performance(
    metric="database_query",
    value=150.5,
    unit="ms",
    query="SELECT * FROM users",
    table="users"
)
```

### log_sql()

记录SQL查询。

```python
from shared.core.logger import log_sql

log_sql(
    query="SELECT * FROM users WHERE id = ?",
    duration=0.05,
    params={"id": 1},
    is_slow=False
)
```

## 最佳实践

### 1. 使用合适的日志级别

- **DEBUG**: 详细的调试信息
- **INFO**: 重要的业务事件
- **WARNING**: 可能的问题
- **ERROR**: 需要关注的错误

### 2. 包含足够的上下文信息

```python
# 不好
logger.error("处理失败")

# 好
log_error("处理失败", exc=e, user_id=user_id, operation="create_question", question_id=question_id)
```

### 3. 使用结构化日志

尽量使用便捷函数（`log_error`, `log_performance` 等），它们会自动添加上下文信息。

### 4. 敏感信息脱敏

不要在日志中记录敏感信息（密码、token等）。系统会自动对敏感字段进行脱敏处理。

```python
# 不好
logger.info("用户密码: {}", password)

# 好
logger.info("用户登录: {}", username)
```

### 5. 异常处理

使用 `logger.exception()` 或 `log_error()` 来记录异常，它们会自动包含堆栈跟踪。

```python
try:
    # 业务逻辑
    pass
except Exception as e:
    log_error("处理失败", exc=e, **context)
```

### 6. 性能日志

对于关键操作，记录性能指标：

```python
import time
from shared.core.logger import log_performance

start_time = time.time()
# 执行操作
duration = time.time() - start_time
log_performance("operation_duration", duration * 1000, unit="ms", operation="create_question")
```

## 日志文件管理

### 开发环境

- 每次启动时覆盖旧日志文件
- 所有日志文件都在 `LOG_DIR` 目录下

### 生产环境

- 自动日志轮转（rotation）
- 自动压缩旧日志（compression）
- 自动清理过期日志（retention）
- 异步写入（enqueue），不影响性能

### 日志保留策略

- `app.log`: 保留10天
- `error.log`: 保留30天
- `access.log`: 保留10天
- `performance.log`: 保留7天
- `sql.log`: 保留7天

## 故障排查

### 1. 日志文件未生成

检查 `LOG_DIR` 环境变量是否正确配置，确保目录有写权限。

### 2. 日志格式不正确

检查 `LOG_FORMAT` 环境变量，确保值为 `text` 或 `json`。

### 3. 日志级别不正确

检查 `LOG_LEVEL` 环境变量，确保值为 `DEBUG`、`INFO`、`WARNING` 或 `ERROR`。

### 4. 性能日志未记录

检查 `LOG_PERFORMANCE_ENABLED` 是否为 `true`，并确保 `PerformanceMiddleware` 已注册。

## 示例代码

### 完整的业务逻辑日志示例

```python
from shared.core.logger import logger, log_error, log_performance
import time

async def create_question(db, params):
    start_time = time.time()
    question_id = None
    
    try:
        logger.info("开始创建题目", question_type=params.question_type, count=params.count)
        
        # 业务逻辑
        question = await service.create(db, params)
        question_id = question.id
        
        duration = time.time() - start_time
        log_performance("create_question", duration * 1000, unit="ms", question_id=question_id)
        
        logger.info("题目创建成功", question_id=question_id)
        return question
        
    except ValueError as e:
        log_error("业务逻辑错误", exc=e, question_type=params.question_type, operation="create_question")
        raise
    except Exception as e:
        log_error("创建题目失败", exc=e, question_id=question_id, operation="create_question")
        raise
```

## 相关文件

- `shared/core/logger.py`: 日志系统核心实现
- `shared/core/middleware/logging.py`: 请求日志中间件
- `shared/core/middleware/performance.py`: 性能监控中间件
- `shared/core/exception.py`: 异常处理和日志记录
- `shared/core/settings.py`: 日志配置
