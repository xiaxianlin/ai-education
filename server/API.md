# AI Education Platform - API接口文档

## 目录

- [通用说明](#通用说明)
- [管理端接口](#管理端接口)
  - [认证管理](#认证管理)
  - [管理员管理](#管理员管理)
  - [教材管理](#教材管理)
  - [单元管理](#单元管理)
  - [知识点管理](#知识点管理)
  - [题目管理](#题目管理)
  - [学生管理](#学生管理)
  - [练习管理](#练习管理)
  - [配置管理](#配置管理)
- [学生端接口](#学生端接口)
  - [学生认证](#学生认证)
  - [教材功能](#教材功能)
  - [练习功能](#练习功能)

---

## 通用说明

### 基础URL

- **管理端**: `http://your-domain/api/admin`
- **学生端**: `http://your-domain/api/student`

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
  "old_password": "old_password",
  "new_password": "new_password"
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
  "password": "password123",
  "type": 0
}
```

**参数说明**:
- `type`: 管理员类型，0-普通管理员，1-超级管理员

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

#### 更新管理员类型

```
PATCH /api/admin/manager/{id}/type/{type}
```

**路径参数**:
- `id`: 管理员ID
- `type`: 管理员类型（0或1）

#### 更新管理员状态

```
PATCH /api/admin/manager/{id}/status/{status}
```

**路径参数**:
- `id`: 管理员ID
- `status`: 状态（0-正常，1-禁用）

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

#### 生成教材题目

```
POST /api/admin/textbook/{id}/generate?count=30
```

**查询参数**:
- `count`: 生成题目数量，默认30

**功能说明**: 基于教材内容使用AI生成题目。

#### 修改教材信息

```
PUT /api/admin/textbook/{id}
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
GET /api/admin/textbook/search?keyword=数学&page=1&size=10
```

**查询参数**:
- `keyword`: 搜索关键词（可选）
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

#### 查询教材知识点

```
GET /api/admin/textbook/{id}/knowledges
```

#### 查询教材题目

```
GET /api/admin/textbook/{id}/questions?page=1&size=10
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

#### 生成单元题目

```
POST /api/admin/unit/{id}/generate?count=30
```

**查询参数**:
- `count`: 生成题目数量，默认30

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

#### 搜索课程单元

```
GET /api/admin/unit/search?keyword=数字&page=1&size=10
```

#### 查询单元知识点

```
GET /api/admin/unit/{id}/knowledges
```

#### 查询单元题目

```
GET /api/admin/unit/{id}/questions?page=1&size=10
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
  "content": "知识点详细内容...",
  "difficulty": "简单",
  "importance": 8,
  "order": 1
}
```

**参数说明**:
- `difficulty`: 难度（简单/普通/困难）
- `importance`: 重要性（1-10）
- `order`: 排序值

#### 更新知识点

```
PATCH /api/admin/knowledge/{id}
```

**请求参数**:
```json
{
  "name": "10以内数的认识与应用",
  "content": "更新后的内容...",
  "difficulty": "普通",
  "importance": 9
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

#### 查询知识点题目

```
GET /api/admin/knowledge/{id}/questions?page=1&size=10
```

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
  "difficulty": "普通"
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
- `keyword`: 搜索关键词
- `textbook_id`: 教材ID
- `unit_id`: 单元ID
- `type`: 题目类型
- `subtype`: 题目子类型
- `difficulty`: 难度
- `page`: 页码
- `size`: 每页数量

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

**功能说明**: 搜索带有资源（图片/语音）的题目。

#### 获取题目详情

```
GET /api/admin/question/{id}
```

#### 生成题目图片

```
POST /api/admin/question/{id}/generate_image
```

**功能说明**: 为题目自动生成配图。

#### 生成题目语音

```
POST /api/admin/question/{id}/generate_audio
```

**功能说明**: 为题目自动生成语音朗读。

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
  "phone": "13800138000",
  "password": "123456"
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
- `keyword`: 搜索关键词（姓名或手机号）
- `status`: 状态筛选
- `page`: 页码
- `size`: 每页数量

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

#### 保存学生教材

```
POST /api/admin/student/{id}/textbooks
```

**请求参数**:
```json
{
  "ids": [1, 2, 3]
}
```

**功能说明**: 为学生批量绑定教材。

#### 查询学生教材

```
GET /api/admin/student/{id}/textbooks
```

---

### 练习管理

#### 获取学生每日练习

```
GET /api/admin/practice/{student_id}/daily
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "session_id": 123,
    "session_type": "daily_practice",
    "question_count": 10,
    "answer_count": 5,
    "correct_count": 4,
    "status": 1,
    "questions": [
      {
        "id": 1,
        "content": "1 + 1 = ?",
        "type": "选择题",
        "order": 1
      }
    ]
  }
}
```

#### 为学生创建每日练习

```
POST /api/admin/practice/{student_id}/daily/create
```

#### 为学生重新生成每日练习

```
POST /api/admin/practice/{student_id}/daily/regenerate
```

**功能说明**: 删除当天未完成的练习，重新生成。

#### 为学生创建单元练习

```
POST /api/admin/practice/{student_id}/unit/{unit_id}/create
```

#### 为学生重新生成单元练习

```
POST /api/admin/practice/{student_id}/unit/{unit_id}/regenerate
```

#### 为学生创建能力评估

```
POST /api/admin/practice/{student_id}/assessment/create
```

#### 为学生重新生成能力评估

```
POST /api/admin/practice/{student_id}/assessment/regenerate
```

#### 获取学生练习历史

```
GET /api/admin/practice/{student_id}/history/{practice_type}
```

**路径参数**:
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

#### 获取练习会话详情

```
GET /api/admin/practice/session/{session_id}/detail
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
        "is_correct": 1,
        "time_spent": 5
      }
    ],
    "report": {
      "total_questions": 10,
      "correct_questions": 8,
      "overall_score": 80.0,
      "total_time": 300
    }
  }
}
```

---

### 配置管理

#### 获取系统配置

```
GET /api/admin/configs
```

**查询参数**:
- `subject`: 科目（可选）
- `grade`: 年级（可选）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "subjects": ["数学", "英语"],
    "textbook_versions": ["人教版"],
    "semesters": ["上学期", "下学期", "整学期"],
    "question_types": {
      "选择题": ["数位判断", "图形归类", "快速口算"],
      "填空题": ["键盘输入计算", "规律填数"],
      "口语题": ["单词拼读", "句子拼读"]
    },
    "question_subtypes": [...],
    "difficulty_levels": ["简单", "普通", "困难"]
  }
}
```

**功能说明**: 获取科目、版本、学期、题型等配置信息。如果指定了科目和年级，返回该科目年级对应的题型列表。

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
  "data": {
    "student": {
      "id": "student_xxx",
      "name": "张三",
      "phone": "13800138000",
      "status": 0
    },
    "textbook": {
      "id": 1,
      "subject": "数学",
      "version": "人教版",
      "grade": 1,
      "semester": "上学期"
    }
  }
}
```

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

### 教材功能

#### 获取学生教材列表

```
GET /api/student/textbook/all
```

**响应示例**:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "subject": "数学",
      "version": "人教版",
      "grade": 1,
      "semester": "上学期",
      "active": 1
    },
    {
      "id": 2,
      "subject": "英语",
      "version": "人教版",
      "grade": 1,
      "semester": "上学期",
      "active": 0
    }
  ]
}
```

#### 获取教材单元列表

```
GET /api/student/textbook/units?textbook_id=1
```

**查询参数**:
- `textbook_id`: 教材ID，如果不指定则获取当前激活教材的单元

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

#### 激活教材

```
POST /api/student/textbook/acitve/{textbook_id}
```

**功能说明**: 将指定教材设置为当前使用教材。

---

### 练习功能

#### 获取每日练习

```
GET /api/student/practice/daily
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "session_id": 123,
    "session_type": "daily_practice",
    "question_count": 10,
    "answer_count": 0,
    "correct_count": 0,
    "status": 0,
    "questions": [
      {
        "id": 1,
        "content": "1 + 1 = ?",
        "options": "A. 1\nB. 2\nC. 3",
        "type": "选择题",
        "subtype": "快速口算",
        "resource": "https://oss.example.com/image.png",
        "resource_type": "image",
        "order": 1
      }
    ]
  }
}
```

**功能说明**: 获取当天的每日练习。如果当天没有，返回最近一次未完成的练习。

#### 创建每日练习

```
POST /api/student/practice/daily
```

**功能说明**: 为学生生成今天的每日练习。

#### 获取能力评估

```
GET /api/student/practice/assessment
```

**功能说明**: 获取未完成的能力评估。

#### 创建能力评估

```
POST /api/student/practice/assessment
```

**功能说明**: 为学生生成能力评估。

#### 获取教材单元练习状态

```
GET /api/student/practice/units/{textbook_id}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "1": {
      "session_id": 123,
      "session_type": "unit_practice",
      "question_count": 10,
      "answer_count": 5,
      "correct_count": 4,
      "status": 1
    },
    "2": null
  }
}
```

**功能说明**: 返回教材下所有单元的未完成练习记录，键为单元ID。

#### 获取单元练习

```
GET /api/student/practice/unit/{unit_id}
```

#### 创建单元练习

```
POST /api/student/practice/unit/{unit_id}
```

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
  "audio_data": null
}
```

**参数说明**:
- `session_id`: 练习会话ID
- `question_id`: 题目ID
- `answer`: 文本答案
- `time_spent`: 答题耗时（秒）
- `is_audio_answer`: 是否为音频答案
- `audio_data`: 音频数据（base64编码）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "is_correct": true,
    "correct_answer": "B",
    "analysis": "答案正确！1 + 1 = 2",
    "session_progress": {
      "answer_count": 1,
      "correct_count": 1,
      "question_count": 10
    }
  }
}
```

#### 开始练习

```
POST /api/student/practice/{session_id}/begin
```

**功能说明**: 标记练习会话为进行中状态，记录开始时间。

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

### 答题正确性

- `0`: 未答
- `1`: 正确
- `2`: 错误

### 管理员类型

- `0`: 普通管理员
- `1`: 超级管理员

### 状态（通用）

- `0`: 正常/启用
- `1`: 禁用/删除

### 题目资源类型

- `image`: 图片
- `audio`: 语音
- `null`: 无资源

### 练习类型

- `daily_practice`: 每日练习
- `unit_practice`: 单元练习
- `assessment`: 能力评估

---

## 注意事项

### 1. 分页说明

所有分页接口默认参数：
- `page`: 默认值为 1
- `size`: 默认值为 10

### 2. 时间戳格式

所有时间字段使用Unix时间戳（秒级）。

### 3. 音频数据

音频答题时，`audio_data` 字段需要传递base64编码的音频数据。

### 4. 错误处理

客户端应根据响应的 `code` 字段判断请求是否成功，`message` 字段包含错误详情。

### 5. 权限说明

- 超级管理员（type=1）拥有所有权限
- 普通管理员（type=0）无法执行删除教材等敏感操作

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

- 同一学生同一时间只能有一个未完成的每日练习
- 同一学生同一时间只能有一个未完成的能力评估
- 同一学生同一单元同一时间只能有一个未完成的单元练习

### 4. 性能优化

- 建议客户端缓存配置信息（科目、题型等）
- 题目列表支持分页，避免一次性加载大量数据

---

## 更新日志

### v0.1.0 (2024-11-23)

- 初始版本发布
- 实现管理端和学生端核心功能
- 支持每日练习、单元练习、能力评估
- 集成阿里云AI服务

---

## 技术支持

如有接口使用问题，请联系技术支持团队。


