# AI Education Platform - API接口文档

> 本文档基于后端实际代码生成，最后更新时间：2024-12-21

## 目录

- [通用说明](#通用说明)
- [管理端接口](#管理端接口)
  - [认证管理](#认证管理)
  - [管理员管理](#管理员管理)
  - [教材管理](#教材管理)
  - [教师用书管理](#教师用书管理)
  - [单元管理](#单元管理)
  - [知识点管理](#知识点管理)
  - [题目管理](#题目管理)
  - [题型管理](#题型管理)
  - [学生管理](#学生管理)
  - [练习管理](#练习管理)
  - [配置管理](#配置管理)
  - [Prompt 管理](#prompt-管理)
- [学生端接口](#学生端接口)
  - [学生认证](#学生认证)
  - [学生资料](#学生资料)
  - [教材功能](#教材功能)
  - [练习功能](#练习功能)

---

## 通用说明

### 基础URL

- **管理端**: `http://your-domain/api/admin`
- **学生端**: `http://your-domain/api/student`

### API 文档访问

FastAPI 自动生成的 OpenAPI 文档可通过以下地址访问：

- **管理端 API 文档**: `http://localhost:7890/api/admin/docs`
- **学生端 API 文档**: `http://localhost:7890/api/student/docs`
- **管理端 OpenAPI JSON**: `http://localhost:7890/api/admin/openapi.json`
- **学生端 OpenAPI JSON**: `http://localhost:7890/api/student/openapi.json`

**注意**: 由于项目使用 `app.mount()` 挂载子应用，根路径 `/docs` 和 `/openapi.json` 不会显示路由信息。请访问上述子应用的文档地址。

### 认证方式

所有接口（除登录接口外）都需要在请求头中携带JWT Token：

```
Authorization: Bearer {token}
```

### 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 错误码说明

- `0`: 成功
- `400`: 请求参数错误
- `401`: 未授权（未登录或token失效）
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 管理端接口

### 认证管理

#### 检查登录状态

```
GET /api/admin/check
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "id": "manager_xxx",
    "username": "admin",
    "type": 1,
    "status": 0,
    "create_time": 1234567890
  }
}
```

#### 管理员登录

```
POST /api/admin/login
```

**请求参数**:

```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "manager": {
      "id": "manager_xxx",
      "username": "admin",
      "type": 1
    }
  }
}
```

#### 修改密码

```
POST /api/admin/modify_password
```

**请求参数**:

```json
{
  "origin": "old_password",
  "password": "new_password"
}
```

---

### 管理员管理

#### 获取所有管理员

```
GET /api/admin/manager/all
```

**响应示例**:

```json
{
  "code": 0,
  "data": [
    {
      "id": "manager_xxx",
      "username": "admin",
      "type": 1,
      "status": 0,
      "create_time": 1234567890
    }
  ]
}
```

#### 创建管理员

```
POST /api/admin/manager/
```

**请求参数**:

```json
{
  "username": "new_admin",
  "type": 1
}
```

**参数说明**:

- `type`: 管理员类型，1-普通管理员，2-超级管理员

#### 重置管理员密码

```
POST /api/admin/manager/{id}/reset
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "password": "new_random_password"
  }
}
```

#### 更新管理员

```
PATCH /api/admin/manager/{id}
```

**请求参数**:

```json
{
  "type": 1,
  "status": 0
}
```

**参数说明**:

- `type`: 管理员类型（可选）
- `status`: 状态（可选，0-正常，1-禁用）

#### 删除管理员

```
DELETE /api/admin/manager/{id}
```

---

### 教材管理

#### 创建教材

```
POST /api/admin/textbook/
```

**请求参数**:

```json
{
  "subject": "数学",
  "version": "人教版",
  "grade": 1,
  "semester": "上学期"
}
```

**参数说明**:

- `subject`: 科目（数学/英语）
- `version`: 版本（人教版等）
- `grade`: 年级（1-12）
- `semester`: 学期（上学期/下学期/整学期）

#### 上传教材文件

```
POST /api/admin/textbook/{id}/upload
```

**请求类型**: `multipart/form-data`

**请求参数**:

- `file`: PDF文件

#### 解析教材文件

```
POST /api/admin/textbook/{id}/parse
```

**功能说明**: 使用AI解析上传的教材PDF，自动提取单元和知识点。

#### 修改教材信息

```
PATCH /api/admin/textbook/{id}
```

**请求参数**:

```json
{
  "subject": "数学",
  "version": "人教版",
  "grade": 1,
  "semester": "上学期"
}
```

#### 删除教材

```
DELETE /api/admin/textbook/{id}
```

**权限要求**: 需要超级管理员权限

#### 搜索教材

```
GET /api/admin/textbook/search?subject=数学&grade=3&version=人教版
```

**查询参数**:

- `keyword`: 搜索关键词（可选）
- `version`: 版本筛选（可选）
- `subject`: 科目筛选（可选）
- `grade`: 年级筛选（可选）
- `page`: 页码，默认1
- `size`: 每页数量，默认10

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "subject": "数学",
        "version": "人教版",
        "grade": 1,
        "semester": "上学期",
        "file": "https://oss.example.com/textbook.pdf",
        "is_parsed": 1,
        "status": 1,
        "create_time": 1234567890
      }
    ],
    "total": 100,
    "page": 1,
    "size": 10
  }
}
```

#### 获取教材详情

```
GET /api/admin/textbook/{id}
```

#### 查询教材单元

```
GET /api/admin/textbook/{id}/units
```

**响应示例**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "textbook_id": 1,
      "name": "第一单元 认识数字",
      "content": "单元内容...",
      "status": 1
    }
  ]
}
```

---

### 教师用书管理

#### 创建教师用书

```
POST /api/admin/teacher_book/
```

**请求参数**:

```json
{
  "subject": "数学",
  "version": "人教版",
  "grade": 1,
  "semester": "上学期"
}
```

#### 上传教师用书文件

```
POST /api/admin/teacher_book/{id}/upload
```

**请求类型**: `multipart/form-data`

**请求参数**:

- `file`: PDF文件

#### 修改教师用书信息

```
PUT /api/admin/teacher_book/{id}
```

**请求参数**:

```json
{
  "subject": "数学",
  "version": "人教版",
  "grade": 1,
  "semester": "上学期"
}
```

#### 删除教师用书

```
DELETE /api/admin/teacher_book/{id}
```

**权限要求**: 需要超级管理员权限

#### 搜索教师用书

```
GET /api/admin/teacher_book/search?keyword=数学&page=1&size=10
```

**查询参数**:

- `keyword`: 搜索关键词（可选）
- `version`: 版本筛选（可选）
- `subject`: 科目筛选（可选）
- `grade`: 年级筛选（可选）
- `page`: 页码，默认1
- `size`: 每页数量，默认10

#### 获取教师用书详情

```
GET /api/admin/teacher_book/{id}
```

---

### 单元管理

#### 创建课程单元

```
POST /api/admin/unit/
```

**请求参数**:

```json
{
  "textbook_id": 1,
  "name": "第一单元 认识数字",
  "content": "单元内容描述..."
}
```

#### 更新课程单元

```
PATCH /api/admin/unit/{id}
```

**请求参数**:

```json
{
  "name": "第一单元 认识数字（修改后）",
  "content": "更新的单元内容...",
  "status": 1
}
```

#### 删除课程单元

```
DELETE /api/admin/unit/{id}
```

#### 查询单元知识点

```
GET /api/admin/unit/{id}/knowledges
```

---

### 知识点管理

#### 创建知识点

```
POST /api/admin/knowledge/
```

**请求参数**:

```json
{
  "textbook_id": 1,
  "unit_id": 1,
  "name": "10以内数的认识",
  "content": "知识点详细内容..."
}
```

#### 更新知识点

```
PATCH /api/admin/knowledge/{id}
```

**请求参数**:

```json
{
  "name": "10以内数的认识与应用",
  "content": "更新后的内容..."
}
```

#### 删除知识点

```
DELETE /api/admin/knowledge/{id}
```

#### 搜索知识点

```
GET /api/admin/knowledge/search?keyword=数字&page=1&size=10
```

**查询参数**:

- `keyword`: 搜索关键词（可选）
- `page`: 页码，默认1
- `size`: 每页数量，默认10

---

### 题目管理

#### 更新题目

```
PATCH /api/admin/question/{id}
```

**请求参数**:

```json
{
  "content": "更新后的题目内容",
  "options": "A. 选项1\nB. 选项2\nC. 选项3",
  "answer": "A",
  "difficulty": "普通",
  "subject": "数学",
  "grade": 1,
  "type": "选择题",
  "subtype": "快速口算",
  "resource": "https://oss.example.com/image.png",
  "resource_type": "image",
  "knowledge": "10以内数的加法",
  "unit_id": 1,
  "textbook_id": 1
}
```

#### 删除题目

```
DELETE /api/admin/question/{id}
```

#### 搜索题目

```
GET /api/admin/question/search
```

**查询参数**:

- `keyword`: 搜索关键词（可选）
- `question_id`: 题目ID（可选）
- `textbook_id`: 教材ID（可选）
- `unit_id`: 单元ID（可选）
- `subject`: 科目（可选）
- `grade`: 年级（可选）
- `type`: 题目类型（可选）
- `resource_type`: 资源类型（可选）
- `resource_generated`: 资源是否已生成（可选）
- `page`: 页码，默认1
- `size`: 每页数量，默认10

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "subject": "数学",
        "grade": 1,
        "type": "选择题",
        "subtype": "快速口算",
        "content": "1 + 1 = ?",
        "options": "A. 1\nB. 2\nC. 3",
        "answer": "B",
        "difficulty": "简单",
        "resource": "https://oss.example.com/image.png",
        "resource_type": "image",
        "textbook_id": 1,
        "unit_id": 1,
        "knowledge": "10以内数的加法"
      }
    ],
    "total": 500,
    "page": 1,
    "size": 10
  }
}
```

#### 搜索资源题目

```
GET /api/admin/question/resource/search
```

**功能说明**: 搜索带有资源（图片/语音）的题目。查询参数同搜索题目接口。

#### 获取题目详情

```
GET /api/admin/question/{id}
```

#### 生成题目图片

```
POST /api/admin/question/{id}/image_generate
```

**功能说明**: 为题目自动生成配图。

#### 生成题目语音

```
POST /api/admin/question/{id}/audio_generate
```

**功能说明**: 为题目自动生成语音朗读。

---

### 题型管理

#### 创建题型

```
POST /api/admin/question_type/
```

**请求参数**:

```json
{
  "title": "看图选词",
  "scene": "选择题",
  "subject": "英语",
  "grade": 1,
  "description": "根据图片选择正确的单词",
  "resource_type": "image",
  "prompt": "请生成一道看图选词题，要求：1. 图片清晰易懂；2. 选项包含正确答案和2-3个干扰项；3. 适合小学一年级学生；4. 单词难度适中"
}
```

**参数说明**:

- `title`: 题型标题（必填，如：看图选词、根据首字母填空）
- `scene`: 类型（必填，如：选择题、填空题、判断题、口语题、应用题）
- `subject`: 科目（必填，数学/英语）
- `grade`: 年级（必填，1-6）
- `description`: 题型描述（可选）
- `resource_type`: 资源类型（可选，image/audio）
- `prompt`: 生成该题型的 AI 指令（可选）

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "看图选词",
    "scene": "选择题",
    "subject": "英语",
    "grade": 1,
    "description": "根据图片选择正确的单词",
    "resource_type": "image",
    "prompt": "请生成一道看图选词题...",
    "create_time": 1234567890,
    "update_time": 1234567890
  }
}
```

#### 更新题型

```
PATCH /api/admin/question_type/{id}
```

**请求参数**:

```json
{
  "title": "看图选词（修改）",
  "scene": "选择题",
  "description": "更新后的描述",
  "resource_type": "image",
  "prompt": "更新后的 AI 指令"
}
```

**参数说明**:

- 所有字段均为可选
- 更新时会检查同一 scene、subject、grade 下 title 是否重复

#### 删除题型

```
DELETE /api/admin/question_type/{id}
```

**功能说明**: 删除指定题型（硬删除）。

#### 获取题型详情

```
GET /api/admin/question_type/{id}
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "title": "看图选词",
    "scene": "选择题",
    "subject": "英语",
    "grade": 1,
    "description": "根据图片选择正确的单词",
    "resource_type": "image",
    "prompt": "请生成一道看图选词题...",
    "create_time": 1234567890,
    "update_time": 1234567890
  }
}
```

#### 搜索题型

```
GET /api/admin/question_type/search
```

**查询参数**:

- `keyword`: 搜索关键词（可选，匹配题型标题）
- `scene`: 类型筛选（可选，如：选择题、填空题）
- `subject`: 科目筛选（可选）
- `grade`: 年级筛选（可选）
- `page`: 页码，默认1
- `size`: 每页数量，默认10
- `sort`: 排序字段，默认id
- `order`: 排序方式，默认desc（asc/desc）

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "total": 50,
    "data": [
      {
        "id": 1,
        "title": "看图选词",
        "scene": "选择题",
        "subject": "英语",
        "grade": 1,
        "description": "根据图片选择正确的单词",
        "resource_type": "image",
        "prompt": "请生成一道看图选词题...",
        "create_time": 1234567890,
        "update_time": 1234567890
      },
      {
        "id": 2,
        "title": "根据首字母填空",
        "scene": "填空题",
        "subject": "英语",
        "grade": 2,
        "description": "根据首字母提示填写单词",
        "resource_type": null,
        "prompt": "请生成一道根据首字母填空题...",
        "create_time": 1234567891,
        "update_time": 1234567891
      }
    ]
  }
}
```

---

### 学生管理

#### 创建学生

```
POST /api/admin/student/
```

**请求参数**:

```json
{
  "name": "张三",
  "phone": "13800138000"
}
```

#### 更新学生信息

```
PATCH /api/admin/student/{id}
```

**请求参数**:

```json
{
  "name": "张三（修改）",
  "phone": "13800138001",
  "grade": 1,
  "status": 0
}
```

#### 删除学生

```
DELETE /api/admin/student/{id}
```

#### 搜索学生

```
GET /api/admin/student/search?keyword=张三&page=1&size=10
```

**查询参数**:

- `keyword`: 搜索关键词（姓名或手机号，可选）
- `phone`: 手机号筛选（可选）
- `status`: 状态筛选（可选）
- `page`: 页码，默认1
- `size`: 每页数量，默认10

#### 重置学生密码

```
POST /api/admin/student/{id}/reset_password
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "password": "new_random_password"
  }
}
```

#### 获取学生详情

```
GET /api/admin/student/{id}
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "id": "student_xxx",
    "name": "张三",
    "phone": "13800138000",
    "status": 0,
    "create_time": 1234567890,
    "textbooks": [
      {
        "id": 1,
        "subject": "数学",
        "version": "人教版",
        "grade": 1,
        "semester": "上学期"
      }
    ]
  }
}
```

#### 添加学生教材

```
POST /api/admin/student/{id}/textbook/{textbook_id}
```

**功能说明**: 为学生绑定单个教材。

#### 删除学生教材

```
DELETE /api/admin/student/{id}/textbook/{textbook_id}
```

**功能说明**: 删除学生的某个教材。

#### 查询学生教材

```
GET /api/admin/student/{id}/textbooks
```

**功能说明**: 获取学生已绑定的教材列表。

#### 查询学生未使用的教材

```
GET /api/admin/student/{id}/unused_textbooks
```

**功能说明**: 获取学生尚未绑定的教材列表。

---

### 练习管理

#### 获取学生练习历史

```
GET /api/admin/practice/{student_id}/history/{practice_type}
```

**路径参数**:

- `student_id`: 学生ID
- `practice_type`: 练习类型（daily_practice/unit_practice/assessment）

**响应示例**:

```json
{
  "code": 0,
  "data": [
    {
      "session_id": 123,
      "session_type": "daily_practice",
      "target_id": 20241123,
      "question_count": 10,
      "answer_count": 10,
      "correct_count": 8,
      "status": 2,
      "create_time": 1234567890
    }
  ]
}
```

**功能说明**: 获取最近30条练习记录。

#### 获取练习会话详情

```
GET /api/admin/practice/session/{session_id}
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "session": {
      "id": 123,
      "session_type": "daily_practice",
      "question_count": 10,
      "answer_count": 10,
      "correct_count": 8,
      "status": 2
    },
    "answers": [
      {
        "question_id": 1,
        "question_content": "1 + 1 = ?",
        "text_answer": "2",
        "status": 1,
        "time_spent": 5
      }
    ],
    "report": {
      "total_questions": 10,
      "correct_questions": 8,
      "overall_score": 80.0,
      "total_time": 300
    },
    "wrong_records": []
  }
}
```

**功能说明**: 返回会话详情，包含session、answers、report、wrong_records四部分。

#### 删除练习会话

```
DELETE /api/admin/practice/session/{session_id}
```

**功能说明**: 删除指定练习会话及其所有答题记录与报告，可用于清理异常数据。

---

### 配置管理

#### 获取系统配置

```
GET /api/admin/configs
```

**查询参数**（当前后端实现会忽略这些参数，预留扩展用）:

- `subject`: 科目（可选，预留）
- `grade`: 年级（可选，预留）

**响应示例**:

```json
{
  "status": 0,
  "message": "success",
  "data": {
    "subjects": ["英语", "数学"],
    "textbook_versions": ["人教版"],
    "semesters": ["上学期", "下学期", "整学期"],
    "question_types": ["选择题", "输入题", "口语题", "判断题", "匹配题", "应用题"],
    "difficulty_levels": ["简单", "普通", "困难"],
    "providers": ["aliyun"]
  }
}
```

**功能说明**:

- 获取系统基础枚举配置：科目、教材版本、学期、题目场景、难度等级、模型供应商等。
- 配置的权威来源位于 `apps/server/shared/core/constants.py`，接口实现位于 `apps/server/admin/routes/config.py`。

---

### Prompt 管理

#### 创建 Prompt

```
POST /api/admin/prompt/
```

**请求参数**:

```json
{
  "name": "题目生成提示词",
  "slug": "question_generate",
  "scene": "question_generate",
  "description": "用于生成题目的提示词模板",
  "tags": ["题目", "生成"],
  "template_content": "请根据以下要求生成一道题目：\n{requirements}",
  "negative_content": "不要包含以下内容：\n{negative}",
  "model_params": {
    "temperature": 0.7,
    "max_tokens": 2000
  },
  "timeout": 30,
  "changelog": "初始版本"
}
```

**参数说明**:

- `name`: Prompt 名称（必填）
- `slug`: Prompt 唯一标识（必填，用于程序调用）
- `scene`: 使用场景（必填）
- `description`: 描述（可选）
- `tags`: 标签列表（可选）
- `template_content`: 模板内容（必填）
- `negative_content`: 负面提示内容（可选）
- `model_params`: 模型参数（可选，JSON 对象）
- `timeout`: 超时时间（可选，秒）
- `changelog`: 更新日志（可选）

**响应示例**:

```json
{
  "code": 0,
  "data": 1
}
```

**功能说明**: 创建新的 Prompt，同时创建第一个版本（未发布状态）。

#### 更新 Prompt

```
PUT /api/admin/prompt/{version_id}
```

**请求参数**: 同创建 Prompt，所有字段可选。

**功能说明**: 更新指定版本的 Prompt 内容。会创建新版本或更新现有版本。

#### 发布 Prompt 版本

```
POST /api/admin/prompt/{version_id}/publish
```

**功能说明**: 发布指定 Prompt 版本，使其成为当前使用的版本。

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "is_published": 1
  }
}
```

#### 获取 Prompt 列表

```
GET /api/admin/prompt/list?name=题目&scene=question_generate&page=1&size=10
```

**查询参数**:

- `name`: 名称搜索（可选，模糊匹配）
- `scene`: 场景筛选（可选）
- `slug`: slug 筛选（可选）
- `tag`: 标签筛选（可选）
- `page`: 页码，默认1
- `size`: 每页数量，默认10

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "total": 50,
    "data": [
      {
        "id": 1,
        "name": "题目生成提示词",
        "slug": "question_generate",
        "scene": "question_generate",
        "description": "用于生成题目的提示词模板",
        "tags": ["题目", "生成"],
        "version": {
          "id": 1,
          "is_published": 1,
          "create_time": 1234567890
        }
      }
    ]
  }
}
```

#### 获取 Prompt 版本列表

```
GET /api/admin/prompt/versions?prompt_id=1&page=1&size=10
```

**查询参数**:

- `prompt_id`: Prompt ID（可选）
- `page`: 页码，默认1
- `size`: 每页数量，默认10

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "total": 10,
    "data": [
      {
        "id": 1,
        "prompt_id": 1,
        "template_content": "请根据以下要求生成一道题目：\n{requirements}",
        "is_published": 1,
        "create_time": 1234567890,
        "update_time": 1234567890
      }
    ]
  }
}
```

#### 获取 Prompt 详情

```
GET /api/admin/prompt/{version_id}
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "题目生成提示词",
    "slug": "question_generate",
    "scene": "question_generate",
    "description": "用于生成题目的提示词模板",
    "tags": ["题目", "生成"],
    "version_id": 1,
    "template_content": "请根据以下要求生成一道题目：\n{requirements}",
    "negative_content": "不要包含以下内容：\n{negative}",
    "model_params": {
      "temperature": 0.7,
      "max_tokens": 2000
    },
    "changelog": "初始版本",
    "is_published": 1,
    "create_time": 1234567890,
    "update_time": 1234567890
  }
}
```

**功能说明**: 获取指定版本的 Prompt 详细信息。

---

## 学生端接口

### 学生认证

#### 检查登录状态

```
GET /api/student/check
```

**响应示例**:

```json
{
  "code": 0,
  "data": "student_xxx"
}
```

**功能说明**: 返回当前登录学生的ID。

#### 学生登录

```
POST /api/student/login
```

**请求参数**:

```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "student": {
      "id": "student_xxx",
      "name": "张三",
      "phone": "13800138000"
    }
  }
}
```

---

### 学生资料

#### 获取学生资料

```
GET /api/student/profile
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "student": {
      "id": "student_xxx",
      "name": "张三",
      "phone": "13800138000",
      "status": 0
    },
    "textbooks": [
      {
        "id": 1,
        "subject": "数学",
        "version": "人教版",
        "grade": 1,
        "semester": "上学期"
      }
    ]
  }
}
```

**功能说明**: 返回学生信息及已绑定的教材列表。

---

### 教材功能

#### 获取教材单元列表

```
GET /api/student/textbook/{textbook_id}/units
```

**路径参数**:

- `textbook_id`: 教材ID

**响应示例**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "第一单元 认识数字",
      "textbook_id": 1
    }
  ]
}
```

**功能说明**: 获取指定教材的单元列表。

#### 获取单元知识点列表

```
GET /api/student/textbook/{unit_id}/knowledges
```

**路径参数**:

- `unit_id`: 单元ID

**响应示例**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "10以内数的认识",
      "unit_id": 1,
      "difficulty": "简单",
      "importance": 8
    }
  ]
}
```

