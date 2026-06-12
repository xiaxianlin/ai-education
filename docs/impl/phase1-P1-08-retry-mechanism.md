# P1-08 练习生成失败重试机制

> **优先级**: P2 | **预估工期**: 1天 | **前置依赖**: P1-07
> **状态**: 📋 待开发

---

## 现状分析

当 `practice.generate` 任务失败时：
- `generate_status` 被设为 `-1`
- 学生端看到"生成失败"
- **无法重试**，只能重新创建练习

---

## 实现方案

### Step 1: 后端新增重试接口

**文件**: `server-go/internal/practice/handler.go`

```go
// RetryGenerate 重试生成题目
func (h *Handler) RetryGenerate(w http.ResponseWriter, r *http.Request) {
    sessionID := r.PathValue("session_id")

    session, err := h.service.RetryGenerate(r.Context(), sessionID)
    if err != nil {
        response.Error(w, err)
        return
    }
    response.Success(w, session)
}
```

### Step 2: Service 层重试逻辑

**文件**: `server-go/internal/practice/service.go`

```go
const maxRetryCount = 3

func (s *Service) RetryGenerate(ctx context.Context, practiceID string) (*Practice, error) {
    session, err := s.repo.GetPracticeByID(ctx, practiceID)
    if err != nil {
        return nil, err
    }

    // 仅允许生成失败的重试
    if session.GenerateStatus != -1 {
        return nil, ErrCannotRetry
    }

    // 检查重试次数限制
    if session.RetryCount >= maxRetryCount {
        // 超过最大重试次数，标记为永久失败
        _ = s.repo.UpdateGenerateStatus(ctx, practiceID, -2) // -2 = 永久失败
        return nil, ErrMaxRetryExceeded
    }

    // 递增重试计数并重置状态
    if err := s.repo.IncrementRetryCount(ctx, practiceID); err != nil {
        return nil, err
    }
    if err := s.repo.UpdateGenerateStatus(ctx, practiceID, 0); err != nil {
        return nil, err
    }

    // 重新入队
    task := queue.NewPracticeGenerateTask(queue.PracticeGeneratePayload{
        PracticeID: practiceID,
        StudentID:  session.StudentID,
        // ...其他字段
    })
    if err := s.queue.Enqueue(ctx, task); err != nil {
        return nil, err
    }

    return session, nil
}
```

**文件**: `server-go/internal/practice/sql_repository.go`

新增重试计数更新方法：

```go
// IncrementRetryCount 递增重试计数
func (r *SQLRepository) IncrementRetryCount(ctx context.Context, practiceID string) error {
    query := `UPDATE ah_practice SET retry_count = retry_count + 1 WHERE id = ?`
    _, err := r.db.ExecContext(ctx, query, practiceID)
    return err
}
```

**说明**:
- `Practice` 结构需新增 `RetryCount int` 字段，数据库 `ah_practice` 表新增 `retry_count INT DEFAULT 0` 列
- `generate_status` 新增 `-2` 表示永久失败（超过最大重试次数），前端应展示对应提示
- `ErrMaxRetryExceeded` 为新增业务错误

### Step 3: 新增路由

**文件**: `server-go/internal/practice/routes.go`

```go
mux.HandleFunc("POST /api/student/practice/{session_id}/retry", handler.RetryGenerate)
```

### Step 4: 前端增加重试按钮

**文件**: `apps/student-web/src/pages/PracticeSession/views/Main.tsx`

在生成失败状态展示中添加重试按钮，并处理永久失败状态：

```tsx
{generateStatus === -2 && (
  <div className="flex flex-col items-center gap-4">
    <p className="text-gray-500">题目生成多次失败，请联系老师或稍后再试</p>
  </div>
)}

{generateStatus === -1 && (
  <div className="flex flex-col items-center gap-4">
    <p className="text-gray-500">题目生成失败，请重试</p>
    <Button onClick={handleRetry}>重新生成</Button>
  </div>
)}
```

---

## 验收标准

1. 生成失败的练习（`generate_status=-1`）可以点击"重新生成"
2. 重试后 `generate_status` 重置为 0，重新触发 AI 生成
3. 非失败状态调用重试接口返回错误
4. 最多重试 3 次（可在 Service 中加计数限制）
