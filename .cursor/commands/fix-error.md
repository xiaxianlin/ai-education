# 修复错误命令 (@fix-error)

读取 error.log 文件并分析修复其中的错误。

## 使用方法

使用 `@fix-error` 命令时，我会：

1. 从 `apps/server/.env` 文件读取 `LOG_DIR` 配置
2. 在根目录读取 `{LOG_DIR}/error.log` 文件
3. 分析错误日志中的错误信息
4. 定位相关代码文件
5. 提供修复方案并实施修复

## 日志文件说明

- **error.log**: 记录所有错误级别的日志（ERROR及以上），包含完整的堆栈跟踪

## 执行步骤

当用户使用 `@fix-error` 命令时，我会执行以下操作：

### 1. 读取错误日志

```python
# 读取 .env 文件获取 LOG_DIR
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path("apps/server/.env")
if env_path.exists():
    load_dotenv(env_path)
    log_dir = os.getenv("LOG_DIR", "./logs")
else:
    log_dir = "./logs"  # 默认值

# 读取 error.log
error_log_path = Path(log_dir) / "error.log"
```

### 2. 分析错误

- 解析错误堆栈跟踪
- 识别错误类型和错误消息
- 定位错误发生的文件和行号

### 3. 修复错误

- 读取相关源代码文件
- 分析错误原因
- 提供并实施修复方案

## 注意事项

- 日志目录路径从 `.env` 文件的 `LOG_DIR` 环境变量读取
- 如果 `.env` 文件不存在或未配置 `LOG_DIR`，默认使用 `./logs` 目录
- 如果日志文件为空或不存在，会提示无错误需要修复
- 修复完成后建议重新运行应用验证修复效果

## 相关文档

- 日志系统使用指南: `apps/server/shared/core/logger/README.md`
- 日志配置: `apps/server/shared/core/logger.py`
- 环境配置: `apps/server/shared/core/settings.py`