**功能说明**: 获取指定单元的知识点列表（需要验证学生权限）。

---

### 练习功能

#### 获取日常练习

```
GET /api/student/practice/daily/{textbook_id}
```

**路径参数**:

- `textbook_id`: 教材ID

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "session_id": 123,
    "session_type": "daily_practice",
    "target_id": 20241123,
    "textbook_id": 1,
    "question_count": 10,
    "answer_count": 5,
    "correct_count": 4,
    "status": 0,
    "generate_status": null,
    "start_time": 0,
    "end_time": null
  }
}
```

**功能说明**: 返回指定教材当天的日常练习信息（存在则返回 `PracticeSession`，否则返回 `null`）。若存在未完成会话且未开始，`status` 为 0。

#### 获取单元练习

```
GET /api/student/practice/unit/{unit_id}
```

**路径参数**:

- `unit_id`: 单元ID

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "session_id": 123,
    "session_type": "unit_practice",
    "target_id": 1,
    "textbook_id": 1,
    "question_count": 10,
    "answer_count": 5,
    "correct_count": 4,
    "status": 0,
    "generate_status": null,
    "start_time": 0,
    "end_time": null
  }
}
```

**功能说明**: 返回指定单元的未完成单元练习信息（若存在）。`target_id` 表示单元ID。

