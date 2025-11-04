# 学生信息表 API 端点文档

## 概述

本文档描述了学生信息表优化设计后的所有 API 端点。所有时间戳均为 Unix 时间戳（秒）。

---

## Admin 端 API

基础URL: `http://localhost:7890/api/admin/student/{student_id}`

### 1. 学生详情配置

#### 获取学生配置
```
GET /api/admin/student/{id}/profile
```

**响应示例:**
```json
{
  "id": 1,
  "student_id": "uuid-string",
  "grade": 3,
  "textbook_version": "人教版",
  "semester": "上学期",
  "preferred_subjects": "[\"数学\", \"英语\"]",
  "difficulty_preference": "中等",
  "create_time": 1635724800,
  "update_time": 1635724800
}
```

#### 创建或更新学生配置
```
POST /api/admin/student/{id}/profile
```

**请求体:**
```json
{
  "grade": 3,
  "textbook_version": "人教版",
  "semester": "上学期",
  "preferred_subjects": "[\"数学\", \"英语\"]",
  "difficulty_preference": "中等"
}
```

---

### 2. 学习统计

#### 获取学生统计
```
GET /api/admin/student/{id}/stats
```

**响应示例:**
```json
{
  "id": 1,
  "student_id": "uuid-string",
  "total_practice": 10,
  "total_questions": 100,
  "correct_questions": 80,
  "accuracy": 80.0,
  "current_streak": 5,
  "max_streak": 10,
  "last_study_date": 1635724800,
  "total_study_duration": 3600,
  "achievements": "[\"first_week\", \"high_accuracy\"]",
  "create_time": 1635724800,
  "update_time": 1635724800
}
```

#### 更新学生统计
```
POST /api/admin/student/{id}/stats
```

**请求体:**
```json
{
  "total_practice": 10,
  "total_questions": 100,
  "correct_questions": 80,
  "current_streak": 5,
  "max_streak": 10,
  "last_study_date": 1635724800,
  "total_study_duration": 3600,
  "achievements": "[\"first_week\", \"high_accuracy\"]"
}
```

---

### 3. 学习记录

#### 创建学习记录
```
POST /api/admin/student/{id}/records
```

**请求体:**
```json
{
  "student_id": "uuid-string",
  "textbook_id": 1,
  "unit_id": 2,
  "knowledge_id": 3,
  "question_id": 4,
  "is_correct": 1,
  "score": 85.5,
  "time_spent": 120,
  "study_date": 1635724800
}
```

#### 获取学习记录
```
GET /api/admin/student/{id}/records
```

**查询参数:**
- `page` (int, default: 1) - 页码
- `size` (int, default: 10) - 每页数量
- `sort` (string, default: create_time) - 排序字段
- `order` (string, default: desc) - 排序方向 (asc/desc)
- `keywords` (string, optional) - 关键词搜索

**响应示例:**
```json
{
  "total": 50,
  "data": [
    {
      "id": 1,
      "student_id": "uuid-string",
      "textbook_id": 1,
      "unit_id": 2,
      "knowledge_id": 3,
      "question_id": 4,
      "is_correct": 1,
      "score": 85.5,
      "time_spent": 120,
      "study_date": 1635724800,
      "create_time": 1635724800
    }
  ]
}
```

---

### 4. 错题本

#### 获取学生错题列表
```
GET /api/admin/student/{id}/wrong_questions
```

**查询参数:**
- `mastered` (int, optional) - 掌握状态: 0-未掌握, 1-已掌握

**响应示例:**
```json
[
  {
    "id": 1,
    "student_id": "uuid-string",
    "question_id": 4,
    "wrong_count": 2,
    "last_wrong_time": 1635724800,
    "is_mastered": 0,
    "mastered_time": 0,
    "create_time": 1635724800,
    "update_time": 1635724800,
    "question_content": "题目内容..."
  }
]
```

#### 标记错题为已掌握
```
POST /api/admin/student/{id}/wrong_questions/{question_id}/master
```

#### 标记错题为未掌握
```
POST /api/admin/student/{id}/wrong_questions/{question_id}/unmaster
```

---

