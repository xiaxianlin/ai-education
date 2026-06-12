# P1-06 练习报告 AI 生成与展示完善

> **优先级**: P0 | **预估工期**: 2天 | **前置依赖**: P1-04
> **状态**: 🔧 部分完成（后端 buildReport 仅算 overall_score，AI 报告未触发）

---

## 现状分析

**核心问题**: `practice/service.go` 的 `Complete()` 方法中：
- 直接调用 `buildReport()` 构建简单报告（仅含 `overall_score = correct/total * 100`）
- **从未入队** `report.generate` 任务
- **从未调用** `AI.GenerateReport()` 生成完整分析
- `queue.NewReportGenerateTask()` 和 `ReportGeneratePayload` 已定义但**无人使用**
- `queue.Registry` 中 `report.generate` **无 handler 注册**

**关键文件**:
- `server-go/internal/practice/service.go` — `Complete()` 方法，`buildReport()` 函数
- `server-go/internal/practice/worker.go` — 仅有 `practice.generate` handler
- `server-go/internal/practice/types.go` — `PracticeReport` 结构
- `server-go/internal/ai/adk.go` — `GenerateReport()` 已实现
- `server-go/internal/ai/schema.go` — `ReportGenerator` 接口 + `PracticeReportDraft`
- `server-go/internal/mastery/sql_repository.go` — 掌握度仅有查询

---

## 实现方案

### Step 1: 完善 PracticeReport 数据结构

**文件**: `server-go/internal/practice/types.go`

确保 `PracticeReport` 包含完整的 AI 报告字段：

```go
type PracticeReport struct {
    ID          string          `json:"id"`
    PracticeID  string          `json:"practice_id"`
    StudentID   int64           `json:"student_id"`

    // 基础统计
    OverallScore    float64 `json:"overall_score"`    // 总分 (0-100)
    CorrectCount    int     `json:"correct_count"`    // 正确数
    TotalCount      int     `json:"total_count"`      // 总题数
    DurationSeconds int     `json:"duration_seconds"` // 用时(秒)

    // AI 生成报告字段 (JSON)
    AbilityBreakdown json.RawMessage `json:"ability_breakdown,omitempty"` // 各能力点得分
    Strengths        json.RawMessage `json:"strengths,omitempty"`         // 优势分析
    Weaknesses       json.RawMessage `json:"weaknesses,omitempty"`        // 薄弱项
    Recommendations  json.RawMessage `json:"recommendations,omitempty"`   // 改进建议
    Summary          string          `json:"summary,omitempty"`           // 总结评语

    Status      int       `json:"status"`       // 0:生成中 1:完成 -1:失败
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

**文件**: `server-go/internal/practice/sql_repository.go`

确保 `ah_practice_report` 表对应的读写方法支持新字段。检查现有 SQL：
- `CreateReport()` — 需写入所有新字段
- `GetReport()` — 需读取所有新字段
- `UpdateReport()` — **新增方法**，AI 报告生成后更新

```go
// 新增: UpdateReport 更新 AI 报告内容
func (r *SQLRepository) UpdateReport(ctx context.Context, report *PracticeReport) error {
    query := `UPDATE ah_practice_report 
              SET ability_breakdown = ?, strengths = ?, weaknesses = ?, 
                  recommendations = ?, summary = ?, status = ?, updated_at = NOW()
              WHERE id = ?`
    _, err := r.db.ExecContext(ctx, query,
        report.AbilityBreakdown, report.Strengths, report.Weaknesses,
        report.Recommendations, report.Summary, report.Status, report.ID,
    )
    return err
}
```

### Step 2: 注册 report.generate Handler

**文件**: `server-go/internal/practice/worker.go`

新增 `report.generate` handler 注册：

```go
// RegisterReportWorkerHandlers 注册报告生成 worker handler
func RegisterReportWorkerHandlers(registry *queue.Registry, service *Service) {
    queue.RegisterTypedHandler(registry, queue.TaskReportGenerate, 
        func(ctx context.Context, payload queue.ReportGeneratePayload) error {
            return service.HandleReportGenerate(ctx, payload)
        },
    )
}
```

**文件**: `server-go/cmd/worker/main.go`

在 worker 启动时注册报告 handler：

```go
// 在已有 practice.RegisterWorkerHandlers 旁新增:
practice.RegisterReportWorkerHandlers(registry, practiceService)
```

### Step 3: 实现 HandleReportGenerate 业务逻辑

**文件**: `server-go/internal/practice/service.go`

新增方法：

```go
// HandleReportGenerate 处理 AI 报告生成任务
func (s *Service) HandleReportGenerate(ctx context.Context, payload queue.ReportGeneratePayload) error {
    // 1. 获取练习会话及所有答案
    session, err := s.repo.GetPracticeByID(ctx, payload.PracticeID)
    if err != nil {
        return fmt.Errorf("获取练习失败: %w", err)
    }

    answers, err := s.repo.GetAnswersByPracticeID(ctx, payload.PracticeID)
    if err != nil {
        return fmt.Errorf("获取答案失败: %w", err)
    }

    // 2. 调用 AI 生成报告
    req := ai.ReportRequest{
        PracticeID:   payload.PracticeID,
        StudentID:    session.StudentID,
        PracticeType: session.Type,
        Answers:      convertAnswersToReportInput(answers),
        OverallScore: float64(session.CorrectCount) * 100 / float64(session.QuestionCount),
    }

    draft, err := s.reportGenerator.GenerateReport(ctx, req)
    if err != nil {
        // 标记报告生成失败
        s.repo.UpdateReport(ctx, &PracticeReport{
            ID:     payload.ReportID,
            Status: -1,
        })
        return fmt.Errorf("AI 报告生成失败: %w", err)
    }

    // 3. 更新报告
    report := &PracticeReport{
        ID:               payload.ReportID,
        AbilityBreakdown: draft.AbilityBreakdown,
        Strengths:        draft.Strengths,
        Weaknesses:       draft.Weaknesses,
        Recommendations:  draft.Recommendations,
        Summary:          draft.Summary,
        Status:           1, // 完成
    }
    return s.repo.UpdateReport(ctx, report)
}
```

### Step 4: 修改 Complete() 触发 AI 报告生成

**文件**: `server-go/internal/practice/service.go`

修改 `Complete()` 方法，在写入基础报告后入队 AI 报告生成：

```go
func (s *Service) Complete(ctx context.Context, practiceID string) error {
    // ... 现有逻辑: 校验、更新 status、计算基础分数 ...
    
    // 创建基础报告（仅含统计数据）
    report := s.buildReport(session, answers)
    if err := s.repo.CreateReport(ctx, report); err != nil {
        return err
    }

    // 入队 AI 报告生成任务
    task := queue.NewReportGenerateTask(queue.ReportGeneratePayload{
        PracticeID: practiceID,
        ReportID:   report.ID,
        StudentID:  session.StudentID,
    })
    if err := s.queue.Enqueue(ctx, task); err != nil {
        // AI 报告生成失败不影响主流程，仅记录日志
        log.Printf("WARN: 入队 AI 报告生成任务失败: %v", err)
    }

    return nil
}
```

### Step 5: Service 注入 ReportGenerator

**文件**: `server-go/internal/practice/service.go`

在 `Service` 结构中新增 `reportGenerator` 字段：

```go
type Service struct {
    repo             Repository
    queue            queue.Enqueuer
    evaluator        ai.AnswerEvaluator
    reportGenerator  ai.ReportGenerator  // 新增
    abilityService   *ability.Service
    questionService  *question.Service
}
```

**文件**: `server-go/cmd/api/main.go`

在依赖注入时传入 `reportGenerator`：

```go
practiceService := practice.NewService(
    practiceRepo,
    enqueuer,
    aiProvider,        // evaluator
    aiProvider,        // reportGenerator (ADKProvider 同时实现两个接口)
    abilitySvc,
    questionSvc,
)
```

### Step 6: 前端报告展示完善

**文件**: `apps/student-web/src/pages/PracticeResult/models/page.ts`

确保 `PracticeResultModel` 加载完整报告数据，并在 Model 层解析 JSON 字符串，组件层只消费已解析的数据：

```typescript
// 安全解析 JSON 字符串，失败时返回 fallback
function safeParseJSON<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn('JSON 解析失败，使用默认值', raw);
    return fallback;
  }
}

