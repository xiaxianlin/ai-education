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
  - [学生资料](#学生资料)
  - [教材功能](#教材功能)
  - [练习功能](#练习功能)
  - [错题记录](#错题记录)

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

#### 生成单元题目

```
POST /api/admin/unit/{id}/generate?count=10
```

**查询参数**:
- `count`: 生成题目数量，默认10

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

#### 生成学生练习（每日/单元/能力评估）

```
POST /api/admin/practice/generate?student_id={student_id}&type={type}&count=15&unit_id=1
```

**查询参数**:
- `student_id`: 学生ID（必填）
- `type`: 练习类型（必填，可选值：`daily_practice` / `unit_practice` / `assessment`）
- `count`: 题目数量（默认15，可选）
- `unit_id`: 单元ID，仅在 `type=unit_practice` 时必填
- `textbook_id`: 教材ID（可选）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "session_id": 456
  }
}
```

**功能说明**:
- 每日练习：若存在未完成会话会自动重置为当天目标
- 单元练习：若该学生该单元存在未完成会话会返回错误
- 能力评估：若存在未完成会话会返回错误

#### 重新生成练习（按会话ID）

```
POST /api/admin/practice/{session_id}/regenerate
```

**功能说明**: 根据会话ID重新生成题目，旧题目与答题记录会被清空并重新写入。

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "session_id": 456,
    "question_count": 15,
    "generate_status": 1
  }
}
```

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
    }
  }
}
```

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
    "target_id": 20241123,
    "textbook_id": 1,
    "question_count": 10,
    "answer_count": 5,
    "correct_count": 4,
    "status": 0,
    "generate_status": 1,
    "start_time": 0,
    "end_time": null
  }
}
```

**功能说明**: 返回当天的每日练习（存在则返回 `PracticeSession`，否则返回 `null`）。若存在未完成会话且未开始，`status` 为 0。

#### 获取单元练习

```
GET /api/student/practice/unit
```

**功能说明**: 返回当前激活教材下的未完成单元练习（最多一个）。`target_id` 表示单元ID，可用于定位单元。

#### 获取能力评估

```
GET /api/student/practice/assessment
```

**功能说明**: 返回当前学生的未完成能力评估（若存在）。字段同 `PracticeSession`。

#### 创建练习会话

```
POST /api/student/practice/create
```

**请求参数**:
```json
{
  "type": "daily_practice",
  "count": 15,
  "unit_id": 1,
  "textbook_id": 1
}
```

**参数说明**:
- `type`: 练习类型（必填，可选值：`daily_practice` / `unit_practice` / `assessment`）
- `count`: 题目数量（默认15，可选）
- `unit_id`: 单元ID，仅在创建单元练习时必填
- `textbook_id`: 教材ID（可选）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "session_id": 456
  }
}
```

**功能说明**:
- 每日练习：如果存在未完成会话，将自动重置为当天
- 单元练习：同一学生同一单元只允许一个未完成会话
- 能力评估：存在未完成会话时不允许重复创建

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
- `answer`: 文本答案（口语题为 ASR 识别后的文本）
- `time_spent`: 答题耗时（秒）
- `is_audio_answer`: 是否为音频答案
- `audio_data`: 音频 OSS 存储路径（仅口语题有值）

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

### 错题记录

#### 获取错题列表

```
GET /api/student/wrong-records?mastered=0
```

**查询参数**:
- `mastered`: 是否已掌握（可选，0-未掌握，1-已掌握）

**响应示例**:
```json
{
  "code": 0,
  "data": [
    {
      "question_id": 1,
      "content": "1 + 1 = ?",
      "answer": "B",
      "wrong_count": 3,
      "mastered": 0,
      "last_wrong_time": 1234567890
    }
  ]
}
```

**功能说明**: 
- 不传 `mastered` 参数：返回所有错题
- `mastered=0`：返回未掌握的错题
- `mastered=1`：返回已掌握的错题

#### 标记题目为已掌握

```
POST /api/student/wrong-records/{question_id}/master
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "message": "已标记为已掌握"
  }
}
```

**功能说明**: 将错题标记为已掌握状态。

#### 标记题目为未掌握

```
POST /api/student/wrong-records/{question_id}/unmaster
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "message": "已标记为未掌握"
  }
}
```

**功能说明**: 将错题标记为未掌握状态。

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


