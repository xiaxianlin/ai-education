---
description: "命名规范和文件组织规范，适用于所有语言和文件类型"
alwaysApply: true
---

# 命名规范和文件组织

## 文件命名规范

### Python 文件
- 使用 `snake_case` (例如: `user_service.py`, `question_router.py`)
- 路由文件: `[resource].py` (例如: `unit.py`, `question.py`)
- 服务文件: `[resource].py` (例如: `unit.py`, `question.py`)
- Schema 文件: `schema.py`

### TypeScript/React 文件
- 组件文件: 使用 `PascalCase` (例如: `UserProfile.tsx`, `WaitCard.tsx`)
- Hook 文件: 使用 `camelCase`，以 `use` 开头 (例如: `useDailyPractice.ts`)
- 工具函数: 使用 `camelCase` (例如: `formatDate.ts`)
- 常量文件: 使用 `UPPER_SNAKE_CASE` (例如: `API_CONSTANTS.ts`)
- 类型文件: 使用 `types.ts` 或 `[Name].types.ts`

### Flutter/Dart 文件
- 类文件: 使用 `snake_case.dart` (例如: `practice_session.dart`)
- Widget 文件: 使用 `snake_case.dart` (例如: `practice_card.dart`)
- Provider 文件: 使用 `snake_case_provider.dart` (例如: `practice_provider.dart`)

## 代码命名规范

### Python
- 变量和函数: `snake_case` (例如: `create_unit`, `user_id`)
- 类名: `PascalCase` (例如: `PracticeSession`, `QuestionModel`)
- 常量: `UPPER_SNAKE_CASE` (例如: `API_BASE_URL`, `MAX_RETRY_COUNT`)
- 私有变量/函数: 以单下划线开头 (例如: `_internal_method`)

### TypeScript/JavaScript
- 变量和函数: `camelCase` (例如: `handleClick`, `fetchData`)
- 组件名: `PascalCase` (例如: `UserProfile`, `WaitCard`)
- 类型/接口: `PascalCase` (例如: `PracticeCardProps`, `UserData`)
- 常量: `UPPER_SNAKE_CASE` (例如: `API_BASE_URL`, `PRACTICE_STATUS`)
- Hook: `camelCase`，以 `use` 开头 (例如: `useDailyPractice`, `usePageModel`)

### Dart
- 变量和函数: `camelCase` (例如: `handleClick`, `fetchData`)
- 类名: `PascalCase` (例如: `PracticeSession`, `PracticeCard`)
- 常量: `lowerCamelCase` (例如: `apiBaseUrl`, `maxRetryCount`)
- 私有变量/函数: 以下划线开头 (例如: `_internalMethod`)

## 目录命名规范

### 前端 (React)
- 页面目录: `pages/[Feature]/[PageName]/`
- 组件目录: `components/[ComponentName]/`
- Hook 目录: `hooks/`
- 服务目录: `services/` 或 `lib/api/`

### 后端 (Python)
- 路由目录: `routes/`
- 服务目录: `services/`
- Schema 文件: `schema.py`

### 移动端 (Flutter)
- 功能模块: `screens/[feature]/`
- 数据层: `data/` 或 `repository/`
- UI 层: `presentation/` (包含 `pages/` 和 `widgets/`)
- 状态管理: `providers/`

## 导入顺序规范

### TypeScript/React
1. React 相关
2. 第三方库（ahooks, react-router-dom 等）
3. Ant Design Pro 组件（admin-web）或业务组件（student-web）
4. UI 组件（antd 或 shadcn/ui）
5. 类型定义（./types）
6. 工具函数/常量

### Python
1. 标准库
2. 第三方库
3. 本地应用导入（使用绝对导入）

```python
# 标准库
from typing import Optional
from datetime import datetime

# 第三方库
from fastapi import APIRouter, Depends
from sqlalchemy import select

# 本地导入
from shared.core.database import Database
from admin.schema import CreateUnitSchema
from admin.services import unit
```

## 常量定义

### Python
```python
# constants.py
API_BASE_URL = "https://api.example.com"
MAX_RETRY_COUNT = 3
```

### TypeScript
```typescript
// constants.ts
export const API_BASE_URL = "https://api.example.com";
export const MAX_RETRY_COUNT = 3;
export const PRACTICE_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;
```

### Dart
```dart
// constants.dart
const String apiBaseUrl = "https://api.example.com";
const int maxRetryCount = 3;
```
