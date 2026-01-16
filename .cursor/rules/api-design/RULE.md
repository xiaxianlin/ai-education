---
description: "API 设计规范，包含 RESTful 设计、请求响应格式、错误处理和认证"
alwaysApply: true
---

# API 设计规范

## RESTful API 设计原则

### 路由命名
- 使用名词，不使用动词
- **遵循项目现有约定**：本仓库当前资源路径多使用**单数**（例如 `/textbook`, `/unit`, `/student`），新增接口请保持一致
- 使用嵌套路由表示资源关系

```
GET    /api/admin/unit/search            # 搜索单元（项目中常用 search 风格）
POST   /api/admin/unit/                  # 创建单元
PATCH  /api/admin/unit/{id}              # 更新单元
DELETE /api/admin/unit/{id}              # 删除单元
GET    /api/admin/unit/{id}/knowledges   # 获取单元下的知识点
```

### HTTP 方法
- `GET`: 获取资源（幂等）
- `POST`: 创建资源
- `PATCH`: 部分更新资源
- `PUT`: 完整更新资源（本项目不使用）
- `DELETE`: 删除资源

## 请求和响应格式

### 请求格式
- 使用 Pydantic Schema 进行数据验证
- 请求体使用 JSON 格式
- 查询参数使用 URL 参数

```python
# Schema 定义
class CreateUnitSchema(BaseModel):
    name: str
    textbook_id: int
    order: int | None = None

# 路由使用
@router.post("/")
async def create_unit(
    params: CreateUnitSchema,
    db: AsyncSession = Database
):
    return await unit.create_unit(db, params)
```

### 响应格式
- 本项目 Web 端默认使用统一的响应包装器 `ApiResponse<T>`
- `@ai-education/shared-web` 的 `ApiClient` 会自动取 `response.data.data` 作为业务返回值
- 错误响应使用 HTTP 状态码和错误详情

```python
# 成功响应（后端返回）
{
  "status": 0,
  "message": "ok",
  "data": {
    "id": 1,
    "name": "单元名称",
    "textbook_id": 1
  }
}

# 前端实际获取到的值（ApiClient 自动提取）
{
  "id": 1,
  "name": "单元名称",
  "textbook_id": 1
}

# 错误响应（由异常处理器自动生成）
{
  "detail": "资源不存在"
}
```

**注意**: 
- 后端返回格式统一为 `{ status: 0, message: "ok", data: T }`
- 前端 `ApiClient` 会自动提取 `data` 字段，业务代码直接使用数据对象
- `status !== 0` 时会抛出错误，错误信息在 `message` 字段
- **GET 请求参数**: `ApiClient.get()` 方法的第二个参数是查询参数字典，直接传递对象，不要嵌套在 `params` 字段中
  ```typescript
  // ✅ 正确
  apiClient.get("/ability/atomics", { subject, grade });
  
  // ❌ 错误
  apiClient.get("/ability/atomics", { params: { subject, grade } });
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

### 错误响应格式
```json
{
  "detail": "错误描述信息"
}
```

### 异常处理
- 业务错误使用 `ValueError` 抛出
- HTTP 错误使用 `HTTPException` 抛出
- 所有异常由全局异常处理器统一处理

```python
# 业务逻辑中
if not resource:
    raise ValueError("资源不存在")

# 路由层会自动转换为 HTTPException (404)
```

## 认证和授权

### 认证方式
- 使用 JWT Token 进行认证
- Token 通过请求头 `x-access-token` 传递
- 管理端和学生端使用不同的认证中间件
- Token 存储位置：
  - 管理端（admin-web）: `localStorage.getItem('_token_')`（`ApiClient` 默认值）
  - 学生端（student-web）: `localStorage.getItem('_token_')`（`ApiClient` 默认值）

```python
# 管理端认证
from admin.services.auth import admin_route_filter

admin_app = FastAPI(
    dependencies=[Depends(admin_route_filter)],
)

# 学生端认证
from student.services.auth import student_router_filter

student_app = FastAPI(
    dependencies=[Depends(student_router_filter)],
)
```

### 认证信息获取
```python
# 在路由中获取认证信息
@router.get("/profile")
async def get_profile(request: Request):
    manager = request.state.manager  # 管理端
    # 或
    student = request.state.student   # 学生端
```

## 数据验证

### 使用 Pydantic Schema
- 所有请求和响应都使用 Pydantic Schema
- Schema 定义在 `schema.py` 文件中
- 使用类型提示确保类型安全

```python
from pydantic import BaseModel, Field

class CreateUnitSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    textbook_id: int = Field(..., gt=0)
    order: int | None = Field(None, ge=0)
```

## 分页和过滤

### 分页参数
```python
@router.get("/")
async def list_units(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Database
):
    # 实现分页逻辑
    pass
```

### 响应格式
```json
{
  "list": [...],
  "total": 100,
  "page": 1,
  "page_size": 10
}
```

## 版本控制

- API 路径中包含版本信息：`/api/admin/...` 和 `/api/student/...`
- 管理端和学生端使用不同的路径前缀

## 注意事项

1. **类型安全**: 所有请求和响应都使用 Pydantic Schema
2. **错误处理**: 统一的异常处理机制
3. **认证**: 所有需要认证的端点必须使用认证中间件
4. **日志记录**: 关键操作记录日志
5. **性能**: 考虑使用缓存和查询优化
