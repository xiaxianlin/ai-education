# 小学生 AI 练习系统 — 开发规范文档

> **版本**: v2.0 | **更新日期**: 2026-06-12 | **维护者**: 架构组

---

## 一、通用规范

### 1.1 版本控制

```bash
# 分支命名
feat/xxx      # 新功能
fix/xxx       # 修复
refactor/xxx  # 重构
docs/xxx      # 文档

# 提交信息 (Conventional Commits, 中文描述)
feat: 添加学生移动端练习页面
fix: 修复练习生成失败时状态未更新问题
refactor: 重构掌握度计算逻辑
docs: 更新 API 接口文档
```

### 1.2 代码审查要点

- **类型安全**: 所有代码使用类型系统，禁止 `any` / `interface{}`
- **错误处理**: 所有 API 调用和异步操作必须处理错误
- **空值安全**: 嵌套属性访问使用可选链 `obj?.prop?.subProp`
- **单一职责**: 每个函数/方法只做一件事
- **命名清晰**: 变量名体现业务含义，避免缩写

---

## 二、Go 后端规范

### 2.1 分层架构

严格遵循 **Handler → Service → Repository** 三层架构：

```
Handler 层 (HTTP 处理)
  ├── 解析请求参数
  ├── 调用 Service
  ├── 返回统一响应
  └── 不包含业务逻辑

Service 层 (业务逻辑)
  ├── 编排业务流程
  ├── 跨模块协调
  ├── 数据校验
  └── 事务管理

Repository 层 (数据访问)
  ├── SQL 封装
  ├── 数据库 CRUD
  └── 不包含业务判断
```

#### Handler 规范

```go
// ✅ 正确: Handler 只做参数解析和响应
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
    var req CreateRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        response.BadRequest(w, "无效的请求参数")
        return
    }
    
    practice, err := h.service.Create(r.Context(), req)
    if err != nil {
        response.InternalError(w, err.Error())
        return
    }
    
    response.Success(w, practice)
}

// ❌ 错误: Handler 中包含业务逻辑
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
    // 不要在这里做业务判断、数据库查询
    var req CreateRequest
    json.NewDecoder(r.Body).Decode(&req)
    // 直接 SQL 查询...
    // 业务判断...
}
```

#### Service 规范

```go
// ✅ 正确: Service 返回业务错误
func (s *Service) Create(ctx context.Context, req CreateRequest) (*Practice, error) {
    // 业务校验
    if req.QuestionCount <= 0 {
        return nil, ErrInvalidQuestionCount
    }
    
    // 创建练习
    practice := &Practice{
        ID:            uuid.New().String(),
        StudentID:     req.StudentID,
        Type:          req.Type,
        GenerateStatus: 0, // 生成中
        Status:        0,  // 未开始
    }
    
    if err := s.repo.Create(ctx, practice); err != nil {
        return nil, fmt.Errorf("创建练习失败: %w", err)
    }
    
    // 异步生成题目
    s.queue.Enqueue(ctx, "practice.generate", payload)
    
    return practice, nil
}
```

### 2.2 路由注册

```go
// 路由注册集中管理
func RegisterRoutes(mux *http.ServeMux, svc *Service) {
    // RESTful 风格，路径参数使用 Go 1.22 语法
    mux.HandleFunc("GET /api/student/practice/", handler.GetPractice)
    mux.HandleFunc("POST /api/student/practice/create", handler.Create)
    mux.HandleFunc("GET /api/student/practice/{session_id}", handler.GetDetail)
    mux.HandleFunc("POST /api/student/practice/{session_id}/begin", handler.Begin)
    mux.HandleFunc("POST /api/student/practice/{session_id}/complete", handler.Complete)
}
```

### 2.3 命名规范

```go
// 包名: 小写单词，不使用下划线
package practice

// 导出标识符: PascalCase
type PracticeService struct { ... }
func (s *PracticeService) CreatePractice() { ... }

// 包内标识符: camelCase
func generateQuestionContent() { ... }

// 常量
const (
    GenerateStatusPending  = 0
    GenerateStatusComplete = 1
    GenerateStatusFailed   = -1
)

// 错误定义
var (
    ErrPracticeNotFound = errors.New("练习不存在")
    ErrInvalidStatus    = errors.New("无效的练习状态")
)
```

