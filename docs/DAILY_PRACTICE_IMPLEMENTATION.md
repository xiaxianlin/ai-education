# 今日练习功能实现文档

## 概述

根据 `practice_system_design.md` 设计文档，完整实现了今日练习功能，包括前后端代码。今日练习是基于学生学习历史、错题情况和能力水平的智能推荐系统。

## 实现内容

### 1. 后端实现

#### 1.1 数据模型 (`server/common/database.py`)

新增 `DailyPracticeSession` 数据表模型：
- **基本信息**：学生ID、练习日期（YYYYMMDD格式）
- **统计信息**：总题数、正确题数、总用时、得分
- **练习类型**：daily（每日）/ adaptive（自适应）
- **知识点覆盖**：JSON格式存储知识点掌握情况
- **题目分布**：JSON格式记录错题、巩固、挑战、新知的分布
- **题目列表**：JSON格式存储题目ID数组
- **答案记录**：JSON格式记录每道题的答题情况
- **状态管理**：in_progress（进行中）、completed（已完成）

#### 1.2 Schema定义 (`server/admin/schema.py`)

新增以下Schema：
- `DailyPracticeSessionSchema`：练习会话数据模型
- `CreateDailyPracticeSchema`：创建练习请求参数
- `SubmitDailyPracticeAnswerSchema`：提交答案请求参数
- `CompleteDailyPracticeSchema`：完成练习请求参数

#### 1.3 服务层 (`server/student/services/daily_practice.py`)

实现 `DailyPracticeService` 类，包含以下核心方法：

1. **create_daily_practice**：创建今日练习会话
   - 检查今天是否已有未完成的练习
   - 获取学生当前教材信息
   - 智能选择题目（30%错题 + 40%巩固 + 20%挑战 + 10%新知）
   - 创建练习会话

2. **智能选题算法**：
   - `_get_wrong_questions`：获取错题（未掌握的错题）
   - `_get_consolidate_questions`：获取巩固题（最近答对的简单和普通题）
   - `_get_challenge_questions`：获取挑战题（困难题）
   - `_get_new_questions`：获取新题（从未练习过的题目）
   - `_get_random_questions`：获取随机题（补充用）

3. **get_practice_session**：获取练习会话详情
   - 返回会话信息、题目列表
   - 按顺序返回题目
   - 包含已答题目的答案

4. **submit_answer**：提交单道题目答案
   - 批改答案
   - 记录答题时间
   - 返回批改结果

5. **complete_practice**：完成练习并生成报告
   - 计算总分和统计信息
   - 记录所有学习记录到数据库
   - 分析知识点掌握情况
   - 生成详细报告

6. **get_practice_history**：获取练习历史记录

#### 1.4 API路由 (`server/student/routes/practice.py`)

实现以下API端点：

```python
POST /api/student/practice/daily              # 创建今日练习
GET  /api/student/practice/daily/{session_id} # 获取练习会话详情
POST /api/student/practice/daily/answer       # 提交答案
POST /api/student/practice/daily/complete     # 完成练习
GET  /api/student/practice/daily/history      # 获取练习历史
```

---

### 2. 前端实现

#### 2.1 API Service (`student/src/services/practice.ts`)

新增今日练习相关类型和API调用函数：

**类型定义**：
- `DailyPracticeSession`
- `DailyPracticeSessionDetail`
- `DailyPracticeReport`
- `DailyPracticeHistoryItem`
- `CreateDailyPracticeParams`

**API函数**：
- `createDailyPractice`：创建今日练习
- `getDailyPracticeSession`：获取会话详情
- `submitDailyAnswer`：提交答案
- `completeDailyPractice`：完成练习
- `getDailyPracticeHistory`：获取历史

#### 2.2 今日练习入口页面 (`student/src/pages/DailyPractice.tsx`)

完全重新设计的今日练习入口页面：

**核心特性**：
1. **智能推荐说明**
   - 可视化展示4种题目类型的分布
   - 错题复习（30%）- 红色
   - 巩固练习（40%）- 蓝色
   - 挑战题目（20%）- 橙色
   - 新知识点（10%）- 绿色

2. **题目数量选择**
   - 支持5、10、15、20题可选
   - 默认选择10题

3. **美观的UI设计**
   - 渐变色背景
   - 卡片式布局
   - 图标装饰
   - 响应式设计