#### 获取综合评估

```
GET /api/student/practice/assessment/{textbook_id}
```

**路径参数**:

- `textbook_id`: 教材ID

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "session_id": 123,
    "session_type": "assessment",
    "target_id": 1,
    "textbook_id": 1,
    "question_count": 10,
    "answer_count": 5,
    "correct_count": 4,
    "status": 0,
    "generate_status": null,
    "start_time": 0,
    "end_time": null
  }
}
```

**功能说明**: 返回指定教材的未完成综合评估信息（若存在）。字段同 `PracticeSession`。

#### 创建练习会话

```
POST /api/student/practice/create
```

**请求参数**:

```json
{
  "type": "daily_practice",
  "textbook_id": 1,
  "unit_id": 1
}
```

**参数说明**:

- `type`: 练习类型（必填，可选值：`daily_practice` / `unit_practice` / `assessment`）
- `textbook_id`: 教材ID（必填）
- `unit_id`: 单元ID，仅在创建单元练习时必填

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "task_id": "practice_abc123def456"
  }
}
```

**功能说明**:

- 提交练习生成任务到任务队列，返回任务ID
- 客户端需要通过 `/task/{task_id}/status` 接口轮询任务状态
- 日常练习：如果存在未完成会话，将自动重置为当天
- 单元练习：同一学生同一单元只允许一个未完成会话
- 综合评估：存在未完成会话时不允许重复创建

