# P1-07 Redis 队列正式对接

> **优先级**: P1 | **预估工期**: 3天 | **前置依赖**: 无
> **状态**: ✅ 已完成

---

## 现状分析

当前队列实现：
- `DispatchEnqueuer`: 入队时立即同步/goroutine 执行 handler，非真正队列
- `MemoryEnqueuer`: FIFO 内存队列，需手动 Dequeue
- `NoopEnqueuer`: 吞掉任务

**问题**: API 进程重启任务丢失，无法跨进程消费，无持久化。

**已有基础设施**:
- `apps/server-go/internal/queue/` — Enqueuer 接口 + Registry + Task 定义
- `config` 中 `REDIS_URL` 环境变量已定义
- Worker 独立进程 (`cmd/worker/main.go`) 已搭建

**关键文件**:
- `apps/server-go/internal/queue/enqueuer.go` — `Enqueuer` 接口
- `apps/server-go/internal/queue/memory.go` — 内存队列实现
- `apps/server-go/internal/queue/dispatch.go` — 即时分发
- `apps/server-go/internal/queue/registry.go` — Handler 注册中心
- `apps/server-go/cmd/worker/main.go` — Worker 入口
- `apps/server-go/cmd/api/main.go` — API 入口
- `apps/server-go/internal/config/` — 配置加载

---

## 已实现文件清单

### 1. Redis Enqueuer — `apps/server-go/internal/queue/redis.go`（86 行）

`RedisEnqueuer` 完整实现：
- `Enqueue(ctx, Task) (TaskReceipt, error)` — 验证任务名、分配 ID、序列化 JSON、LPUSH 到按任务类型分的 Redis List
- 返回 `TaskReceipt`（含 ID、Name、Queue、EnqueuedAt），与文档旧版示例返回 `(string, error)` 不同
- 支持 `task.Queue` 字段自定义队列名，默认使用 `task.Name`
- `Client()` / `Close()` 辅助方法

### 2. Redis 连接初始化 — `apps/server-go/internal/queue/redis_client.go`（31 行）

`NewRedisClient(url string) (*redis.Client, error)`：
- 解析 URL → `redis.ParseURL`
- 创建客户端后立即 `Ping` 验证连接（5 秒超时）
- 连接失败时自动 `Close` 并返回错误

### 3. Worker 消费循环 — `apps/server-go/internal/queue/worker.go`（114 行）

`Worker` 消费循环：
- `Worker` 持有 `*redis.Client` + `HandlerRegistry`（非文档旧版的 `*RedisEnqueuer`）
- 每种任务类型启动独立 goroutine，通过 `BRPOP` 阻塞消费
- 处理失败时调用 `requeue()` 将任务 LPUSH 回队列头部重试
- 支持上下文取消优雅退出

### 4. 测试 — `apps/server-go/internal/queue/redis_test.go`（260 行）

基于 `miniredis` 的完整测试：
- `TestRedisEnqueuerEnqueue` — 入队验证
- `TestRedisEnqueuerPreservesTaskID` — 自定义 ID 保持
- `TestRedisEnqueuerRejectsInvalidTaskName` — 无效任务名拒绝
- `TestWorkerConsumesTask` — Worker 消费端到端
- `TestWorkerRequeuesOnHandlerError` — 失败重入队
- `TestRedisClientParseURL` / `TestRedisClientInvalidURL` — 连接测试

### 5. Worker 入口 — `apps/server-go/cmd/worker/main.go`（108 行）

- 加载配置 → 初始化 DB → 初始化 Redis → 注册 handler → 启动 Worker
- 使用 `RegisterTypedHandler` 类型安全注册
- 注册了 `practice.generate`（AI 真实处理）、`question.generate`、`answer.evaluate`、`report.generate`（占位）
- 支持 SIGINT/SIGTERM 优雅退出

### 6. API 入口 — `apps/server-go/cmd/api/main.go`（143 行）

