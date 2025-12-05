# API 服务开发模式 (@server-api)

我现在专注于**API 服务 (server-api)** 的开发工作。

## 服务概述

API 服务是后端的主要服务，提供管理端和学生端的 API 接口，处理业务逻辑和数据库操作。

## 技术栈

- **框架**: FastAPI 0.115+
- **语言**: Python 3.12
- **数据库**: MySQL (SQLAlchemy 2.0 异步 ORM)
- **缓存**: Redis
- **认证**: JWT (PyJWT)
- **验证**: Pydantic
- **AI**: 阿里云百炼AI (DashScope SDK)
- **存储**: 阿里云 OSS
- **日志**: Loguru

## 工作目录

- `apps/server-api/` - API 服务源代码
  - `admin/` - 管理端 API
  - `student/` - 学生端 API
  - `core/` - 核心模块（数据库、配置、中间件）
  - `shared/` - 共享模块（工具、服务）

## 开发原则

1. **分层架构**: 路由层 → 服务层 → 数据层
2. **异步优先**: 使用 `async/await` 处理异步操作
3. **类型安全**: 使用 Pydantic 进行数据验证
4. **错误处理**: 统一的异常处理机制
5. **安全性**: 认证、授权、数据验证

## 注意事项

- 使用异步 SQLAlchemy 操作
- 所有数据库操作都要 commit
- 使用 Pydantic 验证输入数据
- 遵循 RESTful API 设计规范
- 使用 Loguru 记录日志