#### 立即创建练习会话

```
POST /api/student/practice/immediately_create
```

**请求参数**:

```json
{
  "type": "daily_practice",
  "textbook_id": 1,
  "unit_id": 1
}
```

**参数说明**:

- `type`: 练习类型（必填，可选值：`daily_practice` / `unit_practice` / `assessment`）
- `textbook_id`: 教材ID（必填）
- `unit_id`: 单元ID，仅在创建单元练习时必填

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "session_id": 123,
    "session_type": "daily_practice",
    "target_id": 20241123,
    "textbook_id": 1,
    "question_count": 10,
    "answer_count": 0,
    "correct_count": 0,
    "status": 0
  }
}
```

**功能说明**:

- 同步创建练习会话，立即返回会话信息（不通过任务队列）
- 适用于需要立即获取结果的场景
- 业务规则与异步创建接口相同

#### 查询练习生成任务状态

```
GET /api/student/practice/task/{task_id}/status
```

**路径参数**:

- `task_id`: 任务ID（从创建练习会话接口返回）

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "status": "completed",
    "result": {
      "session_id": 456
    }
  }
}
```

**功能说明**: 查询练习生成任务的状态。任务状态包括：

- `pending`: 等待中
- `running`: 执行中
- `completed`: 已完成
- `failed`: 失败