### 2.4 导入顺序

```go
import (
    // 1. 标准库
    "context"
    "encoding/json"
    "net/http"

    // 2. 第三方库
    "github.com/google/uuid"

    // 3. 本地模块
    "ai-education/internal/response"
    "ai-education/internal/practice"
)
```

### 2.5 数据库操作

```go
// Repository 层封装 SQL
type Repository struct {
    db *sql.DB
}

// 使用 database/sql，不使用 ORM
func (r *Repository) FindByID(ctx context.Context, id string) (*Practice, error) {
    var p Practice
    query := `SELECT id, student_id, type, status, generate_status, question_count, config, created_at, completed_at
              FROM ah_practice WHERE id = ?`
    err := r.db.QueryRowContext(ctx, query, id).Scan(
        &p.ID, &p.StudentID, &p.Type, &p.Status, &p.GenerateStatus,
        &p.QuestionCount, &p.Config, &p.CreatedAt, &p.CompletedAt,
    )
    if err == sql.ErrNoRows {
        return nil, ErrPracticeNotFound
    }
    return &p, err
}
```

### 2.6 错误处理

```go
// Service 层返回业务错误
func (s *Service) Evaluate(ctx context.Context, answer *Answer) error {
    if answer == nil {
        return ErrInvalidAnswer
    }
    return s.repo.SaveAnswer(ctx, answer)
}

// Handler 层统一转换为 HTTP 响应
func (h *Handler) SubmitAnswer(w http.ResponseWriter, r *http.Request) {
    err := h.service.Evaluate(r.Context(), answer)
    if err != nil {
        switch {
        case errors.Is(err, ErrInvalidAnswer):
            response.BadRequest(w, err.Error())
        case errors.Is(err, ErrPracticeNotFound):
            response.NotFound(w, err.Error())
        default:
            response.InternalError(w, "内部错误")
        }
        return
    }
    response.Success(w, nil)
}
```

### 2.7 测试规范

```go
// 测试文件放在 tests/ 目录，按模块组织
// tests/practice/create_test.go
// tests/practice/answer_test.go

func TestCreatePractice(t *testing.T) {
    // Given
    req := CreateRequest{
        StudentID:    1,
        Type:         "ability",
        AbilityCode:  "chinese_1_understanding",
        QuestionCount: 10,
    }
    
    // When
    practice, err := service.Create(context.Background(), req)
    
    // Then
    assert.NoError(t, err)
    assert.Equal(t, 0, practice.GenerateStatus)
    assert.Equal(t, 0, practice.Status)
}

// 运行测试
// cd apps/server-go && go test ./tests/practice -run TestCreatePractice
```

---

## 三、前端规范 (React + TypeScript)

### 3.1 页面结构规范

每个页面遵循统一的文件组织：

```
pages/[Feature]/[PageName]/
├── index.tsx              # 页面入口 (路由配置 + 组件组合)
├── models/PageModel.ts    # 状态管理 (unstated-next)
├── views/Main.tsx         # 主视图组件
├── hooks/usePageHook.ts   # 页面逻辑 Hook
└── components/            # 页面私有组件
    ├── Header.tsx
    └── List.tsx
```

#### index.tsx — 页面入口

```tsx
// ✅ 入口文件只做组装
import { PracticeList } from './views/Main';
import { PracticeProvider } from './models/PracticeModel';

export default function PracticePage() {
  return (
    <PracticeProvider>
      <PracticeList />
    </PracticeProvider>
  );
}
```

#### models/PageModel.ts — 状态管理

```tsx
import { createContainer } from 'unstated-next';
import { useRequest } from 'ahooks';

function usePracticeModel() {
  const { data, loading, run: fetchPractices } = useRequest(
    () => apiClient.get('/api/admin/practice/search'),
    { manual: true }
  );

  return {
    practices: data?.items ?? [],
    loading,
    fetchPractices,
  };
}

export const PracticeProvider = createContainer(usePracticeModel);
export const usePractice = () => PracticeProvider.useContainer();
```