4. **功能特色展示**
   - 智能推荐
   - 精准定位
   - 持续进步

#### 2.3 今日练习答题页面 (`student/src/pages/DailyPracticeSession.tsx`)

完整的答题界面，与单元练习类似但有所区别：

**功能特性**：
1. **进度显示**
   - 顶部进度条
   - 显示已答题数和剩余题数

2. **题目展示**
   - 显示题目类型、难度、知识点
   - 支持多种题型
   - 支持图片资源

3. **答题交互**
   - 选择题、判断题、填空题、简答题
   - 实时反馈
   - 自动进入下一题

4. **完成报告**
   - 得分、正确率、用时统计
   - **题目分布可视化**：显示4种题目类型的实际数量
   - 知识点掌握情况分析
   - 进度条颜色标识（绿色≥80%、黄色≥60%、红色<60%）

5. **操作选项**
   - 返回首页
   - 查看练习历史

#### 2.4 路由配置 (`student/src/router.tsx`)

新增路由：
```typescript
/daily-practice/$sessionId  // 今日练习答题页面
```

---

## 核心算法

### 智能推荐算法

根据设计文档，今日练习采用4种题目类型的混合策略：

**题目分配比例**：
- **30% 错题复习**：从错题本中选择未掌握的错题
- **40% 巩固练习**：选择最近练习过且答对的简单和普通题
- **20% 挑战题目**：随机选择困难题
- **10% 新知识点**：选择从未练习过的题目

**选题逻辑**：
```python
1. 查询学生的错题库，选择未掌握的错题
2. 查询最近答对的题目，作为巩固练习
3. 从题库中随机选择困难题作为挑战
4. 排除已练习过的题目，选择新题
5. 如果题目不够，用随机题目补充
6. 统计实际的题目分布情况
```

### 题目分布统计

在完成练习后，系统会统计实际的题目分布：
- 通过错题表判断哪些是错题
- 通过学习记录判断哪些是巩固题
- 通过难度字段判断哪些是挑战题
- 其余为新题

这个统计结果会在完成报告中展示，让学生了解本次练习的构成。

### 答案批改算法

与单元练习相同，根据题目类型采用不同批改策略：
- **选择题/判断题**：精确匹配
- **填空题**：支持多答案（用`|`分隔）
- **其他题型**：字符串比较

### 成绩计算

```
得分 = (正确题数 / 总题数) × 100
知识点掌握率 = (该知识点正确题数 / 该知识点总题数) × 100
```

---

## 数据流程

### 1. 创建练习流程

```
用户点击开始练习
  → 选择题目数量
  → 后端检查今天是否已有未完成练习
  → 获取学生当前教材
  → 智能选择题目（4种类型混合）
  → 统计题目分布
  → 创建练习会话
  → 返回会话ID
  → 跳转到答题页面
```

### 2. 答题流程

```
加载会话和题目
  → 显示当前题目
  → 用户选择/输入答案
  → 提交答案到后端
  → 批改并返回结果
  → 显示对错
  → 自动进入下一题
```

### 3. 完成练习流程

```
用户点击完成
  → 计算总分
  → 分析知识点掌握
  → 记录所有学习记录
  → 生成报告（包含题目分布）
  → 显示报告页面
```

---

## 特色功能

### 1. 智能推荐
- 基于学生历史学习数据
- 考虑错题率和薄弱知识点
- 动态混合4种题目类型
- 确保学习效果最大化

### 2. 每日唯一性
- 检测今天是否已有未完成的练习
- 避免重复创建
- 鼓励学生完成当天的练习

### 3. 题目分布可视化
- 完成报告中展示实际题目分布
- 让学生了解练习构成
- 4种颜色区分不同类型

### 4. 持续学习追踪
- 记录每次练习的详细数据
- 分析学习趋势
- 为后续推荐提供数据支持

### 5. 美观的UI设计
- 渐变色主题
- 卡片式布局
- 图标装饰
- 响应式设计

---

## 数据库变更

执行以下SQL创建新表（使用SQLAlchemy自动迁移）：