#### 获取练习历史

```
GET /api/student/practice/history/{type}
```

**路径参数**:

- `type`: 练习类型（daily_practice/unit_practice/assessment）

**响应示例**:

```json
{
  "code": 0,
  "data": [
    {
      "session_id": 123,
      "session_type": "daily_practice",
      "target_id": 20241123,
      "textbook_id": 1,
      "question_count": 10,
      "answer_count": 10,
      "correct_count": 8,
      "status": 2,
      "start_time": 1234567890,
      "end_time": 1234567990,
      "create_time": 1234567890
    }
  ]
}
```

**功能说明**: 获取最近30条练习记录。

#### 获取练习会话详情

```
GET /api/student/practice/detail/{session_id}
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "session": {
      "id": 123,
      "session_type": "daily_practice",
      "question_count": 10,
      "answer_count": 5,
      "correct_count": 4,
      "status": 1
    },
    "questions": [
      {
        "id": 1,
        "content": "1 + 1 = ?",
        "options": "A. 1\nB. 2\nC. 3",
        "type": "选择题"
      }
    ],
    "answers": [
      {
        "question_id": 1,
        "text_answer": "B",
        "status": 1,
        "time_spent": 5
      }
    ],
    "report": {
      "total_questions": 10,
      "correct_questions": 4,
      "overall_score": 40.0,
      "total_time": 150
    }
  }
}
```