### 3.2 组件规范

```tsx
// ✅ 正确: 函数式组件 + Hooks，UI 和逻辑分离
interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [selected, setSelected] = useState<string>();
  
  return (
    <div className="rounded-lg border p-4">
      <p className="text-lg font-medium">{question.content.stem}</p>
      <div className="mt-4 space-y-2">
        {question.content.options?.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onAnswer(opt.key)}
            className={getOptionStyle(opt.key === selected)}
          >
            {opt.key}. {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 3.3 状态管理

- **全局/页面级状态**: `unstated-next` (Context + Container 模式)
- **异步操作**: `ahooks` 的 `useRequest`
- **组件内状态**: `useState` / `useReducer`
- **URL 状态**: `useSearchParams` 或路由参数

### 3.4 API 调用规范

```tsx
// 使用 shared-web 的 ApiClient
import { apiClient } from '@ai-education/shared-web/api';

// ✅ GET 请求: 参数直接传对象
const data = await apiClient.get('/api/student/practice/records', { 
  page: 1, 
  size: 20 
});

// ❌ 错误: 不要嵌套在 params 中
const data = await apiClient.get('/api/student/practice/records', { 
  params: { page: 1, size: 20 }  // 错误!
});

// ✅ POST 请求
const result = await apiClient.post('/api/student/practice/create', {
  type: 'ability',
  ability_code: 'chinese_1_understanding',
  question_count: 10,
});
```

### 3.5 命名规范

```tsx
// 变量/函数: camelCase
const practiceList = [];
const handleSubmit = () => {};

// 组件/类型: PascalCase
function PracticeCard() {}
interface PracticeSession {}

// 常量: UPPER_SNAKE_CASE
const MAX_QUESTION_COUNT = 20;
const API_BASE_URL = '/api';

// Hook: use 前缀
function usePracticeProgress() {}

// 事件处理: on + 动词
const onClick = () => {};
const onSubmit = () => {};

// 导入顺序
import React, { useState } from 'react';           // React
import { useRequest } from 'ahooks';                // 第三方库
import { PracticeCard } from './components/Card';   // 业务组件
import { Button } from './ui/Button';               // UI 组件
import type { Practice } from '@/types';             // 类型
import { formatDate } from '@/utils';                // 工具
```

### 3.6 Tailwind CSS 规范

```tsx
// ✅ 使用状态映射函数
function getOptionStyle(isSelected: boolean): string {
  const styles: Record<string, string> = {
    selected: 'bg-blue-500 text-white border-blue-500',
    default: 'bg-white text-gray-700 border-gray-300 hover:border-blue-300',
  };
  return styles[isSelected ? 'selected' : 'default'];
}

// ❌ 禁止 cn() 封装
// ❌ 禁止三元运算符链式判断
<div className={cn(isActive && "bg-blue-500", isError && "bg-red-500")} />  // 禁止!
<div className={`p-4 ${isActive ? 'bg-blue-500' : isError ? 'bg-red-500' : 'bg-gray-100'}`} />  // 禁止!
```

---

## 四、API 设计规范

### 4.1 URL 设计

```
# 路径命名
/api/{角色}/{资源}/{操作}

# 示例
GET    /api/admin/practice/search          # 搜索列表
GET    /api/admin/practice/{id}            # 获取详情
POST   /api/admin/practice                 # 创建
PATCH  /api/admin/practice/{id}            # 更新
DELETE /api/admin/practice/{id}            # 删除
POST   /api/admin/practice/{id}/reset      # 重置 (子操作)

# 学生端
GET    /api/student/practice/records       # 练习记录
POST   /api/student/practice/create        # 创建练习
POST   /api/student/practice/{id}/begin    # 开始练习
POST   /api/student/practice/{id}/complete # 完成练习
```

### 4.2 请求参数

```
GET 请求: 查询参数 (?page=1&size=20&subject=chinese)
POST/PUT/PATCH 请求: JSON Body
DELETE 请求: 路径参数

