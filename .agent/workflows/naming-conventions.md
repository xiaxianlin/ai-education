---
description: 命名规范和文件组织规范，适用于所有语言和文件类型
---

# 命名规范和文件组织

## 文件命名规范

### Python 文件

- 使用 `snake_case` (例如: `user_service.py`, `question_router.py`)
- 路由文件: `route.py`（单数形式）
- 服务文件: `[resource].py`
- Schema 文件: `schema.py`

### TypeScript/React 文件

- 组件文件: `PascalCase` (例如: `UserProfile.tsx`, `WaitCard.tsx`)
- Hook 文件: `camelCase`，以 `use` 开头 (例如: `useDailyPractice.ts`)
- 工具函数: `camelCase` (例如: `formatDate.ts`)
- 常量文件: `constants.ts`
- 类型文件: `types.ts`
- API 文件: `api.ts`
- Model 文件: `PageModel.ts` 或 `page.ts`

## 代码命名规范

### Python

- 变量和函数: `snake_case`
- 类名: `PascalCase`
- 常量: `UPPER_SNAKE_CASE`
- 私有变量/函数: 以单下划线开头

### TypeScript/JavaScript

- 变量和函数: `camelCase`
- 组件名: `PascalCase`
- 类型/接口: `PascalCase`
- 常量: `UPPER_SNAKE_CASE`
- Hook: `camelCase`，以 `use` 开头

## 目录命名规范

### 前端 (React)

- 页面目录: `pages/[Feature]/[PageName]/`
  - 子目录: `models/`, `views/`, `hooks/`, `components/`
- 组件目录: `components/[ComponentName]/`
- API 目录: `lib/api.ts`（student-web）或 `pages/[Feature]/api.ts`（admin-web）

### 后端 (Python)

- 路由文件: `route.py`
- 服务目录: `services/`
- Schema 文件: `schema.py`
- 模块目录: `admin/`, `student/`, `shared/`

## 导入顺序规范

### TypeScript/React

1. React 相关
2. 第三方库（ahooks, react-router-dom 等）
3. UI 组件（antd 或 shadcn/ui）
4. 类型定义
5. 工具函数/常量

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
```