## Student 端 API

基础URL: `http://localhost:7890/api/student/profile`

### 1. 学生详情配置

#### 获取当前学生配置
```
GET /api/student/profile
```

#### 更新当前学生配置
```
POST /api/student/profile
```

**请求体:**
```json
{
  "grade": 3,
  "textbook_version": "人教版",
  "semester": "上学期",
  "preferred_subjects": "[\"数学\", \"英语\"]",
  "difficulty_preference": "中等"
}
```

---

### 2. 学习统计

#### 获取学习统计
```
GET /api/student/profile/stats
```

---

### 3. 学习记录

#### 获取学习记录
```
GET /api/student/profile/records
```

**响应示例:**
```json
{
  "status": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "student_id": "uuid-string",
      "textbook_id": 1,
      "unit_id": 2,
      "knowledge_id": 3,
      "question_id": 4,
      "is_correct": 1,
      "score": 85.5,
      "time_spent": 120,
      "study_date": 1635724800,
      "create_time": 1635724800
    }
  ]
}
```

#### 创建学习记录（推荐）
```
POST /api/student/profile/records
```

**请求体:**
```json
{
  "textbook_id": 1,
  "unit_id": 2,
  "knowledge_id": 3,
  "question_id": 4,
  "is_correct": 1,
  "score": 85.5,
  "time_spent": 120,
  "study_date": 1635724800
}
```

**注意:** 这个端点会自动:
1. 创建学习记录
2. 更新学生学习统计（增量更新）
3. 如果答错，自动添加到错题本

---

### 4. 错题本

#### 获取错题列表
```
GET /api/student/profile/wrong_questions
```

**查询参数:**
- `mastered` (int, optional) - 掌握状态

**响应示例:**
```json
{
  "status": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "student_id": "uuid-string",
      "question_id": 4,
      "wrong_count": 2,
      "last_wrong_time": 1635724800,
      "is_mastered": 0,
      "mastered_time": 0,
      "create_time": 1635724800,
      "update_time": 1635724800,
      "question_content": "题目内容..."
    }
  ]
}
```

#### 标记错题为已掌握
```
POST /api/student/profile/wrong_questions/{question_id}/master
```

#### 标记错题为未掌握
```
POST /api/student/profile/wrong_questions/{question_id}/unmaster
```

---

## 通用响应格式

### 成功响应
```json
{
  "status": 0,
  "message": "success",
  "data": {...}
}
```

### 错误响应
```json
{
  "status": 1,
  "message": "错误信息",
  "data": null
}
```

---

## 错误代码说明

- `0` - 成功
- `1` - 失败
- 常见错误信息:
  - "学生不存在" - 学生ID无效
  - "错题记录不存在" - 错题记录未找到
  - "参数错误" - 请求参数不符合要求

---

## 数据类型说明

### 布尔值
- `is_correct`: `0` (错误) / `1` (正确)
- `is_mastered`: `0` (未掌握) / `1` (已掌握)
- `status`: `0` (禁用) / `1` (正常)

### 枚举值
- `grade`: `1-12` (小学1-6, 初中7-9, 高中10-12)
- `textbook_version`: "人教版", "苏教版", "北师大版", "沪教版", "外研版", "其他"
- `semester`: "上学期", "下学期"
- `difficulty_preference`: "简单", "轻松", "中等", "较难", "困难"

### JSON 字段
- `preferred_subjects`: JSON 数组格式，如 `["数学", "英语"]`
- `achievements`: JSON 数组格式，如 `["first_week", "high_accuracy"]`

---

## 测试建议

### 使用 curl 测试

```bash
# 获取学生配置
curl -X GET http://localhost:7890/api/admin/student/{student_id}/profile

# 更新学生配置
curl -X POST http://localhost:7890/api/admin/student/{student_id}/profile \
  -H "Content-Type: application/json" \
  -d '{"grade": 3, "textbook_version": "人教版", "semester": "上学期"}'
```

### 使用 Python requests 测试

```python
import requests

# 获取学生配置
response = requests.get('http://localhost:7890/api/admin/student/{id}/profile')
print(response.json())
```