路径参数使用 snake_case: /practice/{session_id}
```

### 4.3 响应格式

```json
// 成功
{
  "status": 0,
  "message": "ok",
  "data": { ... }
}

// 列表 (带分页)
{
  "status": 0,
  "message": "ok",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "size": 20
  }
}

// 失败
{
  "status": 40001,
  "message": "练习不存在",
  "data": null
}
```

### 4.4 状态码约定

| HTTP 状态码 | 场景 |
|-------------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 / Token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务内部错误 |

---

## 五、数据库规范

### 5.1 表命名

- 前缀 `ah_` (项目缩写)
- 小写 + 下划线: `ah_student`, `ah_practice`
- 关联表: `ah_student_ability_mastery`

### 5.2 字段命名

- 小写 + 下划线: `student_id`, `created_at`
- 布尔字段: `is_` 前缀 (如 `is_completed`)
- 时间字段: `_at` 后缀 (如 `created_at`, `updated_at`)
- JSON 字段: 存储复杂结构 (如 `content`, `config`, `answer`)

### 5.3 主键策略

| 表类型 | 主键策略 | 示例 |
|--------|----------|------|
| 基础实体 (学生、能力等) | BIGINT 自增 | `id BIGINT AUTO_INCREMENT` |
| 业务实体 (练习、题目) | VARCHAR(36) UUID | `id VARCHAR(36)` |

### 5.4 索引规范

```sql
-- 必须有索引的字段
-- 1. 外键字段
CREATE INDEX idx_practice_student_id ON ah_practice(student_id);

-- 2. 高频查询条件
CREATE INDEX idx_ability_subject_grade ON ah_ability(subject, grade);

-- 3. 唯一约束
CREATE UNIQUE INDEX uk_ability_code ON ah_ability(subject, grade, code);
```

### 5.5 JSON 字段使用

```sql
-- 用于存储动态结构
content JSON       -- 题目内容 (不同题型结构不同)
answer JSON        -- 答案 (选择题=索引, 排序题=数组, 匹配题=对象)
config JSON        -- 配置 (题型配置、练习配置)
```

### 5.6 数据库迁移

```bash
# 迁移文件放在 apps/server-go/migrations/
# 命名: 001_create_practice_table.sql

# 迁移必须是幂等的 (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS ah_xxx ( ... );
```

---

## 六、AI 集成规范

### 6.1 架构原则

```
AI 适配层 (internal/ai/)
  ├── 对外提供业务接口 (GenerateQuestions, EvaluateAnswer, GenerateReport)
  ├── 对内适配 AI Provider (当前: Google ADK/Gemini)
  └── Provider 可替换 (通过 Adapter 接口)
```

### 6.2 AI 接口定义

```go
// 题目生成器
type QuestionGenerator interface {
    GenerateQuestions(ctx context.Context, req QuestionGenRequest) ([]GeneratedQuestion, error)
}

// 答案评判器
type AnswerEvaluator interface {
    EvaluateAnswer(ctx context.Context, req EvalRequest) (*EvalResult, error)
}

// 报告生成器
type ReportGenerator interface {
    GenerateReport(ctx context.Context, req ReportRequest) (*Report, error)
}
```

### 6.3 Prompt 管理

```
题型配置 (ah_question_type.prompt) 存储在数据库
  ├── 支持在线编辑
  ├── 模板变量渲染
  └── 版本管理 (未来)
```

### 6.4 生成结果校验

```go
// AI 生成结果必须经过校验
func ValidateGeneratedQuestions(questions []GeneratedQuestion) error {
    for _, q := range questions {
        // 1. 检查必要字段
        if q.Type == "" || q.Content == nil { return ErrInvalidQuestion }
        
        // 2. 按题型校验
        switch q.Type {
        case "choice":
            if len(q.Content.Options) < 2 { return ErrInvalidOptions }
        case "judge":
            if q.Answer == nil { return ErrInvalidAnswer }
        case "sorting":
            if len(q.Answer.Array()) < 2 { return ErrInvalidAnswer }
        case "matching":
            if len(q.Answer.Map()) < 2 { return ErrInvalidAnswer }
        case "input":
            if q.Answer.String() == "" { return ErrInvalidAnswer }
        }
    }
    return nil
}
```

### 6.5 容错与重试

```go
// AI 调用必须设置超时
ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
defer cancel()