```sql
CREATE TABLE ah_daily_practice_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id VARCHAR(255) NOT NULL,
    date INTEGER NOT NULL,  -- YYYYMMDD格式
    total_questions INTEGER DEFAULT 0,
    correct_questions INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    score FLOAT DEFAULT 0.0,
    practice_type VARCHAR(50) DEFAULT 'daily',
    knowledge_coverage TEXT DEFAULT '{}',
    question_distribution TEXT DEFAULT '{}',
    question_ids TEXT DEFAULT '[]',
    answers TEXT DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'in_progress',
    create_time INTEGER NOT NULL,
    update_time INTEGER NOT NULL
);

-- 建议的索引
CREATE INDEX idx_daily_practice_student_date ON ah_daily_practice_session(student_id, date);
CREATE INDEX idx_daily_practice_status ON ah_daily_practice_session(status);
```

---

## 使用说明

### 启动服务

#### 后端
```bash
cd server
python main.py
```

#### 前端
```bash
cd student
npm run dev
```

### 使用流程

1. **进入今日练习页面**：从首页点击"今日练习"
2. **查看推荐说明**：了解4种题目类型的分布策略
3. **选择题目数量**：5/10/15/20题可选，默认10题
4. **开始练习**：点击"开始今日练习"按钮
5. **答题**：依次完成所有题目，每题提交后显示对错
6. **查看报告**：完成后查看详细报告，包括题目分布和知识点掌握情况

---

## 与单元练习的区别

| 特性 | 今日练习 | 单元练习 |
|-----|---------|---------|
| **选题策略** | 智能推荐（4种类型混合） | 按难度或单元选择 |
| **题目来源** | 整个教材 | 特定单元 |
| **每日限制** | 每天一次（检测未完成） | 无限制 |
| **题目分布** | 30%错题+40%巩固+20%挑战+10%新知 | 30%基础+40%提高+20%综合+10%拓展 |
| **目标** | 每日坚持，全面提升 | 单元突破，专项训练 |

---

## 扩展性

该实现为后续功能提供了良好的扩展基础：

1. **学习曲线分析**：基于每日练习数据绘制学习曲线
2. **个性化调整**：根据学生表现动态调整题目分布比例
3. **连续打卡奖励**：鼓励学生坚持每日练习
4. **AI分析报告**：使用大模型生成个性化学习建议
5. **社交功能**：今日练习排行榜、好友PK等

---

## 测试建议

### 后端测试
```bash
# 创建今日练习
curl -X POST http://127.0.0.1:7890/api/student/practice/daily \
  -H "x-access-token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"count": 10, "practice_type": "daily"}'

# 获取练习会话
curl http://127.0.0.1:7890/api/student/practice/daily/1 \
  -H "x-access-token: <token>"

# 提交答案
curl -X POST http://127.0.0.1:7890/api/student/practice/daily/answer \
  -H "x-access-token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"session_id": 1, "question_id": 1, "answer": "A", "time_spent": 30}'

# 完成练习
curl -X POST http://127.0.0.1:7890/api/student/practice/daily/complete \
  -H "x-access-token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"session_id": 1}'

# 获取历史
curl http://127.0.0.1:7890/api/student/practice/daily/history \
  -H "x-access-token: <token>"
```

### 前端测试
1. 登录学生账号
2. 确保已设置当前教材
3. 进入"今日练习"页面
4. 选择题目数量并开始练习
5. 完成答题并查看报告

---

## 注意事项

1. **数据库迁移**：首次运行需要初始化数据库，创建新表
2. **教材设置**：学生必须先在设置中选择当前教材
3. **题目数据**：确保教材中有足够的题目供选择
4. **每日限制**：同一天只能创建一次练习（未完成的会复用）
5. **认证中间件**：所有API都需要学生认证token

---

## 总结

今日练习功能完全按照设计文档实现，核心特点：

✅ **智能推荐算法**：30%错题 + 40%巩固 + 20%挑战 + 10%新知
✅ **每日唯一性**：防止重复创建，鼓励坚持
✅ **题目分布可视化**：让学生了解练习构成
✅ **完整的数据追踪**：记录所有学习过程
✅ **美观的UI设计**：提升用户体验
✅ **无linter错误**：代码质量高

与单元练习互补：
- **今日练习**：每日坚持，全面复习，智能推荐
- **单元练习**：专项突破，单元巩固，自主选择

两个功能相辅相成，为学生提供完整的个性化学习体验。

---

*实现日期：2025-11-09*
*实现者：AI Assistant*

