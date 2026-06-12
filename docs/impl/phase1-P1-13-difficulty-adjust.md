# P1-13 基础难度调整（正确率 → 难度参数）

> **优先级**: P2 | **预估工期**: 2天 | **前置依赖**: P1-11
> **状态**: 📋 待开发

---

## 现状分析

当前 AI 生成题目时，Prompt 中没有难度参数。所有题目难度一致，未根据学生历史表现调整。

**关键文件**:
- `server-go/internal/practice/service.go` — `Create()` 构造 `PracticeGeneratePayload`
- `server-go/internal/practice/worker.go` — Worker 调用 `GenerateQuestions()`
- `server-go/internal/ai/adk.go` — `GenerateQuestions()` 构建 AI 请求
- `server-go/internal/ai/schema.go` — `QuestionGenRequest` 结构

---

## 实现方案

### Step 1: QuestionGenRequest 新增难度参数

**文件**: `server-go/internal/ai/schema.go`

```go
type QuestionGenRequest struct {
    // 现有字段...

    // 新增难度参数
    DifficultyLevel string `json:"difficulty_level"` // easy/medium/hard
    DifficultyHint  string `json:"difficulty_hint"`  // 给 AI 的难度提示
}
```

### Step 2: 难度映射函数

**文件**: `server-go/internal/practice/service.go`

```go
// determineDifficulty 根据学生掌握度决定题目难度
func (s *Service) determineDifficulty(ctx context.Context, studentID int64, abilityCode string) (string, string) {
    // 查询该能力点的掌握度
    masteries, err := s.masteryService.ListMastery(ctx, studentID, MasteryFilter{
        AbilityCode: abilityCode,
    })
    if err != nil || len(masteries) == 0 {
        return "medium", "基础难度"
    }

    rate := masteries[0].CorrectRate
    switch {
    case rate < 40:
        return "easy", "降低难度，使用基础知识点，避免复杂计算和陷阱"
    case rate > 70:
        return "hard", "提高难度，增加综合题、变式题，考察深度理解"
    default:
        return "medium", "标准难度，巩固当前知识点"
    }
}
```

### Step 3: Create 方法中注入难度

**文件**: `server-go/internal/practice/service.go`

在 `Create()` 方法中，创建练习前查询难度：

```go
func (s *Service) Create(ctx context.Context, req CreateRequest) (*Practice, error) {
    // ... 现有参数校验 ...

    // 查询难度
    difficultyLevel, difficultyHint := s.determineDifficulty(ctx, req.StudentID, req.AbilityCode)

    practice := &Practice{
        // ... 现有字段 ...
    }

    // 在 config JSON 中记录难度（使用 json.Marshal 避免 JSON 注入）
    config := map[string]string{
        "difficulty_level": difficultyLevel,
        "difficulty_hint":  difficultyHint,
    }
    data, err := json.Marshal(config)
    if err != nil {
        return nil, fmt.Errorf("序列化难度配置失败: %w", err)
    }
    practice.Config = data

    // ... 入队 ...
}
```

### Step 4: Worker 传递难度到 AI

**文件**: `server-go/internal/practice/worker.go`

```go
func handlePracticeGenerate(ctx context.Context, svc *Service, payload PracticeGeneratePayload) error {
    // 从 practice.config 中解析难度
    practice, _ := svc.repo.GetPracticeByID(ctx, payload.PracticeID)
    var config struct {
        DifficultyLevel string `json:"difficulty_level"`
        DifficultyHint  string `json:"difficulty_hint"`
    }
    json.Unmarshal(practice.Config, &config)

    // 传递给 AI
    genReq := ai.QuestionGenRequest{
        // ... 现有字段 ...
        DifficultyLevel: config.DifficultyLevel,
        DifficultyHint:  config.DifficultyHint,
    }

    questions, err := svc.aiProvider.GenerateQuestions(ctx, genReq)
    // ...
}
```

### Step 5: AI Prompt 模板注入难度

**文件**: `server-go/internal/ai/adk.go`

在 `GenerateQuestions()` 构建 Prompt 时注入难度参数：

```go
prompt += fmt.Sprintf("\n\n难度要求: %s\n难度说明: %s", 
    req.DifficultyLevel, req.DifficultyHint)
```

---

## 验收标准

1. 正确率 < 40% 的学生生成 easy 难度题目
2. 正确率 > 70% 的学生生成 hard 难度题目
3. 中间范围生成 medium 难度题目
4. 无历史数据时默认 medium
5. AI Prompt 中包含明确的难度指示
