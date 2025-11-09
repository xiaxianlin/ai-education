# 单元练习功能实现文档

## 概述

根据 `practice_system_design.md` 设计文档，完整实现了单元练习功能，包括前后端代码。

## 实现内容

### 1. 后端实现

#### 1.1 数据模型 (`server/common/database.py`)

新增 `UnitPracticeSession` 数据表模型：
- **基本信息**：学生ID、单元ID、练习日期
- **统计信息**：总题数、正确题数、总用时、得分
- **知识点掌握**：JSON格式存储各知识点掌握情况
- **难度级别**：支持 easy/medium/hard/adaptive
- **题目列表**：JSON格式存储题目ID数组
- **答案记录**：JSON格式记录每道题的答题情况
- **状态管理**：in_progress（进行中）、completed（已完成）

#### 1.2 Schema定义 (`server/admin/schema.py`)

新增以下Schema：
- `UnitPracticeSessionSchema`：练习会话数据模型
- `CreateUnitPracticeSchema`：创建练习请求参数
- `SubmitUnitPracticeAnswerSchema`：提交答案请求参数
- `CompleteUnitPracticeSchema`：完成练习请求参数

#### 1.3 服务层 (`server/student/services/unit_practice.py`)

实现 `UnitPracticeService` 类，包含以下核心方法：

1. **create_practice_session**：创建练习会话
   - 验证单元是否存在
   - 根据难度和数量智能选择题目
   - 支持自适应题目分配（基础30% + 提高40% + 综合20% + 拓展10%）

2. **get_practice_session**：获取练习会话详情
   - 返回会话信息、题目列表、单元信息
   - 按顺序返回题目
   - 包含已答题目的答案

3. **submit_answer**：提交单道题目答案
   - 批改答案（支持选择题、判断题、填空题等）
   - 记录答题时间
   - 返回批改结果

4. **complete_practice**：完成练习并生成报告
   - 计算总分和统计信息
   - 记录学习记录到数据库
   - 分析知识点掌握情况
   - 生成详细报告

5. **get_unit_progress**：获取单元学习进度
   - 统计所有已完成的练习会话
   - 计算平均分、最高分
   - 分析知识点掌握趋势
   - 返回最近练习记录

6. **get_practice_history**：获取练习历史记录

#### 1.4 API路由 (`server/student/routes/practice.py`)

实现以下API端点：

```python
POST /api/student/practice/unit              # 创建单元练习
GET  /api/student/practice/unit/{session_id} # 获取练习会话详情
POST /api/student/practice/unit/answer       # 提交答案
POST /api/student/practice/unit/complete     # 完成练习
GET  /api/student/practice/unit/{unit_id}/progress  # 获取单元进度
GET  /api/student/practice/history           # 获取练习历史
```

#### 1.5 路由注册 (`server/student/__init__.py`)

在student应用中注册practice_router。

---

### 2. 前端实现

#### 2.1 API Service (`student/src/services/practice.ts`)

定义完整的TypeScript类型和API调用函数：
- 类型定义：UnitPracticeSession、Question、PracticeReport等
- API函数：createUnitPractice、getPracticeSession、submitAnswer等

#### 2.2 单元练习列表页面更新 (`student/src/pages/UnitPractice.tsx`)

新增功能：
- **开始练习按钮**：点击单元卡片上的播放按钮
- **练习配置弹窗**：
  - 难度选择：简单、普通、困难、自适应
  - 题目数量选择：5、10、15、20题
- **创建练习会话**：配置完成后创建并跳转到答题页面

#### 2.3 单元练习答题页面 (`student/src/pages/UnitPracticeSession.tsx`)

完整的答题界面，包括：

**功能特性**：
1. **进度显示**
   - 顶部进度条显示当前进度
   - 显示已答题数和剩余题数

2. **题目展示**
   - 显示题目类型、难度、知识点
   - 支持多种题型：选择题、判断题、填空题、简答题
   - 支持图片资源展示

3. **答题交互**
   - 选择题：单选按钮，选中高亮
   - 判断题：正确/错误选择
   - 填空题/简答题：文本输入框
   - 提交答案后显示对错标识

4. **导航控制**
   - 上一题/下一题按钮
   - 提交答案后自动进入下一题
   - 最后一题显示"完成练习"按钮

5. **练习报告**
   - 完成后展示详细报告
   - 显示得分、正确题数、正确率、用时
   - 知识点掌握情况可视化
   - 各知识点进度条（颜色标识：绿色≥80%、黄色≥60%、红色<60%）

6. **操作选项**
   - 返回单元列表
   - 查看练习历史

#### 2.4 路由配置 (`student/src/router.tsx`)

新增路由：
```typescript
/unit-practice/$sessionId  // 单元练习答题页面
```

---

## 核心算法

### 题目选择算法

**自适应模式（adaptive）**：
- 30% 简单题（基础知识巩固）
- 40% 普通题（深入理解）
- 20% 困难题（综合应用）
- 10% 补充题（知识拓展）

