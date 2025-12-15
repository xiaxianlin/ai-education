# Prompt 管理模块设计方案

## 1. 项目概述

Prompt 管理模块是一个轻量级的提示词管理系统，用于统一管理项目中各种 AI 任务的提示词模板，包括图片生成、音频生成、音频解析、题目生成、提示词优化等场景。

### 核心特性

- ✅ **版本管理**：支持 Prompt 的多版本管理，可发布/回滚版本
- ✅ **模板编辑**：支持变量占位符（`{variable}`）的模板编辑
- ✅ **测试沙箱**：提供测试接口，可实时预览渲染结果和调用响应
- ✅ **基础指标**：统计调用量、成功率、P95 耗时等基础指标
- ✅ **无审核流程**：简化设计，无需审核即可发布
- ✅ **无业务绑定**：不关联具体业务场景，保持通用性

### 技术栈

- **后端**：FastAPI + SQLAlchemy 2.0 + Python 3.12
- **前端**：React 18 + TypeScript 5 + Ant Design 5
- **数据库**：MySQL（通过 SQLAlchemy ORM）

## 2. 架构设计

### 2.1 目录结构

```
apps/
├── server/
│   ├── admin/
│   │   ├── routes/
│   │   │   └── prompt.py          # Prompt 路由
│   │   ├── services/
│   │   │   └── prompt.py           # Prompt 业务逻辑
│   │   └── schema.py               # Prompt Schema 定义
│   └── shared/
│       └── core/
│           ├── database.py         # Prompt 数据模型
│           └── schema.py           # Prompt 输出 Schema
└── admin-web/
    └── src/
        └── pages/
            └── Prompt/
                ├── List/            # 列表页
                ├── Form/            # 表单页（新建/编辑）
                └── Detail/           # 详情页（版本/测试/指标）
```

### 2.2 数据流

```
前端页面
  ↓
API 封装 (lib/api.ts)
  ↓
FastAPI 路由 (admin/routes/prompt.py)
  ↓
业务逻辑层 (admin/services/prompt.py)
  ↓
数据访问层 (SQLAlchemy ORM)
  ↓
MySQL 数据库
```

## 3. 数据模型

### 3.1 Prompt（提示词主表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| name | String(128) | 名称 |
| slug | String(128) | 唯一标识（用于代码引用） |
| category | String(64) | 分类（image_gen/audio_gen/question_gen 等） |
| description | Text | 描述 |
| tags | JSON | 标签数组 |
| status | Enum | 状态：draft/published/archived |
| current_version_id | Integer | 当前发布版本 ID |
| created_by | String(64) | 创建人 |
| updated_by | String(64) | 更新人 |
| created_at | Integer | 创建时间 |
| updated_at | Integer | 更新时间 |

### 3.2 PromptVersion（版本表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| prompt_id | Integer | Prompt ID（外键） |
| version_no | Integer | 版本号（1, 2, 3...） |
| template | Text | 模板内容（支持 `{variable}` 占位符） |
| system_prompt | Text | System Prompt（可选，用于文本生成类） |
| negative_prompt | Text | Negative Prompt（可选，用于图像生成类） |
| input_schema | JSON | 输入变量 Schema（定义必填字段、类型等） |
| sampling_params | JSON | 采样参数（temperature/top_p/steps 等） |
| timeout_ms | Integer | 超时时间（毫秒） |
| changelog | Text | 变更说明 |
| is_published | Boolean | 是否已发布 |
| created_by | String(64) | 创建人 |
| created_at | Integer | 创建时间 |

**唯一索引**：`(prompt_id, version_no)`

### 3.3 PromptTestRecord（测试记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| prompt_id | Integer | Prompt ID |
| version_id | Integer | 版本 ID |
| model_provider | String(64) | 模型提供方（openai/wenxin/sdxl 等） |
| model_name | String(128) | 模型名称 |
| input_payload | JSON | 输入变量数据 |
| rendered_prompt | Text | 渲染后的 Prompt |
| response_snapshot | JSON | 响应快照 |
| latency_ms | Integer | 耗时（毫秒） |
| status | String(32) | 状态（success/failed） |
| error | Text | 错误信息 |
| created_by | String(64) | 创建人 |
| created_at | Integer | 创建时间 |

## 4. API 设计

