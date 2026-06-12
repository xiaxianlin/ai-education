# P1-27 ~ P1-29 质量保障

> P1-27 后端集成测试覆盖 | P1-28 API 契约测试 | P1-29 错误处理规范化
> **优先级**: P1-P2 | **预估工期**: 持续 + 5天

---

## P1-27 后端集成测试覆盖 (持续)

### 现有测试

`server-go/tests/` 下已有：
- `tests/ability/` — 能力模块测试
- `tests/practice/` — 练习模块测试
- `tests/mastery/` — 掌握度模块测试

### 需新增的测试

**文件**: `server-go/tests/practice/complete_test.go`（新建）

```go
func TestCompletePractice(t *testing.T) {
    // Given: 一个已开始、所有题已答的练习
    session := createTestSession(t, studentID, "ability", 5)
    beginSession(t, session.ID)
    for _, answer := range session.Answers {
        submitAnswer(t, session.ID, answer.QuestionID, "A")
    }

    // When: 完成练习
    err := service.Complete(context.Background(), session.ID)

    // Then: 状态更新为已完成
    assert.NoError(t, err)
    updated, _ := repo.GetPracticeByID(context.Background(), session.ID)
    assert.Equal(t, 2, updated.Status) // Completed
    
    // Then: 报告已创建
    report, _ := repo.GetReport(context.Background(), session.ID)
    assert.NotNil(t, report)
    assert.Greater(t, report.OverallScore, float64(0))
}
```

**文件**: `server-go/tests/mastery/update_test.go`（新建）

```go
func TestMasteryUpdateAfterPractice(t *testing.T) {
    // When: 练习完成后更新掌握度
    inputs := []mastery.AnswerMasteryInput{
        {AbilityCode: "chinese_1_understanding", IsCorrect: true},
        {AbilityCode: "chinese_1_understanding", IsCorrect: false},
        {AbilityCode: "chinese_1_understanding", IsCorrect: true},
    }
    err := masteryService.UpdateAfterPractice(context.Background(), studentID, inputs)

    // Then: 掌握度正确计算
    assert.NoError(t, err)
    m, _ := masteryRepo.GetMastery(context.Background(), studentID, "chinese_1_understanding")
    assert.InDelta(t, 66.67, m.CorrectRate, 0.1)
    assert.Equal(t, 3, mastery.Level) // 基本掌握 (60-80%)
}
```

**文件**: `server-go/tests/practice/report_test.go`（新建）

```go
func TestReportGenerate(t *testing.T) {
    // 测试 AI 报告生成的 handler 注册和执行
}
```

### 运行命令

```bash
cd apps/server-go
go test ./tests/... -v
go test ./tests/practice -run TestCompletePractice -v
```

---

## P1-28 API 契约测试 (2天)

### 方案

利用 `openapi-typescript` 生成前端类型，确保前后端接口一致。

**文件**: `scripts/generate-types.ts`

```typescript
import openapi from 'openapi-typescript';

// 从 Go 后端的 Swagger/OpenAPI spec 生成 TypeScript 类型
const types = await openapi('http://localhost:7891/swagger.json');
fs.writeFileSync('packages/shared-web/src/types/api.ts', types);
```

**执行**:

```bash
# 后端添加 Swagger 注解后
pnpm generate:types
```

**验证**: CI 中加入类型检查步骤：

```yaml
- name: Type check
  run: pnpm tsc --noEmit
```

---

## P1-29 错误处理规范化 (1天)

### 后端统一错误码

**文件**: `server-go/internal/response/response.go`

```go
// 统一错误码定义
const (
    StatusSuccess       = 0
    StatusBadRequest    = 40000
    StatusUnauthorized  = 40100
    StatusForbidden     = 40300
    StatusNotFound      = 40400
    StatusConflict      = 40900
    StatusInternalError = 50000
)

// 业务错误码 (50xxx)
const (
    ErrPracticeNotFound     = 50001
    ErrPracticeNotReady     = 50002
    ErrPracticeCompleted    = 50003
    ErrInvalidAnswer        = 50004
    ErrAIGenerationFailed   = 50005
    ErrMasteryUpdateFailed  = 50006
)
```

### 前端统一错误提示

**文件**: `packages/shared-web/src/api/client.ts`

在 ApiClient 的拦截器中统一处理：

```typescript
// 响应拦截器
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response?.status === 401) {
      // Token 过期，跳转登录
      localStorage.removeItem('_token_');
      window.location.href = '/login';
    } else if (response?.data?.message) {
      // 显示后端错误消息
      message.error(response.data.message);
    } else {
      message.error('网络错误，请稍后重试');
    }
    return Promise.reject(error);
  }
);
```

---

## 验收标准

1. 核心业务流程（创建练习、答题、完成、报告生成）有集成测试覆盖
2. 掌握度更新逻辑有单元测试
3. 前后端 API 类型一致（通过 TypeScript 类型检查）
4. 所有 API 错误返回统一格式的错误码和消息
5. 前端统一展示错误提示，Token 过期自动跳转登录