// 生成失败时更新状态
if err != nil {
    practice.GenerateStatus = -1  // 标记失败
    s.repo.Update(ctx, practice)
    return err
}
```

---

## 七、任务队列规范

### 7.1 任务定义

| 任务名 | 触发时机 | 说明 |
|--------|----------|------|
| `practice.generate` | 创建练习后 | AI 生成题目 |
| `answer.evaluate` | 提交答案后 | 评判答案 |
| `report.generate` | 完成练习后 | 生成评估报告 |
| `question.generate` | 管理端手动 | 单次题目生成 |

### 7.2 任务处理流程

```
业务层产生任务 → Enqueuer.Enqueue()
  ├── API 进程 (DispatchEnqueuer): 同步调度，开发模式
  └── Worker 进程 (QueueEnqueuer): 异步队列，生产模式
       ├── 消费任务
       ├── 调用对应 Handler
       └── 处理结果 (成功/失败/重试)
```

---

## 八、前端 UI 规范

### 8.1 管理端 (Ant Design)

```tsx
// 使用 Ant Design 5 组件
import { Table, Button, Modal, Form, Input, Select } from 'antd';

// 页面布局
<Layout>
  <Sider>侧边菜单</Sider>
  <Content>
    <Header>页面标题 + 操作按钮</Header>
    <Table>数据表格</Table>
  </Content>
</Layout>
```

### 8.2 学生端 (shadcn/ui)

```tsx
// 使用 shadcn/ui 组件 (基于 Radix UI)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 练习页面状态管理 (PracticeSessionModel)
type SessionState = 
  | 'LOADING'     // 加载中
  | 'READY'       // 准备开始
  | 'PROCESSING'  // 答题中
  | 'SETTLEMENT'  // 结算中
  | 'RESULT'      // 查看结果
  | 'EMPTY';      // 无数据

// 状态检查顺序: 先 generate_status 再 status
if (session.generate_status !== 1) { /* 生成中 */ }
if (session.status === 0) { /* 未开始 */ }
```

### 8.3 移动端 (Tamagui)

```tsx
// 使用 Tamagui 组件
import { YStack, XStack, Text, Button } from 'tamagui';

// 使用 Zustand 管理全局状态
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// 使用 @tanstack/react-query 管理异步
const { data } = useQuery({
  queryKey: ['practices'],
  queryFn: () => apiClient.get('/api/student/practice/records'),
});
```

---

## 九、安全规范

### 9.1 认证与授权

```
管理端 Token → x-access-token 头 → AuthMiddleware → admin 上下文
学生端 Token → x-access-token 头 → AuthMiddleware → student 上下文
```

### 9.2 数据安全

- 密码存储: bcrypt 哈希
- Token: JWT + 签名
- SQL: 参数化查询，防止注入
- CORS: 白名单配置

---

## 十、开发环境

### 10.1 本地开发

```bash
# 安装依赖
pnpm install

# 启动后端
pnpm dev:server         # Go 后端 :7891

# 启动前端 (按需)
pnpm dev:admin          # 管理端
pnpm dev:student        # 学生 PC 端
pnpm dev:mobile         # 学生移动端

# 同时启动
pnpm dev:all
```

### 10.2 环境变量

```env
# .env 文件 (不提交到 Git)
SERVER_ADDR=:7891
APP_SECRET_KEY=xxx
DATABASE_URL=user:pass@tcp(localhost:3306)/ai_education
REDIS_URL=redis://localhost:6379
LLM_API_KEY=xxx
LLM_BASE=https://...
LLM_MODEL=gemini-2.0-flash
```

### 10.3 构建与部署

```bash
# 构建
pnpm build:all

# 单独构建
pnpm build:admin       # → apps/admin-web/dist/
pnpm build:student     # → apps/student-web/dist/
pnpm build:server      # → apps/server-go/cmd/api + cmd/worker
```