### 4.1 接口列表

#### Prompt CRUD

- `GET /api/admin/prompt` - 列表查询
  - Query: `keyword`, `category`, `status`, `tag`
  - Response: `PromptSchema[]`

- `POST /api/admin/prompt` - 创建 Prompt
  - Body: `CreatePromptSchema`（包含初始版本信息）
  - Response: `PromptSchema`

- `GET /api/admin/prompt/{pid}` - 获取详情
  - Response: `PromptSchema`（包含 `current_version`）

- `PATCH /api/admin/prompt/{pid}` - 更新基础信息
  - Body: `UpdatePromptSchema`
  - Response: `PromptSchema`

#### 版本管理

- `POST /api/admin/prompt/{pid}/versions` - 创建新版本
  - Body: `CreatePromptVersionSchema`
  - Response: `PromptVersionSchema`

- `GET /api/admin/prompt/{pid}/versions` - 版本列表
  - Response: `PromptVersionSchema[]`

- `POST /api/admin/prompt/{pid}/versions/{vid}/publish` - 发布版本
  - 将版本设为 `is_published=true`，更新 `prompt.current_version_id`
  - Response: `PromptSchema`

- `POST /api/admin/prompt/{pid}/versions/{vid}/archive` - 下线版本
  - 将版本设为 `is_published=false`，若为当前版本则清空 `current_version_id`
  - Response: `PromptVersionSchema`

#### 测试与指标

- `POST /api/admin/prompt/{pid}/versions/{vid}/test` - 测试版本
  - Body: `TestPromptSchema`（variables, model_provider, model_name）
  - 流程：校验必填变量 → 渲染模板 → 调用下游服务 → 记录测试记录
  - Response: `TestPromptResponse`（rendered_prompt, response, latency_ms, status）

- `GET /api/admin/prompt/{pid}/metrics` - 获取指标
  - Query: `version_id`（可选）
  - Response: `PromptMetrics`（calls, success_rate, p95_latency_ms）

### 4.2 Schema 定义

#### CreatePromptSchema

```python
class CreatePromptSchema(BaseModel):
    name: str
    slug: str
    category: str
    description: Optional[str] = None
    tags: List[str] = []
    # 初始版本信息
    template: str
    system_prompt: Optional[str] = None
    negative_prompt: Optional[str] = None
    input_schema: Dict[str, Any] = {}
    sampling_params: Dict[str, Any] = {}
    timeout_ms: Optional[int] = None
    changelog: Optional[str] = None
```

#### CreatePromptVersionSchema

```python
class CreatePromptVersionSchema(BaseModel):
    template: str
    system_prompt: Optional[str] = None
    negative_prompt: Optional[str] = None
    input_schema: Dict[str, Any] = {}
    sampling_params: Dict[str, Any] = {}
    timeout_ms: Optional[int] = None
    changelog: Optional[str] = None
```

#### TestPromptSchema

```python
class TestPromptSchema(BaseModel):
    variables: Dict[str, Any] = {}
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
```

## 5. 前端实现

### 5.1 页面结构

#### 列表页 (`/prompt`)

- 功能：展示 Prompt 列表，支持搜索和筛选
- 组件：`Prompt/List/index.tsx`
- 特性：
  - 表格展示：名称、Slug、分类、状态、当前版本
  - 搜索：关键词、分类、状态筛选
  - 操作：新建、查看详情

#### 表单页 (`/prompt/form/:id`)

- 功能：新建或编辑 Prompt 基础信息
- 组件：`Prompt/Form/index.tsx`
- 特性：
  - 新建时：基础信息 + 初始版本表单
  - 编辑时：仅基础信息表单
  - 组件拆分：
    - `PromptForm`：基础信息表单
    - `PromptVersionForm`：版本表单

#### 详情页 (`/prompt/detail/:id`)

- 功能：版本管理、测试沙箱、指标展示
- 组件：`Prompt/Detail/index.tsx`
- 特性：
  - **版本管理**：
    - 版本列表（版本号、发布状态、变更说明）
    - 创建新版本表单
    - 发布/下线操作
  - **测试沙箱**：
    - 输入变量 JSON
    - 指定模型提供方和模型名称
    - 查看渲染结果和响应
  - **基础指标**：
    - 调用量、成功率、P95 耗时
  - 组件：`PromptDetailSections`

