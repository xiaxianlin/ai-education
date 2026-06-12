# P1-06 练习报告 AI 生成与展示 — 代码审查报告

> **审查日期**: 2026-06-12
> **审查范围**: P1-06 全部改动（Go 后端 6 文件 + 前端学生端 3 文件 + 前端管理端 2 文件）
> **完成报告**: `docs/dev/P1-06-练习报告AI生成与展示.md`

---

## 改动文件清单

### Go 后端（6 个文件）

| 文件 | 改动 |
|------|------|
| `internal/practice/repository.go` | 新增 `UpdateReport` 接口方法 + MemoryRepository 实现 |
| `internal/practice/sql_repository.go` | 新增 `SQLRepository.UpdateReport` — UPDATE 所有 AI 字段 |
| `internal/practice/service.go` | 新增 `ReportGenerator` 接口 + `HandleReportGenerate()` 方法；`Complete()` 完成后异步入队 `report.generate` |
| `internal/practice/worker.go` | 新增 `NewReportGenerateHandler()` 工厂函数 |
| `cmd/api/main.go` | 传入 `aiProvider` 作为 reportGenerator，注册 in-process handler |
| `cmd/worker/main.go` | 替换占位符，使用真实 `NewReportGenerateHandler` |

### 前端学生端（3 个文件）

| 文件 | 改动 |
|------|------|
| `student-web/pages/PracticeResult/models/page.ts` | 新增 `ParsedReport` 类型 + `parseReport()` 解析 JSON 字符串 |
| `student-web/pages/PracticeResult/components/ReportSummary.tsx` | 重写 — 环形进度条 + AI 报告区块 |
| `student-web/pages/PracticeResult/views/Main.tsx` | 使用解析后的 `report` 传递给 `ReportSummary` |

### 前端管理端（2 个文件）

| 文件 | 改动 |
|------|------|
| `admin-web/pages/Practice/PracticeDetail/models/page.ts` | 同样新增 JSON 解析逻辑 |
| `admin-web/pages/Practice/PracticeDetail/views/Report.tsx` | 重写 — 基础统计 + AI 报告展示 |

---

## 🔴 严重问题（必须修复）

### 1. `HandleReportGenerate` 缺少 `StudentID` 验证，导致 `GetPracticeData` 必然失败

**文件**: `service.go` Line 431-448

```go
func (s *Service) HandleReportGenerate(ctx context.Context, payload queue.ReportGeneratePayload) error {
    if payload.SessionID == "" {
        return newValidationError("session_id 不能为空")
    }
    // ❌ 没有验证 payload.StudentID
    ...
    data, err := s.repo.GetPracticeData(ctx, payload.StudentID, payload.SessionID)
```

`GetPracticeData` 在 SQL 和 Memory 实现中都要求 `studentID` 匹配（`repository.go:245` `session.StudentID != studentID`）。`ReportGeneratePayload` 的 `StudentID` 字段标记为 `omitempty`（`payload.go:32`），如果 JSON 反序列化后为空字符串，`GetPracticeData` 会因 `studentID` 不匹配返回 `ErrForbidden`。

**风险**: Worker 调用 handler 时如果 payload 缺少 `student_id`，报告生成静默失败。

**建议**: 在 Line 432 后增加：

```go
if payload.StudentID == "" {
    return newValidationError("student_id 不能为空")
}
```

---

### 2. `HandleReportGenerate` 不验证会话状态 — 对未完成/废弃的练习也会生成报告

**文件**: `service.go` Line 439-443

```go
session, err := s.repo.GetPracticeByID(ctx, payload.SessionID)
// ❌ 没有检查 session.Status == PracticeStatusCompleted
// ❌ 没有检查 session.GenerateStatus == GenerateStatusCompleted
```

虽然调用方 `Complete()` 已确保状态正确，但任务队列是异步的。如果练习被重置（`ResetPractice`）或废弃后 worker 才消费到任务，会为无效状态生成报告并覆盖数据库。

**建议**: 增加 guard：

```go
if session.Status != PracticeStatusCompleted {
    return fmt.Errorf("练习未完成，跳过报告生成: status=%d", session.Status)
}
```

---

### 3. `UpdateReport` SQL 缺少 `update_time` 字段

**文件**: `sql_repository.go` Line 656-682

```sql
UPDATE ah_practice_report
SET overall_score = ?, current_ability = ?, confidence = ?, ability_level = ?,
    percentile = ?, knowledge_scores = ?, question_distribution = ?,
    ability_breakdown = ?, learning_speed = ?, consistency = ?,
    strengths = ?, weaknesses = ?, recommendations = ?, total_time = ?
WHERE session_id = ?
```

没有更新 `update_time`。所有其他 UPDATE 操作都更新了 `update_time`。这意味着报告的 `update_time` 永远停留在 `CreateReport` 时的值，前端无法判断 AI 报告是否已刷新。

**建议**: 在 SET 子句中加入 `update_time = ?` 并传入当前时间戳。

---

## 🟠 重要问题（强烈建议修复）

### 4. `queue.NewReportGenerateTask` 不验证 `StudentID`

**文件**: `internal/queue/payload.go` Line 65-70

```go
func NewReportGenerateTask(payload ReportGeneratePayload, opts ...TaskOption) (Task, error) {
    if payload.SessionID == "" {
        return Task{}, errors.New("report generate payload requires session_id")
    }
    // ❌ 不验证 StudentID
    return NewTask(TaskReportGenerate, payload, opts...)
}
```

handler 强依赖 `StudentID`（`GetPracticeData` 需要），但构造函数不强制要求。未来其他调用方可能遗漏。

