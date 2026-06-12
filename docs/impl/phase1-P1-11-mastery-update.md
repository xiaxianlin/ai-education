# P1-11 掌握度自动更新（练习完成后联动）

> **优先级**: P0 | **预估工期**: 2天 | **前置依赖**: P1-06
> **状态**: 🔧 待开发（Go 端仅有只读查询，无写入逻辑）

---

## 现状分析

**核心问题**: Go 端 `mastery` 模块**只有查询，没有写入**：
- `SQLRepository` 只读 `ah_student_ability_mastery` 表
- 练习完成后没有触发掌握度更新
- `Complete()` 方法中只更新了 `practice` 表的 `status`，未联动 mastery

**关键文件**:
- `server-go/internal/mastery/sql_repository.go` — 仅 SELECT 查询
- `server-go/internal/mastery/types.go` — Mastery, MasteryWithInfo 等类型
- `server-go/internal/practice/service.go` — `Complete()` 方法
- `server-go/internal/practice/sql_repository.go` — `ah_practice_answer` 表

---

## 实现方案

### Step 1: Mastery Repository 新增写入方法

**文件**: `server-go/internal/mastery/repository.go`

在 `Repository` 接口中新增：

```go
type Repository interface {
    // 现有查询方法
    ListMastery(ctx context.Context, studentID int64, filter MasteryFilter) ([]MasteryWithInfo, error)
    ListWeakMastery(ctx context.Context, studentID int64, threshold float64, limit int) ([]Mastery, error)
    GetSummary(ctx context.Context, studentID int64) (Summary, error)
    GetPracticeStatistics(ctx context.Context, studentID int64, startTime time.Time) (Statistics, error)

    // 新增写入方法
    UpsertMastery(ctx context.Context, mastery *Mastery) error
    BatchUpsertMastery(ctx context.Context, masteries []*Mastery) error
}
```

### Step 2: SQL 实现

**文件**: `server-go/internal/mastery/sql_repository.go`

```go
// GetMastery 查询单条掌握度记录（用于累积计算时读取旧值）
func (r *SQLRepository) GetMastery(ctx context.Context, studentID int64, abilityCode string) (*Mastery, error) {
    query := `SELECT student_id, ability_code, correct_rate, practice_count, latest_score, mastery_level, updated_at
              FROM ah_student_ability_mastery
              WHERE student_id = ? AND ability_code = ?`
    row := r.db.QueryRowContext(ctx, query, studentID, abilityCode)
    var m Mastery
    err := row.Scan(&m.StudentID, &m.AbilityCode, &m.CorrectRate, &m.PracticeCount,
        &m.LatestScore, &m.MasteryLevel, &m.UpdatedAt)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    return &m, err
}

// UpsertMastery 插入或更新掌握度（累积计算：加权平均正确率 + 累加练习次数）
func (r *SQLRepository) UpsertMastery(ctx context.Context, m *Mastery) error {
    query := `INSERT INTO ah_student_ability_mastery 
              (student_id, ability_code, correct_rate, practice_count, latest_score, mastery_level, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, NOW())
              ON DUPLICATE KEY UPDATE 
                correct_rate = VALUES(correct_rate),
                practice_count = VALUES(practice_count),
                latest_score = VALUES(latest_score),
                mastery_level = VALUES(mastery_level),
                updated_at = NOW()`
    _, err := r.db.ExecContext(ctx, query,
        m.StudentID, m.AbilityCode, m.CorrectRate, m.PracticeCount,
        m.LatestScore, m.MasteryLevel,
    )
    return err
}

func (r *SQLRepository) BatchUpsertMastery(ctx context.Context, masteries []*Mastery) error {
    // 循环调用 UpsertMastery，或使用 batch SQL
    for _, m := range masteries {
        if err := r.UpsertMastery(ctx, m); err != nil {
            return err
        }
    }
    return nil
}
```

### Step 3: Mastery Service 新增更新方法

**文件**: `server-go/internal/mastery/service.go`