### 5.2 组件拆分

```
Prompt/
├── List/
│   └── index.tsx                    # 列表页
├── Form/
│   └── index.tsx                     # 表单页
└── Detail/
    ├── index.tsx                     # 详情页入口
    └── components/
        ├── PromptForm.tsx            # 基础信息表单
        ├── PromptVersionForm.tsx     # 版本表单
        └── PromptDetailSections.tsx  # 详情页内容（版本/测试/指标）
```

### 5.3 API 封装

位置：`apps/admin-web/src/lib/api.ts`

```typescript
// Prompt 管理 API
adminApi.listPrompts(params)
adminApi.createPrompt(data)
adminApi.getPrompt(id)
adminApi.updatePrompt(id, data)
adminApi.createPromptVersion(promptId, data)
adminApi.listPromptVersions(promptId)
adminApi.publishPromptVersion(promptId, versionId)
adminApi.archivePromptVersion(promptId, versionId)
adminApi.testPromptVersion(promptId, versionId, data)
adminApi.getPromptMetrics(promptId, versionId?)
```

## 6. 核心功能实现

### 6.1 模板渲染

使用 Python `str.format()` 方法进行模板渲染：

```python
def _render_prompt(template: str, variables: Dict[str, Any]) -> str:
    try:
        return template.format(**variables)
    except KeyError as e:
        raise ValueError(f"缺少变量: {e.args[0]}") from e
```

**占位符格式**：`{variable}`

**示例**：
```python
template = "生成 {count} 道 {subject} 题目，难度为 {difficulty}"
variables = {"count": 5, "subject": "数学", "difficulty": "中等"}
# 结果：生成 5 道 数学 题目，难度为 中等
```

### 6.2 必填变量校验

通过 `input_schema.required` 字段定义必填变量：

```python
def _validate_required(input_schema: dict, variables: Dict[str, Any]):
    required = input_schema.get("required", []) if isinstance(input_schema, dict) else []
    for field in required:
        if field not in variables or variables[field] in (None, ""):
            raise ValueError(f"缺少必填变量: {field}")
```

**示例 Schema**：
```json
{
  "required": ["subject", "grade"],
  "properties": {
    "subject": {"type": "string", "description": "科目"},
    "grade": {"type": "integer", "description": "年级"}
  }
}
```

### 6.3 版本发布流程

1. 创建新版本：`version_no` 自动递增
2. 发布版本：
   - 设置 `is_published = true`
   - 更新 `prompt.current_version_id = version_id`
   - 将其他版本设为 `is_published = false`
3. 下线版本：
   - 设置 `is_published = false`
   - 若为当前版本，清空 `prompt.current_version_id`

### 6.4 测试沙箱流程

1. 接收测试请求：`variables`, `model_provider`, `model_name`
2. 校验必填变量：根据 `input_schema.required` 校验
3. 渲染模板：使用 `template.format(**variables)`
4. 调用下游服务：**（当前为占位实现，需接入真实服务）**
5. 记录测试记录：保存到 `PromptTestRecord` 表
6. 返回结果：渲染后的 Prompt、响应、耗时、状态

## 7. 使用说明

### 7.1 创建 Prompt

1. 进入「提示词管理」列表页
2. 点击「新建提示词」
3. 填写基础信息：
   - 名称：提示词名称
   - Slug：唯一标识（创建后不可修改）
   - 分类：如 `image_gen`、`audio_gen`、`question_gen` 等
   - 标签：逗号分隔
   - 描述：可选
4. 填写初始版本信息：
   - Template：模板内容（使用 `{variable}` 占位）
   - System Prompt：可选
   - Negative Prompt：可选
   - Input Schema：JSON 格式，定义变量 Schema
   - Sampling Params：JSON 格式，采样参数
   - Timeout：超时时间（毫秒）
   - 变更说明：版本说明
5. 点击「创建 Prompt」

### 7.2 管理版本

1. 进入 Prompt 详情页
2. 在「版本管理」中：
   - **查看版本**：点击「查看」按钮，查看版本详情
   - **创建新版本**：填写版本表单，点击「创建版本」
   - **发布版本**：点击「发布」按钮，将版本设为当前版本
   - **下线版本**：点击「下线」按钮，取消发布

### 7.3 测试 Prompt