- 当 `cfg.Redis.URL` 非空时创建 `RedisEnqueuer`
- Redis 连接失败时降级为 `DispatchEnqueuer`（进程内执行）
- `cfg.Redis.URL` 为空时直接使用 `DispatchEnqueuer`

---

## 实现细节差异（文档旧版 vs 实际代码）

| 项目 | 文档旧版 | 实际代码 |
|------|---------|---------|
| `Enqueue` 返回值 | `(string, error)` | `(TaskReceipt, error)` |
| `Worker` 持有的字段 | `enqueuer *RedisEnqueuer` | `client *redis.Client` + `registry HandlerRegistry` |
| `NewWorker` 参数 | `(enqueuer, registry, taskNames)` | `(client, registry, taskNames)` |
| `NewRedisClient` | 仅解析 URL 返回 client | 解析 URL + Ping 验证连接 |
| `Fail()` 方法 | 存在于 RedisEnqueuer | 不存在，由 Worker.requeue() 直接实现 |
| 任务类型 | `[]string` | `[]TaskName` |
| handler 注册 | 直接 `registry.Register` | 使用 `RegisterTypedHandler` 泛型封装 |

---

## 已知问题：Worker 无限重试

### 问题分析

当前 `Worker.requeue()` 实现将失败任务无条件 LPUSH 回队列头部，没有重试计数和退避机制：

```go
// worker.go 第 95-106 行
func (w *Worker) requeue(ctx context.Context, key string, task Task) {
    body, err := json.Marshal(task)
    // ...
    w.client.LPush(ctx, key, body)  // 无条件重新入队
}
```

**风险**：
- 如果 handler 因持久性错误（如数据损坏）反复失败，任务将无限循环
- 高频失败任务会挤占队列资源，阻塞正常任务处理
- 无告警机制，死循环任务难以发现

### 改进建议（后续 P1-08 实现）

1. **Task 增加 RetryCount 字段**

   ```go
   // 在 Task 结构体中增加
   type Task struct {
       // ... 现有字段
       RetryCount int `json:"retry_count,omitempty"`
   }
   ```

2. **超过 maxRetries 后推入死信队列**

   ```go
   const maxRetries = 3

   func (w *Worker) requeue(ctx context.Context, key string, task Task) {
       task.RetryCount++
       if task.RetryCount > maxRetries {
           // 推入死信队列: ai-edu:queue:dead-letter
           dlKey := redisKeyPrefix + "dead-letter"
           body, _ := json.Marshal(task)
           w.client.LPush(ctx, dlKey, body)
           log.Printf("[worker] task %s/%s exceeded maxRetries (%d), moved to dead-letter queue",
               task.Name, task.ID, maxRetries)
           return
       }
       // 正常重入队
       body, _ := json.Marshal(task)
       w.client.LPush(ctx, key, body)
   }
   ```

3. **加入指数退避**

   ```go
   import "math"

   // 在 consume 循环中，handler 失败后增加退避等待
   backoff := time.Duration(math.Pow(2, float64(task.RetryCount))) * time.Second
   if backoff > 30*time.Second {
       backoff = 30 * time.Second  // 上限 30 秒
   }
   log.Printf("[worker] backing off %v before retry for task %s", backoff, task.ID)
   time.Sleep(backoff)
   ```

4. **死信队列监控**

   - 定期检查死信队列长度，超过阈值时告警
   - 提供管理接口查看/重试死信任务

---

## 验收标准

1. ✅ 设置 `REDIS_URL` 后，任务入 Redis List，Worker 进程消费执行
2. ✅ 不设 `REDIS_URL` 时，自动降级为 `DispatchEnqueuer`（进程内）
3. ✅ API 进程重启后，Redis 中的未消费任务不丢失
4. ⚠️ Worker 进程崩溃后，processing 中的任务超时后可被重新消费（当前为简单 LPUSH 重入队，需 P1-08 补充可见性超时机制）
5. ✅ `practice.generate` 和 `report.generate` 都通过 Redis 队列正常工作
