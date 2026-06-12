# 📋 开发计划文档代码审查报告

> **审查日期**: 2026-06-12
> **审查范围**: `docs/` 目录下 14 份开发计划文档 + 3 份总纲文档
> **项目**: ai-education (小学生 AI 练习系统)

---

## 🔴 严重问题（必须修复）

### 1. P1-07 文档与代码库严重脱节

**文件**: `docs/impl/phase1-P1-07-redis-queue.md`

文档标记为 📋"待开发"，要求 **新建** `redis.go`、`redis_client.go`、`worker.go`。但实际代码库中这三个文件 **已经存在且已实现**：

- `server-go/internal/queue/redis.go` — 86 行，`RedisEnqueuer` 完整实现
- `server-go/internal/queue/redis_client.go` — 31 行，含 Ping 连接验证
- `server-go/internal/queue/worker.go` — 114 行，BRPOP 消费循环 + requeue
- `server-go/internal/queue/redis_test.go` — 260 行，基于 miniredis 的完整测试

文档中的代码示例与实际实现接口不一致：
- 文档写 `Enqueue` 返回 `(string, error)`，实际返回 `(TaskReceipt, error)`
- 文档写 `Worker` 持有 `*RedisEnqueuer`，实际持有 `*redis.Client`
- 文档的 `Fail()` 方法签名与实际 `requeue()` 方法不匹配

**风险**: 程序员按文档"新建"会覆盖已有代码，或因接口不匹配导致编译失败。

**建议**: 将 P1-07 状态改为 ✅ 或 🔧，改为"补全/完善"而非"从零新建"。删除重复代码示例，改为引用实际文件。

---

### 2. P1-05 主观题评判存在 Prompt 注入安全漏洞

**文件**: `docs/impl/phase1-P1-05-subjective-evaluation.md` Step 2, Line 62-85

```go
prompt := fmt.Sprintf(`...
题目内容: %s
标准答案: %s
学生答案: %s
...`,
    string(req.Question.Content),
    string(req.CorrectAnswer),
    string(req.StudentAnswer),
)
```

`Content`、`CorrectAnswer`、`StudentAnswer` 都是 `json.RawMessage`（用户可控内容），直接 `Sprintf` 到 Prompt 中无任何转义。恶意构造的答案可以注入指令，操纵 AI 评判结果。

**建议**: 使用结构化 Prompt 模板 + XML 标签隔离用户输入：
```go
prompt := fmt.Sprintf(`...请评判学生答案。
<question_content>%s</question_content>
<correct_answer>%s</correct_answer>
<student_answer>%s</student_answer>`, ...)
```

---

### 3. P1-13 难度参数注入 JSON 字符串拼接导致 JSON 注入

**文件**: `docs/impl/phase1-P1-13-difficulty-adjust.md` Step 3, Line 81-84

```go
practice.Config = json.RawMessage(fmt.Sprintf(
    `{"difficulty_level": "%s", "difficulty_hint": "%s"}`,
    difficultyLevel, difficultyHint,
))
```

`difficultyHint` 包含中文描述（如 `"降低难度，使用基础知识点"`），直接拼接到 JSON 字符串中。如果内容包含双引号、反斜杠或换行，会生成 **无效 JSON**，导致后续解析崩溃。

**建议**: 使用 `json.Marshal`：
```go
config := map[string]string{
    "difficulty_level": difficultyLevel,
    "difficulty_hint":  difficultyHint,
}
data, _ := json.Marshal(config)
practice.Config = data
```

---

### 4. P1-06 前端代码直接 `JSON.parse` 无错误处理

**文件**: `docs/impl/phase1-P1-06-report-generation.md` Step 6, Line 256-270

```tsx
{JSON.parse(report.strengths).map((s, i) => (...))}
{JSON.parse(report.weaknesses).map((w, i) => (...))}
{JSON.parse(report.recommendations).map((r, i) => (...))}
```

- 无 try-catch，如果后端返回格式异常（非数组、空字符串、畸形 JSON），**整个组件白屏崩溃**
- 在 JSX 渲染中调用 `JSON.parse` 也有性能问题（每次渲染都重新解析）

**建议**: 在 Model 层解析，组件只消费已解析的数据。

---

## 🟠 重要问题（强烈建议修复）

### 5. P1-07 Redis Worker 无限重试 — 失败任务会永远循环

**文件**: `docs/impl/phase1-P1-07-redis-queue.md` Step 4, Line 113-118（文档版本）

实际代码 `worker.go:84-87` 也存在同样问题：

```go
if err := w.registry.Handle(ctx, task); err != nil {
    w.requeue(ctx, key, task)  // 无限重试，无退避，无最大重试次数
}
```

失败任务立即重新 `LPush` 到队列头，如果错误是持久性的（如 AI API Key 失效），会形成**无限循环**，打满 Redis 和日志。

**建议**:
- Task 结构增加 `RetryCount` 字段
- 超过 `maxRetries`（如 3 次）后推入死信队列或标记失败
- 加入指数退避

---

### 6. P1-08 缺少最大重试次数限制

**文件**: `docs/impl/phase1-P1-08-retry-mechanism.md`

验收标准第 4 条提到"最多重试 3 次"，但实现代码中 **没有** 任何重试计数逻辑。`RetryGenerate` 方法只检查 `GenerateStatus != -1`，不检查重试次数。

---

### 7. P1-09 废弃状态没有处理生成中的练习

**文件**: `docs/impl/phase1-P1-09-abandoned-status.md` Step 2