1. 进入 Prompt 详情页
2. 在「测试沙箱」中：
   - 填写变量 JSON：如 `{"subject": "math", "grade": 6}`
   - 填写模型提供方：如 `openai`、`wenxin`、`sdxl` 等
   - 填写模型名称：如 `gpt-4o-mini`、`sdxl` 等
   - 点击「立即测试」
3. 查看结果：
   - 渲染后的 Prompt
   - 模型响应
   - 耗时
   - 状态

### 7.4 查看指标

在 Prompt 详情页的「指标」标签中查看：
- 调用量：总调用次数
- 成功率：成功调用占比
- P95 耗时：95% 请求的耗时

## 8. 数据库迁移

### 8.1 表结构

```sql
-- Prompt 表
CREATE TABLE `ah_prompt` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `slug` varchar(128) NOT NULL UNIQUE,
  `category` varchar(64) NOT NULL,
  `description` text,
  `tags` json DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `current_version_id` int DEFAULT NULL,
  `created_by` varchar(64) DEFAULT NULL,
  `updated_by` varchar(64) DEFAULT NULL,
  `created_at` int DEFAULT NULL,
  `updated_at` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PromptVersion 表
CREATE TABLE `ah_prompt_version` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prompt_id` int NOT NULL,
  `version_no` int NOT NULL,
  `template` text NOT NULL,
  `system_prompt` text,
  `negative_prompt` text,
  `input_schema` json DEFAULT NULL,
  `sampling_params` json DEFAULT NULL,
  `timeout_ms` int DEFAULT NULL,
  `changelog` text,
  `is_published` tinyint(1) DEFAULT 0,
  `created_by` varchar(64) DEFAULT NULL,
  `created_at` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_prompt_version` (`prompt_id`, `version_no`),
  KEY `idx_prompt_id` (`prompt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PromptTestRecord 表
CREATE TABLE `ah_prompt_test_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prompt_id` int NOT NULL,
  `version_id` int NOT NULL,
  `model_provider` varchar(64) DEFAULT NULL,
  `model_name` varchar(128) DEFAULT NULL,
  `input_payload` json DEFAULT NULL,
  `rendered_prompt` text,
  `response_snapshot` json DEFAULT NULL,
  `latency_ms` int DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  `error` text,
  `created_by` varchar(64) DEFAULT NULL,
  `created_at` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prompt_id` (`prompt_id`),
  KEY `idx_version_id` (`version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 8.2 初始化

表结构通过 SQLAlchemy ORM 自动创建（`init_database()`），无需手动执行 SQL。

## 9. 后续迭代建议

### 9.1 功能增强

- **模板编辑器**：
  - 集成 Monaco Editor 或 CodeMirror，提供语法高亮
  - 支持变量自动补全
  - 模板预览功能

- **版本对比**：
  - 支持两个版本的模板对比（Diff）
  - 参数对比可视化

- **指标增强**：
  - 调用趋势图（按时间）
  - 按版本统计指标
  - 错误分析（错误类型分布）

- **权限控制**：
  - 细粒度权限（创建/编辑/发布/删除）
  - 操作日志记录

### 9.2 集成优化

- **模型服务集成**：
  - 接入真实的图片生成服务（SDXL、Midjourney 等）
  - 接入音频生成服务
  - 接入文本生成服务（OpenAI、文心等）

- **业务绑定**：
  - 支持场景绑定（lesson_planning、quiz_generation 等）
  - 支持环境配置（prod/staging/dev）
  - 灰度发布支持

### 9.3 性能优化

- **缓存**：
  - 当前版本缓存
  - 指标数据缓存

- **批量操作**：
  - 批量创建版本
  - 批量测试

## 10. 注意事项

1. **Slug 唯一性**：创建后不可修改，需谨慎命名
2. **版本号管理**：自动递增，不支持手动指定
3. **测试服务**：当前测试接口为占位实现，需接入真实模型服务
4. **权限控制**：所有接口需要管理员鉴权（`x-access-token`）
5. **模板格式**：使用 Python `str.format()` 语法，注意特殊字符转义

## 11. 相关文档

- [API 接口文档](./API.md)
- [前端组件规范](../.cursor/rules/react-frontend/)
- [后端服务规范](../.cursor/rules/python-backend/)

