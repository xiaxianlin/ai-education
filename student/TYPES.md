# 前端类型定义说明

本文档说明学生端前端类型定义的结构和使用方式，所有类型定义基于后端 `server/core/schema.py` 和 `server/student/schema.py`。

## 类型定义文件结构

```
student/src/lib/types/
├── schema.ts      # 统一的基础数据类型定义（核心文件）
└── api.ts         # API 响应和请求类型（导出 schema.ts 的类型）
```

## 核心类型定义

### 基础类型

- **Student**: 学生信息（对应 `StudentSchema`）
- **Textbook**: 教材信息（对应 `TextbookSchema`）
- **Unit**: 单元信息（对应 `UnitSchema`）
- **Knowledge**: 知识点信息（对应 `KnowledgeSchema`）
- **Question**: 题目信息（对应 `QuestionSchema`）

### 练习相关类型

#### PracticeSession
练习会话，对应后端的 `PracticeSessionSchema`。

**注意**：后端不同接口可能返回不同格式：
- `PracticeSessionSchema`: 使用 `id`, `question_count`, `answer_count`, `correct_count`
- `PracticeStatsSchem`: 使用 `session_id`, `total_questions`, `completed_questions`, `right_questions`

本类型兼容两种格式，前端使用时优先使用标准字段（`id`, `question_count` 等）。

#### PracticeStats
练习统计，对应后端的 `PracticeStatsSchem`。用于返回练习的基本统计信息。

#### PracticeHistory
练习历史记录，对应后端的 `PracticeHistorySchema`。

#### PracticeAnswer
答题记录，对应后端的 `PracticeAnswerSchema`。

#### PracticeWrongRecord
错题记录，对应后端的 `StudentWrongRecordSchema`。

#### PracticeReport
练习报告，对应后端的 `PracticeReportSchema`。

## API 请求/响应类型

### 认证相关
- **LoginParams**: 登录请求参数
- **LoginResponse**: 登录响应
- **CheckAuthResponse**: 检查登录状态响应

### 练习相关
- **SubmitAnswerParams**: 提交答案请求参数
- **SubmitAnswerResponse**: 提交答案响应
- **BeginPracticeResponse**: 开始练习响应
- **CompletePracticeResponse**: 完成练习响应
- **UnitPracticeStatus**: 单元练习状态映射（字典类型）

## 工具函数

在 `schema.ts` 中提供了以下工具函数：

### practiceStatsToSession
将 `PracticeStats` 转换为 `PracticeSession`，用于统一处理不同格式的返回数据。

```typescript
import { practiceStatsToSession } from '@/lib/types/schema';

const stats: PracticeStats = {
  session_id: 123,
  status: 1,
  total_questions: 10,
  completed_questions: 5,
  right_questions: 4,
  times: 1,
};

const session = practiceStatsToSession(stats, 'daily_practice', 20241123);
```

### 获取标准字段值
提供以下函数来获取 `PracticeSession` 的标准字段值（兼容两种格式）：

- `getSessionId(session: PracticeSession): number`
- `getQuestionCount(session: PracticeSession): number`
- `getAnswerCount(session: PracticeSession): number`
- `getCorrectCount(session: PracticeSession): number`

```typescript
import { getSessionId, getQuestionCount } from '@/lib/types/schema';

const sessionId = getSessionId(session);
const questionCount = getQuestionCount(session);
```

## 使用示例

### 导入类型

```typescript
import type {
  Student,
  Textbook,
  PracticeSession,
  PracticeStats,
  SubmitAnswerParams,
  SubmitAnswerResponse,
} from '@/lib/types/schema';
```

### 使用 API 类型

```typescript
import { api } from '@/lib/api';
import type { PracticeSession, SubmitAnswerParams } from '@/lib/types/schema';

// 获取每日练习
const session = await api.get<PracticeSession>('/practice/daily');

// 提交答案
const params: SubmitAnswerParams = {
  session_id: 123,
  question_id: 456,
  answer: 'A',
  time_spent: 5,
};
const result = await api.post<SubmitAnswerResponse>('/practice/answer', params);
```

## 类型兼容性说明

### PracticeSession 字段映射

| PracticeSessionSchema | PracticeStatsSchem | 说明 |
|----------------------|-------------------|------|
| `id` | `session_id` | 会话ID |
| `question_count` | `total_questions` | 题目总数 |
| `answer_count` | `completed_questions` | 已答题数 |
| `correct_count` | `right_questions` | 正确数 |

前端代码应优先使用标准字段（`id`, `question_count` 等），如果不存在则使用兼容字段。

### 状态值说明

- **PracticeSessionStatus**: `0` - 未开始, `1` - 进行中, `2` - 已完成
- **PracticeSessionType**: `'daily_practice'` | `'unit_practice'` | `'assessment'`
- **is_correct** (PracticeAnswer): `0` - 未答, `1` - 正确, `2` - 错误

## 迁移指南

### 从旧类型迁移

1. **StudentInfo** → **Student**
   ```typescript
   // 旧代码
   import { StudentInfo } from '@/lib/types/api';
   
   // 新代码
   import type { Student } from '@/lib/types/schema';
   ```

2. **AnswerSubmission** → **SubmitAnswerParams**
   ```typescript
   // 旧代码
   import { AnswerSubmission } from '@/lib/types/api';
   
   // 新代码
   import type { SubmitAnswerParams } from '@/lib/types/schema';
   ```

3. **AnswerResult** → **SubmitAnswerResponse**
   ```typescript
   // 旧代码
   import { AnswerResult } from '@/lib/types/api';
   
   // 新代码
   import type { SubmitAnswerResponse } from '@/lib/types/schema';
   ```

## 注意事项

1. 所有时间字段使用 Unix 时间戳（秒级）
2. 音频数据使用 base64 编码字符串
3. 某些字段可能为可选，使用时需要检查
4. 后端可能返回不同格式的数据，使用工具函数进行转换

## 相关文件

- `server/core/schema.py`: 后端核心类型定义
- `server/student/schema.py`: 学生端后端类型定义
- `server/API.md`: API 接口文档