```go
if session.Status == 2 || session.Status == 3 {
    return ErrCannotAbandon
}
```

仅阻止了已完成和已废弃的。但 `generate_status == 0`（AI 正在生成题目）时也可以废弃，废弃后 Worker 的 `practice.generate` 任务完成后会更新 `generate_status`，可能产生**竞态条件**。

**建议**: 废弃时检查 `generate_status`，若为 0 则标记取消标记让 Worker 忽略该任务。

---

### 8. P1-11 掌握度更新覆盖而非累积

**文件**: `docs/impl/phase1-P1-11-mastery-update.md` Step 3, Line 92-98

```go
correctRate := float64(correctCount) / float64(len(items)) * 100
```

每次练习完成时，`correct_rate` 和 `practice_count` 被**直接覆盖**为本次练习的数据，而非与历史数据累积计算。例如：
- 第一次练习：10 题对 8 题 → 80%
- 第二次练习：5 题对 2 题 → 40%
- 实际正确率应为 10/15 = 66.7%，但存储的是 40%

这与验收标准第 4 条"重复练习时更新已有记录"的预期矛盾。

**建议**: `UpsertMastery` 中先读取旧值，计算加权平均：
```go
newCount := old.PracticeCount + currentCount
newRate := (old.CorrectRate * float64(old.PracticeCount) + currentRate * float64(currentCount)) / float64(newCount)
```

---

### 9. P1-12 移动端 `auth.ts` store 中 `user` 类型为 `any`

**文件**: `docs/impl/phase1-P1-22-to-P1-26-mobile.md` Line 72

```typescript
user: any | null;
```

项目规范明确禁止 `any`（development-standards.md Line 27："禁止 `any`"）。这里应定义 `User` 接口。

---

### 10. development-standards.md Line 621 拼写错误

```go
if len(q.Anver.Array()) < 2 { return ErrInvalidAnswer }
```

`Anver` 应为 `Answer`。虽然是示例代码，但作为规范文档会误导程序员。

---

## 🟡 一般问题（建议修复）

### 11. P1-06 `HandleReportGenerate` 整数除法精度丢失

**文件**: `docs/impl/phase1-P1-06-report-generation.md` Line 134

```go
OverallScore: session.CorrectCount * 100 / session.QuestionCount,
```

Go 中整数除法会截断。`3 * 100 / 7 = 42`（实际 42.86）。`OverallScore` 字段类型是 `float64`，应使用浮点除法：
```go
OverallScore: float64(session.CorrectCount) * 100 / float64(session.QuestionCount),
```

---

### 12. P1-19 `EditModal` 的 `JSON.parse` 无校验

**文件**: `docs/impl/phase1-P1-19-question-management.md` Line 85-87

```tsx
content: JSON.parse(values.content),
answer: JSON.parse(values.answer),
```

管理端编辑 JSON 时如果格式错误会抛异常崩溃。应 try-catch 并给出错误提示。

---

### 13. P1-20 管理端掌握度接口假设存在但未验证

**文件**: `docs/impl/phase1-P1-20-student-data-view.md` Step 4

文档使用 `GET /api/admin/student/{id}/mastery`，但标注"确认已有以下接口（或需新增）"。如果是新增接口，应提供完整的后端实现步骤和路由注册，而不只是 Handler 代码片段。

---

### 14. P1-05 `IsCorrect` 判定阈值硬编码

**文件**: `docs/impl/phase1-P1-05-subjective-evaluation.md` Line 40

```go
IsCorrect bool // 是否正确 (Score >= MaxScore * 0.6)
```

60% 及格线硬编码在代码注释中。不同题型/场景可能有不同及格线，建议可配置化。

---

### 15. feature-development-plan.md 工期估算过于乐观

**文件**: `docs/feature-development-plan.md` Line 136

Phase 1: 20 个待开发功能，预估 6-8 周。但其中移动端（P1-22~26）就占 10 天，加上主观题评判、Redis 对接、掌握度联动等核心功能，6-8 周对一个小团队来说偏紧。建议标注为 8-10 周。

---

### 16. P3-03 RBAC 权限表结构缺失

**文件**: `docs/impl/phase3-scale.md`

定义了 Role 和 Permission 类型，但没有 `ah_role`、`ah_permission`、`ah_role_permission` 等表结构。也没有说明角色如何与 manager/student 关联。

---

## ✅ 文档亮点

1. **现状分析准确**: P1-05、P1-06、P1-11 等文档对现有代码的分析非常精准，引用了具体文件和行号
2. **验收标准清晰**: 每个功能都有明确的验收标准，便于 QA 验证
3. **分层设计合理**: Handler → Service → Repository 三层架构在所有文档中保持一致
4. **渐进式降级**: P1-07 的 Redis 降级为 DispatchEnqueuer 的设计思路正确
5. **Phase 分期合理**: Phase 1 聚焦核心功能，Phase 2/3 渐进扩展

---

## 📊 审查结论

| 级别 | 数量 | 必须修复 |
|------|------|----------|
| 🔴 严重 | 4 | ✅ 是 |
| 🟠 重要 | 6 | 强烈建议 |
| 🟡 一般 | 6 | 建议 |
| **合计** | **16** | |

**整体评价**: 文档结构清晰、覆盖全面，但存在 **1 份文档（P1-07）与代码库严重脱节** 和 **2 个安全/健壮性问题**。建议优先修复 🔴 级别问题后再交给程序员执行。