**功能说明**: 返回指定会话的题目、答题记录及报告，包含 `session`、`questions`、`answers`、`report` 四部分。会验证学生权限。

#### 开始练习

```
POST /api/student/practice/{session_id}/begin
```

**功能说明**: 标记练习会话为进行中状态，记录开始时间。

#### 提交答案

```
POST /api/student/practice/answer
```

**请求参数**:

```json
{
  "session_id": 123,
  "question_id": 1,
  "answer": "B",
  "time_spent": 5,
  "is_audio_answer": false,
  "audio_match": null,
  "audio_analysis": null
}
```

**参数说明**:

- `session_id`: 练习会话ID
- `question_id`: 题目ID
- `answer`: 文本答案（口语题为 ASR 识别后的文本）
- `time_spent`: 答题耗时（秒）
- `is_audio_answer`: 是否为音频答案
- `audio_match`: 音频理解结果：是否匹配题目要求（仅口语题）
- `audio_analysis`: 音频理解结果：综合分析（包含原因和改进建议，仅口语题）

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "is_correct": true,
    "correct_answer": "B",
    "user_answer": "B",
    "analysis": "答案正确！1 + 1 = 2",
    "session_progress": {
      "answer_count": 1,
      "correct_count": 1,
      "question_count": 10
    }
  }
}
```

#### 上传录音并进行语音识别

```
POST /api/student/practice/answer/audio/analyze
```

**请求类型**: `multipart/form-data`

**请求参数**:

- `session_id`: 练习会话ID（Form字段）
- `question_id`: 题目ID（Form字段）
- `audio_type`: 音频类型（Form字段）
- `audio_file`: 音频文件（File字段）

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "text": "识别的文本内容",
    "audio_url": "https://oss.example.com/audio.mp3",
    "match": true,
    "analysis": "综合分析..."
  }
}
```

