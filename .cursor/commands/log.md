# 读取日志命令 (@log)

读取应用日志文件（app.log 和 error.log），日志目录从 `.env` 文件的 `LOG_DIR` 配置读取。

## 使用方法

使用 `@log` 命令时，我会：

1. 从 `apps/server/.env` 文件读取 `LOG_DIR` 配置
2. 读取 `{LOG_DIR}/app.log` 文件（应用日志）
3. 读取 `{LOG_DIR}/error.log` 文件（错误日志）
4. 显示日志内容

## 日志文件说明

- **app.log**: 记录所有应用级别的日志（INFO、WARNING、DEBUG）
- **error.log**: 记录所有错误级别的日志（ERROR及以上），包含完整的堆栈跟踪

## 示例

当用户使用 `@log` 命令时，我会执行以下操作：

```python
# 1. 读取 .env 文件获取 LOG_DIR
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path("apps/server/.env")
if env_path.exists():
    load_dotenv(env_path)
    log_dir = os.getenv("LOG_DIR", "./logs")
else:
    # 如果 .env 不存在，尝试从项目根目录读取
    env_path = Path(".env")
    if env_path.exists():
        load_dotenv(env_path)
        log_dir = os.getenv("LOG_DIR", "./logs")
    else:
        log_dir = "./logs"  # 默认值

# 2. 读取日志文件
app_log_path = Path(log_dir) / "app.log"
error_log_path = Path(log_dir) / "error.log"

# 3. 显示日志内容
if app_log_path.exists():
    with open(app_log_path, "r", encoding="utf-8") as f:
        app_log_content = f.read()
    print("=== app.log ===")
    print(app_log_content)
else:
    print(f"app.log 不存在: {app_log_path}")

if error_log_path.exists():
    with open(error_log_path, "r", encoding="utf-8") as f:
        error_log_content = f.read()
    print("\n=== error.log ===")
    print(error_log_content)
else:
    print(f"error.log 不存在: {error_log_path}")
```

## 注意事项

- 日志目录路径从 `.env` 文件的 `LOG_DIR` 环境变量读取
- 如果 `.env` 文件不存在或未配置 `LOG_DIR`，默认使用 `./logs` 目录
- 如果日志文件不存在，会显示相应的提示信息
- 日志文件可能很大，建议使用 tail 或限制行数来查看最新日志

## 相关配置

日志配置相关环境变量（在 `.env` 文件中）：
- `LOG_DIR`: 日志目录路径（必需）
- `LOG_LEVEL`: 日志级别（DEBUG/INFO/WARNING/ERROR）
- `LOG_FORMAT`: 日志格式（text/json）

## 相关文档

- 日志系统使用指南: `apps/server/shared/core/logger/README.md`
- 日志配置: `apps/server/shared/core/logger.py`
- 环境配置: `apps/server/shared/core/settings.py`
