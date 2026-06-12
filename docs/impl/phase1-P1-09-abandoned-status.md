# P1-09 练习废弃 (ABANDONED) 状态处理

> **优先级**: P2 | **预估工期**: 1天 | **前置依赖**: 无
> **状态**: 📋 待开发

---

## 现状分析

`Practice` 的 `status` 定义了 `3 = Abandoned`，但：
- 没有 API 接口触发废弃
- 前端没有废弃操作入口
- 学生切换练习或长时间未操作时，旧练习没有自动废弃逻辑

---

## 实现方案

### Step 1: 后端新增废弃接口

**文件**: `server-go/internal/practice/handler.go`

```go
// Abandon 废弃练习
func (h *Handler) Abandon(w http.ResponseWriter, r *http.Request) {
    sessionID := r.PathValue("session_id")
    if err := h.service.Abandon(r.Context(), sessionID); err != nil {
        response.Error(w, err)
        return
    }
    response.Success(w, nil)
}
```

### Step 2: Service 层废弃逻辑

**文件**: `server-go/internal/practice/service.go`

```go
func (s *Service) Abandon(ctx context.Context, practiceID string) error {
    session, err := s.repo.GetPracticeByID(ctx, practiceID)
    if err != nil {
        return err
    }

    // 仅未完成/未废弃的可废弃
    if session.Status == 2 || session.Status == 3 {
        return ErrCannotAbandon
    }

    // 处理竞态：如果 AI 正在生成中（generate_status == 0），需要标记取消
    // 让 Worker 完成后检测到废弃状态，忽略该任务的结果
    if session.GenerateStatus == 0 {
        // 先标记 generate_status 为取消（-3），Worker 完成时检查并跳过
        if err := s.repo.UpdateGenerateStatus(ctx, practiceID, -3); err != nil {
            return err
        }
    }

    return s.repo.UpdateStatus(ctx, practiceID, 3) // Abandoned
}
```

### Step 2.1: Worker 完成时检查废弃状态

**文件**: `server-go/internal/practice/worker.go`

在 Worker 的 `handlePracticeGenerate` 中，AI 生成完成后检查练习是否已被废弃：

```go
func handlePracticeGenerate(ctx context.Context, svc *Service, payload queue.PracticeGeneratePayload) error {
    // ... 调用 AI 生成题目 ...

    // 生成完成后，检查练习是否已被废弃
    practice, _ := svc.repo.GetPracticeByID(ctx, payload.PracticeID)
    if practice.Status == 3 { // 已废弃
        // 忽略本次生成结果，不更新题目数据
        log.Printf("INFO: 练习 %s 已被废弃，跳过生成结果写入", payload.PracticeID)
        return nil
    }

    // ... 正常写入生成结果 ...
}
```

### Step 3: 新增路由

**文件**: `server-go/internal/practice/routes.go`

```go
mux.HandleFunc("POST /api/student/practice/{session_id}/abandon", handler.Abandon)
```

### Step 4: 前端添加废弃入口

**场景 1**: 学生创建新练习时，自动废弃当前未完成的练习

**文件**: `apps/student-web/src/pages/PracticeAbility/models/page.ts`

```typescript
// 创建新练习前，检查并废弃旧练习
const createPractice = async () => {
  const existing = await apiClient.get('/api/student/practice/');
  if (existing && existing.status === 0) {
    await apiClient.post(`/api/student/practice/${existing.id}/abandon`);
  }
  await apiClient.post('/api/student/practice/create', { ... });
};
```

**场景 2**: 练习记录中标记已废弃

**文件**: `apps/student-web/src/pages/PracticeRecord/components/HistoryCard.tsx`

```tsx
{record.status === 3 && (
  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">已废弃</span>
)}
```

---

## 验收标准

1. 学生可手动废弃未完成的练习
2. 创建新练习时自动废弃同类型旧练习
3. 已完成/已废弃的练习不可再次废弃
4. 废弃的练习在历史记录中标记为"已废弃"
5. AI 正在生成中的练习被废弃后，Worker 完成时检测到废弃状态并跳过结果写入（无竞态问题）