// 获取报告详情（含 AI 字段），并在 Model 层完成 JSON 解析
const fetchReport = async () => {
  const report = await apiClient.get(`/api/student/practice/${sessionId}/report`);
  return {
    ...report,
    strengths: safeParseJSON<string[]>(report.strengths, []),
    weaknesses: safeParseJSON<string[]>(report.weaknesses, []),
    recommendations: safeParseJSON<string[]>(report.recommendations, []),
    abilityBreakdown: safeParseJSON<Record<string, number>>(report.ability_breakdown, {}),
  };
};
```

**文件**: `apps/student-web/src/pages/PracticeResult/components/ReportSummary.tsx`

新增 AI 报告展示区块。以下组件消费 Model 层已解析的数据（`string[]`），不再直接调用 `JSON.parse`：

```tsx
{/* AI 评价总结 */}
{report.summary && (
  <div className="mt-6 rounded-lg border bg-white p-4">
    <h3 className="text-lg font-semibold">综合评价</h3>
    <p className="mt-2 text-gray-700">{report.summary}</p>
  </div>
)}

{/* 优势与薄弱项 */}
{report.strengths?.length > 0 && (
  <div className="mt-4 rounded-lg border bg-green-50 p-4">
    <h4 className="font-medium text-green-700">💪 表现不错</h4>
    <ul className="mt-2 space-y-1">
      {report.strengths.map((s: string, i: number) => (
        <li key={i} className="text-sm text-green-600">• {s}</li>
      ))}
    </ul>
  </div>
)}

{report.weaknesses?.length > 0 && (
  <div className="mt-4 rounded-lg border bg-orange-50 p-4">
    <h4 className="font-medium text-orange-700">📝 需要加强</h4>
    <ul className="mt-2 space-y-1">
      {report.weaknesses.map((w: string, i: number) => (
        <li key={i} className="text-sm text-orange-600">• {w}</li>
      ))}
    </ul>
  </div>
)}

{/* 改进建议 */}
{report.recommendations?.length > 0 && (
  <div className="mt-4 rounded-lg border bg-blue-50 p-4">
    <h4 className="font-medium text-blue-700">🎯 学习建议</h4>
    <ul className="mt-2 space-y-1">
      {report.recommendations.map((r: string, i: number) => (
        <li key={i} className="text-sm text-blue-600">• {r}</li>
      ))}
    </ul>
  </div>
)}
```

---

## 验收标准

1. 学生完成练习后，基础报告（分数、正确率）立即生成
2. AI 报告（总结、优势、薄弱项、建议）异步生成，生成后前端刷新展示
3. AI 报告生成失败时基础报告仍可正常展示
4. 管理端 `PracticeDetail` 页面的 `Report` tab 同步展示 AI 报告内容
5. 报告的 `status` 字段正确反映生成状态（0生成中/1完成/-1失败）