**功能说明**: 上传录音并进行语音识别，返回识别结果和音频理解结果。

#### 完成练习

```
POST /api/student/practice/{session_id}/complete
```

**响应示例**:

```json
{
  "code": 0,
  "data": {
    "report_id": 456
  }
}
```

**功能说明**: 完成练习，生成练习报告。

---

## 数据模型说明

### 练习会话状态

- `0`: 未开始
- `1`: 进行中
- `2`: 已完成
- `3`: 生产中（正在生成题目）
- `4`: 生成完成（题目已生成，正在预生成答题记录）
- `5`: 生成失败

### 会话生成状态（generating_status）

- `null`: 非生成状态（正常练习状态，status为0/1/2）
- `"generating"`: 生产中（status=3）
- `"generated"`: 生成完成（status=4）
- `"failed"`: 生成失败（status=5）

### 答题正确性

- `0`: 未答
- `1`: 正确
- `2`: 错误

### 管理员类型

- `1`: 普通管理员
- `2`: 超级管理员

### 状态（通用）

- `0`: 正常/启用
- `1`: 禁用/删除

### 题目资源类型

- `image`: 图片
- `audio`: 语音
- `null`: 无资源

### 练习类型

- `daily_practice`: 日常练习
- `unit_practice`: 单元练习
- `assessment`: 综合评估