**建议**: 在 `NewReportGenerateTask` 中也验证 `StudentID` 不为空。

---

### 5. `HandleReportGenerate` 两步获取存在鉴权不一致

**文件**: `service.go` Line 440 vs 446

```go
session, err := s.repo.GetPracticeByID(ctx, payload.SessionID)  // 无 studentID 校验
data, err := s.repo.GetPracticeData(ctx, payload.StudentID, payload.SessionID)  // 有 studentID 校验
```

第一步不校验归属，第二步才校验。如果 `StudentID` 为空，第一步成功但第二步失败。

**建议**: 统一使用 `GetPracticeData`，或在第一步后校验 `session.StudentID == payload.StudentID`。

---

### 6. 前端 `ParsedReport` 未解析 `knowledge_scores` 字段

**文件**: `student-web/.../models/page.ts` Line 22-28, `admin-web/.../models/page.ts` Line 20-27

```typescript
export interface ParsedReport extends Omit<PracticeReport,
  'strengths' | 'weaknesses' | 'recommendations' | 'ability_breakdown' | 'question_distribution'
> {
```

`knowledge_scores` 不在 `Omit` 列表中，也未在 `parseReport` 中做 `safeParseJSON`。后端 `KnowledgeScores` 是 `JSONMap`，序列化后是 JSON 字符串。如果前端尝试遍历它，会得到字符串的字符遍历而非键值对。

**建议**: 将 `knowledge_scores` 加入 `Omit` 列表并在 `parseReport` 中解析。

---

### 7. 零测试覆盖

`HandleReportGenerate`、`UpdateReport`、`Complete` 入队逻辑均无测试覆盖。

**缺失场景**:
- `Complete()` 入队 `report.generate` 的 happy path
- `HandleReportGenerate` 完整流程
- `UpdateReport` SQL 字段完整性
- AI 生成失败时的错误传播
- 前端 `parseReport` / `safeParseJSON` 边界情况（空字符串、畸形 JSON）

---

## 🟡 一般问题（建议修复）

### 8. `safeParseJSON` + `ParsedReport` + `parseReport` 在两个前端项目重复定义

**文件**:
- `student-web/src/pages/PracticeResult/models/page.ts` Line 12-19
- `admin-web/src/pages/Practice/PracticeDetail/models/page.ts` Line 10-17

完全相同的代码。`shared-web` 包正是用于共享此类代码。

**建议**: 抽取到 `packages/shared-web` 中统一维护。

---

### 9. `ReportSummary` 的 `overall_score.toFixed(1)` 未考虑空值

**文件**: `student-web/.../ReportSummary.tsx` Line 102

```tsx
<div>{overall_score.toFixed(1)}</div>
```

如果后端数据异常导致 `overall_score` 为 `undefined`/`null`，调用 `.toFixed()` 会抛 `TypeError` 导致组件崩溃。

**建议**: 使用 `(overall_score ?? 0).toFixed(1)`。

---

### 10. `Complete()` 入队失败只靠 `log.Printf`

**文件**: `service.go` Line 228-232

```go
log.Printf("WARN: 构建 report.generate 任务失败: %v", taskErr)
log.Printf("WARN: 入队 report.generate 任务失败: %v", enqueueErr)
```

入队失败只写日志，没有指标或恢复机制。在进程内模式下，如果 handler panic 或返回错误，日志可能不够明显。

**建议**: 在日志中加入 `session_id` 结构化字段，方便排查。

---

### 11. `NewReportGenerateHandler` 接受整个 `*Service` 但只使用 `HandleReportGenerate`

**文件**: `worker.go` Line 133-138

```go
func NewReportGenerateHandler(service *Service) func(context.Context, queue.ReportGeneratePayload) error {
    return func(ctx context.Context, payload queue.ReportGeneratePayload) error {
        return service.HandleReportGenerate(ctx, payload)
    }
}
```

传入整个 `*Service` 意味着 handler 持有 service 的全部依赖，违反最小权限原则。

**建议**: 定义 interface 只暴露 `HandleReportGenerate`，或在 handler 工厂中直接接收需要的 deps。

---

## ✅ 代码亮点

1. **`NewService` variadic `...ReportGenerator`**: 优雅地不破坏现有调用方
2. **Model 层解析 JSON**: 前端组件拿到已解析的 typed 数据，`safeParseJSON` 有 try-catch 保护
3. **`buildReport` 正确使用浮点除法**: `float64(CorrectCount) / float64(QuestionCount) * 100`，避免了整数除法精度丢失
4. **`UpdateReport` 与 `CreateReport` 分离**: upsert 创建 vs 异步更新，职责清晰
5. **in-process handler 注册**: `cmd/api/main.go` 对 `*queue.DispatchEnqueuer` 做类型断言后注册，保证开发模式可用
6. **管理端 `Report.tsx`**: 使用 `parsedReport` + `hasAIReport` 双 flag 控制，避免直接操作原始 report

---

## 📊 审查结论

| 级别 | 数量 | 必须修复 |
|------|------|----------|
| 🔴 严重 | 3 | ✅ 是 |
| 🟠 重要 | 4 | 强烈建议 |
| 🟡 一般 | 4 | 建议 |
| **合计** | **11** | |

**整体评价**: 功能实现完整，从 handler 注册→入队→Worker 消费→AI 调用→DB 写入→前端展示全链路打通。代码风格与项目一致。**主要问题集中在 `HandleReportGenerate` 的输入校验不足和 `UpdateReport` SQL 遗漏 `update_time`**。建议修复 🔴 级别问题后再合入主分支。
