# P1-11 掌握度自动更新 — 代码审查报告

> **审查日期**: 2026-06-12 | **审查人**: AI Reviewer | **结论**: ✅ 通过（附 2 个需跟进项）

---

## 审查范围

| 文件 | 行数 | 审查状态 |
|------|------|---------|
| `internal/mastery/service.go` L132-205 | 新增 `UpdateAfterPractice` + `groupAnswersByAbility` | ✅ |
| `internal/mastery/types.go` L58-76 | 新增 `AnswerMasteryInput` + `CalculateMasteryLevel` | ✅ |
| `internal/mastery/repository.go` L19-53 | 接口新增 3 个写入方法 + stub | ✅ |
| `internal/mastery/sql_repository.go` L271-326 | `GetMastery` / `UpsertMastery` / `BatchUpsertMastery` | ✅ |
| `internal/practice/service.go` L27-30,57-63,250-300 | `MasteryUpdater` 接口 + 注入 + 联动调用 | ✅ |
| `cmd/api/main.go` L71,105 | 依赖注入 | ✅ |
| `internal/mastery/service_update_test.go` | 7 个单元测试 | ✅ |
| `tests/mastery/service_test.go` | fake 补齐 stub | ✅ |

---

## ✅ 做得好的地方

1. **接口解耦干净** — `practice` 包定义自己的 `MasteryUpdater` 接口，不直接依赖 `mastery` 包的 `Service`，符合 Go 接口隔离惯例
2. **`WithMasteryUpdater` 链式注入** — 不修改 `NewService` 签名，零破坏性
3. **失败不阻塞主流程** — `updateMasteryAfterComplete` 内所有错误仅 `log.Printf` + `return`，保证练习完成不受影响
4. **测试覆盖充分** — 首次、累积、三次累积、多能力点、空输入、时间戳、等级边界值，7 个用例覆盖核心路径
5. **`round2` 精度控制** — 避免浮点漂移
6. **mockRepo 用 `sync.Mutex`** — 测试本身线程安全

---

## ⚠️ 需跟进项（不阻塞合并，但需架构师确认）

### 1. 并发竞态风险（Medium）

**位置**: `service.go` L161-172 + `sql_repository.go` L272-312

同一学生快速完成两个练习时：

```
goroutine A: GetMastery → score=80, total=4
goroutine B: GetMastery → score=80, total=4    (读到相同旧值)
goroutine A: Upsert → score=70, total=8
goroutine B: Upsert → score=60, total=8        (覆盖 A 的结果)
```

**现状**: 当前单 `Complete()` 调用是同步的，但 HTTP handler 在不同 goroutine 中执行，理论上可并发。

**建议（三选一，需架构师确认）**:
- (a) `SELECT ... FOR UPDATE` + 事务包裹 Get→Upsert（最严谨）
- (b) 改用 SQL 原子算术：`UPDATE SET mastery_score = mastery_score * old_total / new_total + ...`（性能最好）
- (c) 在 `practice.Service.Complete()` 层面加 per-student 互斥锁（最简单）

**当前风险评级**: 低 — 小学生场景并发完成同一能力点练习的概率极低，数据最终会自我修正。

### 2. 单元练习能力点映射策略（Low）

**位置**: `practice/service.go` L290-300

```go
func resolveAbilityCode(session Practice, ans PracticeAnswer) string {
    if session.PracticeType == PracticeTypeAbility && session.AbilityCode != "" {
        return session.AbilityCode
    }
    if session.AbilityCode != "" {  // 单元练习走这里
        return session.AbilityCode
    }
    return ""
}
```

当前逻辑：单元练习复用 session 级 `AbilityCode`。但如果一个单元练习包含多个能力点的题目，所有答案都会映射到同一个能力点。

**需确认**: 这是过渡方案还是最终方案？如果是过渡方案，建议加 `// TODO:` 注释标注。

---

## 🔍 已确认无问题项

| 检查项 | 结果 |
|--------|------|
| SQL 注入 | ✅ 全部使用参数化查询 `?` 占位符 |
| 错误处理 | ✅ `ensureRepository()` / `ensureStore()` 防空指针；`sql.ErrNoRows` 正确处理为 `nil, nil` |
| 命名规范 | ✅ `PascalCase` 导出、`camelCase` 包内，符合 Go 惯例 |
| 分层架构 | ✅ Handler→Service→Repository 严格分层，业务逻辑在 Service 层 |
| 接口最小化 | ✅ `Queryer` 只暴露 `QueryContext` + `QueryRowContext` + `ExecContext` |
| `ON DUPLICATE KEY UPDATE` | ✅ `VALUES()` 写法 MySQL 兼容 |
| `UpsertMastery` 未使用死代码 | ✅ 被 `BatchUpsertMastery` 调用；也独立暴露给 Repository 接口供未来直接调用 |
| 测试用 mock 的 `UpsertMastery` 存储 | ✅ 存储 `*Mastery` 指针但 `GetMastery` 返回值拷贝 `cp := *m`，避免后续修改影响已存储数据 |

---

## 审查结论

**✅ 通过** — 代码质量良好，分层清晰，测试充分。2 个跟进项不阻塞合并，建议在下次迭代中确认并发策略。
