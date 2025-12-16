# API 调试与联调 (@api)

我现在专注于**API 接口的查看、调试和前后端联调**。

## 我的目标

- 明确当前后端服务的启动方式和访问地址
- 快速定位某个接口对应的后端路由/服务代码
- 帮你构造请求参数（含鉴权）、调试接口，并根据响应调整前端/移动端逻辑

## 后端服务入口

- **代码目录**: `apps/server/`
- **开发启动（推荐）**:

```bash
cd apps/server
uv run main.py          # 启动 FastAPI 单体服务（含管理端 & 学生端）
```

> 如需只启动 API，也可以使用：
>
> ```bash
> cd apps/server
> uvicorn main:app --reload --port 7890
> ```

## 常见 API 前缀

- 管理端接口: `/api/admin/...`
- 学生端接口: `/api/student/...`

对应代码位置示例：

- 管理端路由: `apps/server/admin/routes/*.py`
- 学生端路由: `apps/server/student/routes/*.py`
- 公共模型与工具: `apps/server/shared/core/`, `apps/server/shared/utils/`

## 如何与我协作调试 API

- 告诉我你要调的接口路径（例如：`/api/admin/prompt/list`）和请求方式（GET/POST/PATCH/DELETE）
- 告诉我你当前是哪一端：
  - 管理端前端 (`apps/admin-web`)
  - 学生端 Web (`apps/student-web`)
  - 学生端 App (`apps/student-app`)
- 如果有现有的请求代码（前端 axios / Flutter Dio 等），可以贴给我，我会：
  - 对照后端路由与 Schema，校对参数和类型
  - 帮你完善错误处理和类型定义
  - 给出联调时的典型请求/响应示例

## 相关文档与规则

- 后端整体说明: `apps/server/AGENTS.md`
- API 设计规范: `.cursor/rules/api-design/RULE.md`
- 后端编码规范: `.cursor/rules/python-backend/RULE.md`


