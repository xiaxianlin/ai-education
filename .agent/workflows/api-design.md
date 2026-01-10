---
description: API 设计规范，包含 RESTful 设计、请求响应格式、错误处理和认证
---

# API 设计规范

## RESTful API 设计原则

### 路由命名

- 使用名词，不使用动词
- 资源路径使用单数（如 `/textbook`, `/unit`, `/student`）
- 使用嵌套路由表示资源关系

```
GET    /api/admin/unit/search            # 搜索单元
POST   /api/admin/unit/                  # 创建单元
PATCH  /api/admin/unit/{id}              # 更新单元
DELETE /api/admin/unit/{id}              # 删除单元
GET    /api/admin/unit/{id}/knowledges   # 获取单元下的知识点
```

### HTTP 方法

- `GET`: 获取资源（幂等）
- `POST`: 创建资源
- `PATCH`: 部分更新资源
- `DELETE`: 删除资源

## 请求和响应格式

### 响应格式

```python
# 成功响应
{
  "status": 0,
  "message": "ok",
  "data": { ... }
}

# 错误响应
{
  "detail": "错误描述信息"
}
```

**注意**: 前端 `ApiClient` 会自动提取 `data` 字段。

### 分页响应

```json
{
  "list": [...],
  "total": 100,
  "page": 1,
  "page_size": 10
}
```

## 错误处理

### HTTP 状态码

- `200 OK`: 成功
- `201 Created`: 创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证
- `403 Forbidden`: 无权限
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器错误

### 异常处理

```python
# 业务错误
if not resource:
    raise ValueError("资源不存在")

# HTTP 错误
raise HTTPException(status_code=404, detail="资源不存在")
```

## 认证和授权

- 使用 JWT Token 认证
- Token 通过请求头 `x-access-token` 传递
- 管理端和学生端使用不同的认证中间件

```python
# 获取认证信息
@router.get("/profile")
async def get_profile(request: Request):
    manager = request.state.manager  # 管理端
    student = request.state.student   # 学生端
```

## 数据验证

```python
from pydantic import BaseModel, Field

class CreateUnitSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    textbook_id: int = Field(..., gt=0)
    order: int | None = Field(None, ge=0)
```