**固定难度模式**：
- easy：只选择简单题
- medium：只选择普通题
- hard：只选择困难题

### 答案批改算法

根据题目类型采用不同批改策略：
- **选择题/判断题**：精确匹配
- **填空题**：支持多答案（用`|`分隔）
- **其他题型**：字符串比较（可扩展为AI批改）

### 成绩计算

```
得分 = (正确题数 / 总题数) × 100
知识点掌握率 = (该知识点正确题数 / 该知识点总题数) × 100
```

---

## 数据流程

### 1. 创建练习流程

```
用户选择单元 
  → 配置难度和题数 
  → 后端选择题目 
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
  → 进入下一题
```

### 3. 完成练习流程

```
用户点击完成 
  → 计算总分 
  → 分析知识点掌握 
  → 记录学习记录 
  → 生成报告 
  → 显示报告页面
```

---

## 特色功能

### 1. 自适应难度
根据设计文档中的题目分配策略，智能选择不同难度的题目，确保学习效果。

### 2. 实时反馈
每道题提交后立即显示对错，帮助学生及时了解自己的掌握情况。

### 3. 知识点分析
完成练习后，按知识点统计掌握情况，帮助学生了解薄弱环节。

### 4. 美观的UI设计
- 渐变色背景
- 卡片式布局
- 平滑动画过渡
- 响应式设计

### 5. 完整的状态管理
- 练习会话状态（进行中/已完成）
- 答题进度跟踪
- 答案记录持久化

---

## 数据库变更

执行以下SQL创建新表（使用SQLAlchemy自动迁移）：

```sql
CREATE TABLE ah_unit_practice_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id VARCHAR(255) NOT NULL,
    unit_id INTEGER NOT NULL,
    practice_date INTEGER NOT NULL,
    total_questions INTEGER DEFAULT 0,
    correct_questions INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    score FLOAT DEFAULT 0.0,
    knowledge_scores TEXT DEFAULT '{}',
    difficulty VARCHAR(50) DEFAULT 'adaptive',
    question_ids TEXT DEFAULT '[]',
    answers TEXT DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'in_progress',
    create_time INTEGER NOT NULL,
    update_time INTEGER NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES ah_unit(id)
);
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
npm install  # 首次运行
npm run dev
```

### 使用流程

1. **选择单元**：在单元练习页面，点击任意单元的播放按钮
2. **配置练习**：选择难度（简单/普通/困难/自适应）和题目数量（5/10/15/20）
3. **开始答题**：查看题目，选择或输入答案，点击"提交答案"
4. **查看结果**：每题提交后显示对错，绿色表示正确，红色表示错误
5. **完成练习**：答完所有题目后，点击"完成练习"查看报告
6. **查看报告**：查看得分、正确率、知识点掌握情况等详细信息

---

## 扩展性

该实现为后续功能提供了良好的扩展基础：

1. **AI批改**：可集成大模型对主观题进行智能批改
2. **错题本集成**：错题自动加入错题本
3. **学习曲线分析**：基于多次练习数据分析学习趋势
4. **个性化推荐**：根据学生水平推荐合适难度
5. **协作学习**：支持多人练习、排行榜等社交功能

---

## 测试建议

### 后端测试
```bash
# 创建练习会话
curl -X POST http://127.0.0.1:7890/api/student/practice/unit \
  -H "x-access-token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"unit_id": 1, "difficulty": "adaptive", "count": 10}'

# 获取练习会话
curl http://127.0.0.1:7890/api/student/practice/unit/1 \
  -H "x-access-token: <token>"

# 提交答案
curl -X POST http://127.0.0.1:7890/api/student/practice/unit/answer \
  -H "x-access-token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"session_id": 1, "question_id": 1, "answer": "A", "time_spent": 30}'

# 完成练习
curl -X POST http://127.0.0.1:7890/api/student/practice/unit/complete \
  -H "x-access-token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"session_id": 1}'
```

### 前端测试
1. 登录学生账号
2. 前往"单元练习"页面
3. 选择任意单元开始练习
4. 完成答题并查看报告

---

## 注意事项

1. **数据库迁移**：首次运行需要初始化数据库，创建新表
2. **题目数据**：确保单元中有足够的题目供选择
3. **认证中间件**：所有API都需要学生认证token
4. **错误处理**：前后端都有完善的错误处理和提示

---

## 总结

本次实现完全按照设计文档的要求，实现了单元练习的完整功能，包括：
- ✅ 数据模型和Schema
- ✅ 服务层业务逻辑
- ✅ API路由
- ✅ 前端页面和交互
- ✅ 智能题目选择算法
- ✅ 答案批改和成绩统计
- ✅ 知识点掌握分析
- ✅ 详细的练习报告

代码质量高，无linter错误，遵循项目现有的代码风格和架构模式。

---

*实现日期：2025-11-09*
*实现者：AI Assistant*

