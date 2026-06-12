# Phase 2 — 智能化升级实施概要

> **预估工期**: 8-10周 | **前置**: Phase 1 完成
> 注: Phase 2 各功能的详细实施规格将在 Phase 1 完成后基于实际代码编写

---

## P2-01 自适应难度算法优化 (5天)

**现状**: P1-13 实现了基于正确率的简单三级难度调整

**升级**: 引入 IRT (Item Response Theory) 或 ELO 评分模型

### 实现方向

**文件**: `server-go/internal/ai/difficulty.go`（新建）

```go
// DifficultyEngine 难度引擎接口
type DifficultyEngine interface {
    // Calculate 根据学生能力值和历史表现计算推荐难度
    Calculate(ctx context.Context, studentID int64, abilityCode string) (float64, error)
}

// ELOEngine 基于 ELO 评分的难度引擎
type ELOEngine struct {
    masteryRepo mastery.Repository
}

func (e *ELOEngine) Calculate(ctx context.Context, studentID int64, abilityCode string) (float64, error) {
    // 1. 获取学生当前能力值 (ELO rating)
    // 2. 获取该能力点的题目难度分布
    // 3. 推荐难度 = 学生能力值 ± 随机偏移
    // 4. 映射到 0-1 难度系数
}
```

**关键改动**:
- `ah_student_ability_mastery` 表新增 `elo_rating` 字段
- 每次答题后根据结果更新学生 ELO 和题目 ELO
- AI Prompt 中使用精确的难度系数 (0.0~1.0) 而非 easy/medium/hard

---

## P2-02 错题本 (5天)

### 数据模型

**新增表**: `ah_wrong_question`

```sql
CREATE TABLE ah_wrong_question (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    practice_id VARCHAR(36) NOT NULL,
    ability_code VARCHAR(100),
    student_answer JSON,
    correct_answer JSON,
    wrong_type VARCHAR(50),     -- wrong/partial/timeout
    is_reviewed TINYINT DEFAULT 0,
    review_count INT DEFAULT 0,
    mastered TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_ability (student_id, ability_code),
    INDEX idx_student_unreviewed (student_id, is_reviewed)
);
```

### 后端接口

```
GET    /api/student/wrong-questions          # 错题列表 (支持按能力点/学科筛选)
GET    /api/student/wrong-questions/summary   # 错题统计 (按能力点分组)
POST   /api/student/wrong-questions/{id}/review  # 标记已复习
DELETE /api/student/wrong-questions/{id}      # 移除错题
POST   /api/student/practice/create-wrong     # 创建错题重练
```

### 核心逻辑

**文件**: `server-go/internal/practice/service.go`

在 `Complete()` 方法中，答题完成后自动收集错题：

```go
// 收集错题
for _, answer := range answers {
    if !answer.IsCorrect {
        wrongQ := &WrongQuestion{
            StudentID:    session.StudentID,
            QuestionID:   answer.QuestionID,
            PracticeID:   practiceID,
            AbilityCode:  answer.AbilityCode,
            StudentAnswer: answer.Answer,
            CorrectAnswer: answer.CorrectAnswer,
            WrongType:    determineWrongType(answer),
        }
        wrongRepo.Create(ctx, wrongQ)
    }
}
```

### 前端页面

**新增页面**: `student-web/src/pages/WrongQuestions/`
- 错题列表（按能力点分组）
- 错题详情卡片（题目 + 我的答案 + 正确答案 + 解析）
- 错题重练入口

---

## P2-03 薄弱项专项练习 (3天)

### 实现方案

基于 P1-12 的薄弱项识别 + P2-02 的错题本，新增专项练习模式：

```
POST /api/student/practice/create-targeted
Body: { ability_codes: ["chinese_1_understanding", "math_1_calc"] }
```

**逻辑**: 从错题本中选取该能力点的错题，配合 AI 生成同类题目组卷。

---

## P2-04 学习路径推荐 (5天)

### 方案

AI 基于学生掌握度数据，推荐下一步学习内容：

```
GET /api/student/recommendations
Response: {
  suggested_abilities: ["chinese_1_understanding", "math_2_geometry"],
  reason: "你的阅读理解正确率为45%，建议加强练习",
  estimated_questions: 15
}
```

**文件**: `server-go/internal/ai/recommend.go`（新建）

使用 Gemini 分析学生数据并生成学习建议。

---

## P2-05 练习报告对比分析 (3天)

### 方案

**新增接口**: `GET /api/student/practice/compare?ability_code=xxx`

返回同一能力点历次练习的分数趋势，前端用折线图展示。

**前端**: 在 `PracticeResult` 页面新增"历史趋势" Tab，使用 Recharts 绘图。

---

## P2-06 ~ P2-07 图片/音频题目支持 (6天)

### 图片题目

- `ah_question.content` JSON 中扩展 `image_url` 字段
- AI Prompt 中支持生成带图片描述的题目
- 前端渲染图片组件

### 音频题目 (英语听力)

- 集成 TTS (Text-to-Speech) API
- `ah_question.content` JSON 中新增 `audio_url` 字段
- 前端增加音频播放器组件

---

## P2-08 ~ P2-09 排序题/匹配题 UI (4天)

### 排序题 UI

- 移动端: 拖拽排序组件
- PC 端: 点击上下移动按钮

### 匹配题 UI

- 连线匹配组件 (左列 → 右列)
- 移动端: 点击选择配对

---

## P2-10 能力点知识图谱 (5天)

### 数据模型

**新增表**: `ah_ability_relation`

```sql
CREATE TABLE ah_ability_relation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_code VARCHAR(100),
    target_code VARCHAR(100),
    relation_type VARCHAR(50),  -- prerequisite/related/advanced
    UNIQUE KEY uk_relation (source_code, target_code, relation_type)
);
```

**管理端**: 新增能力关系编辑界面
**学生端**: 知识图谱可视化展示（D3.js / react-force-graph）

---

## P2-11 RAG 知识库检索 (5天)

### 方案

接入向量数据库（Milvus/Chroma），增强 AI 题目生成质量：

```
知识库文档 → Embedding → 向量数据库
                         ↓
AI 生成题目时 → 检索相关知识 → 增强 Prompt
```

**已预留接口**: `ai/tools.go` 中的 `RAGSearcher`

---

## P2-12 Prompt 模板版本管理 (2天)

### 方案

- `ah_question_type` 新增 `prompt_version` 字段
- 新增 `ah_prompt_version` 表存储历史版本
- 管理端可查看、回滚 Prompt 版本