```go
// UpdateAfterPractice 练习完成后更新掌握度（累积计算，非覆盖）
func (s *Service) UpdateAfterPractice(ctx context.Context, studentID int64, answers []AnswerMasteryInput) error {
    // 按能力点分组统计
    grouped := groupAnswersByAbility(answers)
    
    var masteries []*Mastery
    for abilityCode, items := range grouped {
        correctCount := 0
        for _, item := range items {
            if item.IsCorrect {
                correctCount++
            }
        }
        
        currentRate := float64(correctCount) / float64(len(items)) * 100
        currentCount := len(items)

        // 读取旧值，进行累积计算（加权平均）
        old, err := s.repo.GetMastery(ctx, studentID, abilityCode)
        if err != nil {
            return err
        }

        var newRate float64
        var newCount int
        if old != nil && old.PracticeCount > 0 {
            // 累积：加权平均正确率
            newCount = old.PracticeCount + currentCount
            newRate = (old.CorrectRate*float64(old.PracticeCount) + currentRate*float64(currentCount)) / float64(newCount)
        } else {
            // 首次练习，直接使用本次数据
            newCount = currentCount
            newRate = currentRate
        }
        
        mastery := &Mastery{
            StudentID:    studentID,
            AbilityCode:  abilityCode,
            CorrectRate:  newRate,
            PracticeCount: newCount,
            LatestScore:  currentRate,
            MasteryLevel: calculateMasteryLevel(newRate),
        }
        masteries = append(masteries, mastery)
    }
    
    return s.repo.BatchUpsertMastery(ctx, masteries)
}

func calculateMasteryLevel(rate float64) int {
    switch {
    case rate >= 80:
        return 4 // 熟练掌握
    case rate >= 60:
        return 3 // 基本掌握
    case rate >= 40:
        return 2 // 初步掌握
    default:
        return 1 // 未掌握
    }
}

type AnswerMasteryInput struct {
    AbilityCode string
    IsCorrect   bool
    Score       int
}
```

### Step 4: Practice Service 联动 Mastery

**文件**: `server-go/internal/practice/service.go`

在 `Complete()` 中新增掌握度更新调用：

```go
type Service struct {
    // ... 现有字段
    masteryService *mastery.Service  // 新增
}

func (s *Service) Complete(ctx context.Context, practiceID string) error {
    // ... 现有逻辑（更新 status、创建报告）...

    // 新增：更新掌握度
    answers, _ := s.repo.GetAnswersByPracticeID(ctx, practiceID)
    var masteryInputs []mastery.AnswerMasteryInput
    for _, a := range answers {
        masteryInputs = append(masteryInputs, mastery.AnswerMasteryInput{
            AbilityCode: a.AbilityCode,  // 需从 question 关联获取
            IsCorrect:   a.IsCorrect,
            Score:       a.Score,
        })
    }
    if err := s.masteryService.UpdateAfterPractice(ctx, session.StudentID, masteryInputs); err != nil {
        log.Printf("WARN: 更新掌握度失败: %v", err)
        // 掌握度更新失败不影响主流程
    }

    return nil
}
```

### Step 5: 依赖注入

**文件**: `server-go/cmd/api/main.go`

```go
masteryRepo := mastery.NewSQLRepository(db)
masteryService := mastery.NewService(masteryRepo)

practiceService := practice.NewService(
    practiceRepo, enqueuer, aiProvider, aiProvider,
    abilitySvc, questionSvc,
    masteryService,  // 新增
)
```

---

## 验收标准

1. 学生完成练习后，`ah_student_ability_mastery` 表自动更新
2. 正确率按能力点分组计算，更新对应的 mastery 记录
3. 首次练习某能力点时自动创建 mastery 记录（INSERT）
4. 重复练习时**累积计算**加权平均正确率和累加练习次数（UPDATE），而非直接覆盖
5. 掌握度更新失败不阻塞练习完成流程
6. `LatestScore` 记录本次练习的正确率，`CorrectRate` 为历史累积加权平均