---

## 注意事项

### 1. 分页说明

所有分页接口默认参数：

- `page`: 默认值为 1
- `size`: 默认值为 10

### 2. 时间戳格式

所有时间字段使用Unix时间戳（秒级）。

### 3. 音频数据

音频答题时，需要通过 `/answer/audio/analyze` 接口上传音频文件进行识别和分析。

### 4. 错误处理

客户端应根据响应的 `code` 字段判断请求是否成功，`message` 字段包含错误详情。

### 5. 权限说明

- 超级管理员（type=2）拥有所有权限
- 普通管理员（type=1）无法执行删除教材等敏感操作

### 6. 异步任务处理

创建练习会话接口返回的是任务ID，客户端需要：

1. 调用 `/task/{task_id}/status` 接口轮询任务状态
2. 当任务状态为 `completed` 时，从 `result` 中获取 `session_id`
3. 使用 `session_id` 进行后续的练习操作

---

## 开发建议

### 1. Token管理

- Token有效期为30天
- 客户端应妥善保存token
- Token失效后需重新登录

### 2. 文件上传

- 教材文件仅支持PDF格式
- 建议文件大小不超过50MB

### 3. 并发控制

- 同一学生同一时间只能有一个未完成的日常练习
- 同一学生同一时间只能有一个未完成的综合评估
- 同一学生同一单元同一时间只能有一个未完成的单元练习

### 4. 性能优化

- 建议客户端缓存配置信息（科目、题型等）
- 题目列表支持分页，避免一次性加载大量数据
- 练习生成是异步任务，建议使用轮询机制查询状态，避免长时间等待

---

## 更新日志

### v0.2.3 (2024-12-21)

- 新增 Prompt 管理接口：`GET /api/admin/prompt/list`、`POST /api/admin/prompt/`、`PUT /api/admin/prompt/{version_id}`、`POST /api/admin/prompt/{version_id}/publish` 等
- 更新文档说明

### v0.2.2 (2024-12-21)

- 新增立即创建练习会话接口：`POST /api/student/practice/immediately_create`
- 更新文档说明

### v0.2.1 (2024-12-20)

- 修正练习接口路径参数：日常练习、单元练习、综合评估接口需要路径参数
- 更新日常练习接口：`GET /practice/daily/{textbook_id}`
- 更新单元练习接口：`GET /practice/unit/{unit_id}`
- 更新综合评估接口：`GET /practice/assessment/{textbook_id}`

### v0.2.0 (2024-12-19)

- 根据实际后端代码重新生成文档
- 更新练习创建接口为异步任务模式
- 添加音频分析接口文档
- 修正题目生成资源接口路径
- 移除不存在的接口（如管理端生成练习接口）

### v0.1.0 (2024-11-23)

- 初始版本发布
- 实现管理端和学生端核心功能
- 支持日常练习、单元练习、综合评估
- 集成阿里云AI服务

---

## 技术支持

如有接口使用问题，请联系技术支持团队。
