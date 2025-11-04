# 学生信息表优化设计方案 - 实现文档

## 概述

本实现基于现有 `ah_student` 表保持不变的原则，新增了4个表来支持完整的学生信息管理功能。

## 数据库表结构

### 1. ah_student_profile - 学生详情配置表

**作用**: 替代 localStorage，持久化存储学生的学习设置

**字段**:
- `id` - 主键
- `student_id` - 关联学生ID（唯一）
- `grade` - 年级 (0-12)
- `textbook_version` - 教材版本
- `semester` - 学期
- `preferred_subjects` - 偏好科目（JSON格式）
- `difficulty_preference` - 难度偏好
- `create_time` / `update_time` - 时间戳

### 2. ah_student_stats - 学习统计表

**作用**: 存储学生的学习统计数据

**字段**:
- `id` - 主键
- `student_id` - 关联学生ID（唯一）
- `total_practice` - 练习次数
- `total_questions` - 完成题目数
- `correct_questions` - 正确题目数
- `accuracy` - 正确率 (%)
- `current_streak` - 当前连续天数
- `max_streak` - 最大连续天数
- `last_study_date` - 最后学习日期
- `total_study_duration` - 总学习时长（秒）
- `achievements` - 成就徽章（JSON格式）
- `create_time` / `update_time` - 时间戳

### 3. ah_study_record - 学习记录表

**作用**: 记录每次学习活动的详细数据

**字段**:
- `id` - 主键
- `student_id` - 关联学生ID
- `textbook_id` - 教材ID
- `unit_id` - 单元ID（可选）
- `knowledge_id` - 知识点ID（可选）
- `question_id` - 题目ID（可选）
- `is_correct` - 是否正确 (0/1)
- `score` - 得分
- `time_spent` - 用时（秒）
- `study_date` - 学习日期
- `create_time` - 创建时间

### 4. ah_student_wrong_question - 错题本表

**作用**: 记录学生的错题及掌握情况

**字段**:
- `id` - 主键
- `student_id` - 关联学生ID
- `question_id` - 题目ID
- `wrong_count` - 错误次数
- `last_wrong_time` - 最后一次错误时间
- `is_mastered` - 是否已掌握 (0-未掌握 1-已掌握)
- `mastered_time` - 掌握时间
- `create_time` / `update_time` - 时间戳

## API 路由

### Admin 端 API

基础路径: `/api/admin/student/{student_id}/`

#### 学习设置相关

- `GET /profile` - 获取学生设置
- `POST /profile` - 创建或更新学生设置

#### 学习统计相关

- `GET /stats` - 获取学生统计
- `POST /stats` - 更新学生统计

#### 学习记录相关

- `POST /records` - 创建学习记录
- `GET /records` - 获取学习记录列表（支持分页搜索）

#### 错题本相关

- `GET /wrong_questions?mastered=0` - 获取错题列表
  - `mastered` 参数: `0`-未掌握 `1`-已掌握 `null`-全部
- `POST /wrong_questions/{question_id}/master` - 标记为已掌握
- `POST /wrong_questions/{question_id}/unmaster` - 标记为未掌握

### Student 端 API

基础路径: `/api/student/profile`

#### 学习设置

- `GET /` - 获取当前学生设置
- `POST /` - 更新当前学生设置

#### 学习统计

- `GET /stats` - 获取学习统计

#### 学习记录

- `GET /records` - 获取学习记录
- `POST /records` - 创建学习记录（会自动更新统计和错题本）

#### 错题本

- `GET /wrong_questions` - 获取错题本
- `POST /wrong_questions/{question_id}/master` - 标记为已掌握
- `POST /wrong_questions/{question_id}/unmaster` - 标记为未掌握

## 服务层 (Services)

### 1. profile.py - 学生详情配置服务

- `get_student_profile()` - 获取学生配置
- `create_or_update_student_profile()` - 创建或更新配置
- `update_student_profile()` - 更新配置
- `delete_student_profile()` - 删除配置

### 2. stats.py - 学习统计服务

- `get_student_stats()` - 获取统计
- `create_student_stats()` - 创建统计记录
- `update_student_stats()` - 更新统计
- `increment_student_stats()` - 增量更新（推荐）
- `delete_student_stats()` - 删除统计

### 3. study_record.py - 学习记录服务

- `create_study_record()` - 创建记录
- `get_study_record()` - 获取单条记录
- `search_study_records()` - 搜索记录（支持分页）
- `get_student_study_records()` - 获取学生记录列表
- `get_student_daily_stats()` - 获取学生每日统计
- `delete_study_record()` - 删除记录

### 4. wrong_question.py - 错题本服务

- `add_wrong_question()` - 添加错题
- `get_wrong_question()` - 获取错题详情
- `get_student_wrong_questions()` - 获取学生错题列表
- `mark_as_mastered()` - 标记为已掌握
- `unmark_as_mastered()` - 标记为未掌握
- `delete_wrong_question()` - 删除错题记录
- `get_wrong_question_stats()` - 获取错题统计

## 数据流程

### 学习流程示例

1. 学生答题
2. 调用 `POST /api/student/profile/records` 创建学习记录
3. 系统自动：
   - 调用 `stats.increment_student_stats()` 更新统计数据
   - 如果答错，调用 `wrong_question.add_wrong_question()` 添加到错题本
4. 返回学习记录数据

### 统计计算示例

- **正确率**: `correct_questions / total_questions * 100`
- **连续天数**: 如果今天学习且昨天也学习，则 `current_streak + 1`，否则重置为 1
- **最大连续天数**: 自动更新当 `current_streak > max_streak` 时

## 部署说明

### 1. 运行迁移脚本

```bash
mysql -u root -p < /Users/xiaxianlin/projects/ai-education/server/migrations/001_student_enhancement.sql
```

### 2. 重启服务

```bash
cd /Users/xiaxianlin/projects/ai-education/server
uv run main.py
```

## 前端集成指南

### Student 前端修改

1. **Profile 页面** - 从 API 获取真实统计数据
2. **Settings 页面** - 从 API 获取/保存设置（替代 localStorage）
3. **学习页面** - 每次答题后调用创建学习记录 API

### Admin 前端修改

1. **学生详情页** - 添加"学习设置"和"学习统计"标签页
2. **学习记录页** - 添加学习记录查看功能
3. **错题本管理** - 添加错题本管理功能

## 最佳实践

1. **使用增量更新**: 推荐使用 `stats.increment_student_stats()` 而不是手动更新统计数据
2. **自动错题管理**: 学习记录创建后会自动处理错题，无需手动调用
3. **索引优化**: 所有查询相关的字段都已添加索引
4. **数据一致性**: 确保在同一个事务中更新相关数据
5. **JSON 存储**: 复杂数据（如成就、偏好科目）使用 JSON 格式存储

## 注意事项

1. 保持 `ah_student` 表不变，确保向后兼容
2. 所有时间戳使用 Unix 时间戳（秒）
3. 错误处理遵循现有系统的异常处理机制
4. API 响应格式遵循现有系统的 `ResponseSchema` 标准
