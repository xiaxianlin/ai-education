---
description: "React 前端编码规范，包含 TypeScript 规范、组件结构、状态管理和页面编码规范"
globs:
  - "apps/admin-web/**"
  - "apps/student-web/**"
  - "apps/student-mobile/**"
alwaysApply: false
---

# React 前端编码规范

## 代码风格

- 遵循 ESLint + Prettier 配置
- 使用函数式组件 + Hooks
- 使用 TypeScript 严格模式
- 组件和类型使用 `PascalCase`
- 函数和变量使用 `camelCase`
- 常量使用 `UPPER_SNAKE_CASE`

### 导入规范

导入顺序必须严格遵循：

```typescript
// 1. React 相关
import React, { useState, useEffect } from "react";

// 2. 第三方库
import { useRequest } from "ahooks";
import { Button, Modal } from "antd";

// 3. 业务组件
import { QuestionCard } from "@/components/QuestionCard";

// 4. UI 组件
import { Card, Skeleton } from "@/components/ui";

// 5. 类型定义
import type { Question, QuestionType } from "@/types";

// 6. 工具函数、常量、样式
import { formatDate } from "@/utils";
import { QUESTION_STATUS } from "@/constants";
import styles from "./index.module.less";
```

## 页面结构规范

页面目录结构遵循以下模式：

```
pages/[Feature]/[PageName]/
├── index.tsx              # 页面入口，只做导出
├── models/
│   └── page.ts            # 页面状态管理 (unstated-next)
├── views/
│   └── Main.tsx           # 主视图组件
├── hooks/
│   └── use[PageName].ts   # 页面专用 Hooks
└── components/
    └── [ComponentName].tsx # 页面专用组件
```

### 页面入口 (index.tsx)

```typescript
import Main from "./views/Main";
import { PageContainer } from "./models/page";

export default function PageEntry() {
  return (
    <PageContainer.Provider>
      <Main />
    </PageContainer.Provider>
  );
}
```

### 页面状态管理 (models/page.ts)

使用 `unstated-next` 管理页面状态：

```typescript
import { useState, useCallback } from "react";
import { createContainer } from "unstated-next";
import { useRequest } from "ahooks";
import { apiClient } from "@ai-education/shared-web";
import type { Question } from "@/types";

function usePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 使用 ahooks 的 useRequest 处理异步请求
  const {
    data: questions,
    loading,
    refresh,
  } = useRequest(() => apiClient.get<Question[]>("/question/list"), { manual: false });

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  return {
    // 状态
    questions,
    loading,
    selectedId,
    // 方法
    handleSelect,
    refresh,
  };
}

export const PageContainer = createContainer(usePage);
```

### 主视图 (views/Main.tsx)

视图组件只负责 UI 渲染，不包含复杂业务逻辑：

```typescript
import { PageContainer } from "../models/page";
import { QuestionList } from "../components/QuestionList";
import { Spin } from "antd";

export default function Main() {
  const { questions, loading } = PageContainer.useContainer();

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="p-4">
      <QuestionList questions={questions} />
    </div>
  );
}
```

## 组件规范

### 组件定义

```typescript
import type { FC, ReactNode } from "react";

interface QuestionCardProps {
  question: Question;
  selected?: boolean;
  onSelect?: (id: number) => void;
  children?: ReactNode;
}

export const QuestionCard: FC<QuestionCardProps> = ({
  question,
  selected = false,
  onSelect,
  children,
}) => {
  // 组件逻辑
  return (
    <div className="rounded-lg border p-4">
      {/* 渲染内容 */}
    </div>
  );
};
```

### 组件命名

- 组件文件使用 `PascalCase`: `QuestionCard.tsx`
- 组件导出使用命名导出: `export const QuestionCard`
- 页面入口使用默认导出: `export default function PageEntry()`

## 状态管理

### 全局/页面状态: unstated-next

```typescript
import { createContainer } from "unstated-next";

function useGlobalState() {
  const [user, setUser] = useState<User | null>(null);
  return { user, setUser };
}

export const GlobalContainer = createContainer(useGlobalState);
```

### 异步操作: ahooks

```typescript
import { useRequest, useBoolean, useMemoizedFn } from "ahooks";

// 数据请求
const { data, loading, run, refresh } = useRequest(fetchData, {
  manual: true,
  onSuccess: (data) => {
    console.log("成功", data);
  },
  onError: (error) => {
    console.error("失败", error);
  },
});

// 稳定的回调函数引用
const handleSubmit = useMemoizedFn((params: SubmitParams) => {
  // 处理逻辑
});
```

## API 调用规范

### 使用 ApiClient

```typescript
import { apiClient } from "@ai-education/shared-web";

// GET 请求 - 参数直接传递对象（不要嵌套在 params 字段中）
const data = await apiClient.get<Question[]>("/question/list", {
  subject: "math",
  grade: 1,
});
// ✅ 正确：直接传递对象
// ❌ 错误：apiClient.get("/question/list", { params: { subject: "math" } })

// POST 请求
const result = await apiClient.post<Question>("/question", {
  title: "新题目",
  type: "choice",
});

// PATCH 请求
await apiClient.patch(`/question/${id}`, { title: "更新标题" });

// DELETE 请求
await apiClient.delete(`/question/${id}`);
```

**重要**: `ApiClient.get()` 方法的第二个参数是查询参数字典，直接传递对象，不要嵌套在 `params` 字段中。`ApiClient` 会自动将参数转换为 URL 查询参数。

### 错误处理

```typescript
import { useRequest } from "ahooks";
import { message } from "antd";

const { run } = useRequest((params) => apiClient.post("/question", params), {
  manual: true,
  onSuccess: () => {
    message.success("创建成功");
  },
  onError: (error) => {
    message.error(error.message || "操作失败");
  },
});
```

## TypeScript 规范

### 类型定义

```typescript
// 使用 interface 定义对象类型
interface Question {
  id: number;
  title: string;
  type: QuestionType;
  options?: Option[];
}

// 使用 type 定义联合类型或复杂类型
type QuestionType = "choice" | "fill" | "essay";

type QuestionStatus = "draft" | "published" | "archived";
```

### 类型导入

```typescript
// 使用 type 关键字导入类型
import type { Question, QuestionType } from "@/types";

// 混合导入
import { QuestionCard, type QuestionCardProps } from "@/components";
```

### 泛型使用

```typescript
// API 响应类型
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// 泛型组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
}
```

## 可选链和空值处理

### 访问嵌套属性

```typescript
// ✅ 正确：使用完整可选链
const name = user?.profile?.name;
const firstItem = list?.[0]?.value;

// ❌ 错误：不完整的可选链
const name = user.profile?.name; // user 可能为空
```

### 空值合并

```typescript
// 使用 ?? 处理 null 和 undefined
const count = data?.count ?? 0;
const name = user?.name ?? "未知";

// 使用 || 处理所有假值（慎用）
const title = data?.title || "默认标题";
```

## UI 和逻辑分离

### 工具函数提取

将复杂的转换逻辑提取到 `utils.tsx`：

```typescript
// utils.tsx
export function formatQuestionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    draft: "草稿",
    published: "已发布",
    archived: "已归档",
  };
  return statusMap[status] ?? "未知";
}

export function calculateScore(answers: Answer[]): number {
  return answers.reduce((sum, answer) => sum + (answer.correct ? 1 : 0), 0);
}
```

### 复杂逻辑提取为 Hooks

```typescript
// hooks/useQuestionFilter.ts
export function useQuestionFilter(questions: Question[]) {
  const [filters, setFilters] = useState<Filters>({});

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (filters.type && q.type !== filters.type) return false;
      if (filters.status && q.status !== filters.status) return false;
      return true;
    });
  }, [questions, filters]);

  return { filteredQuestions, filters, setFilters };
}
```

## Tailwind CSS 样式

样式规范请参考 [Tailwind CSS 规范](../tailwind/RULE.md)，核心要点：

- 禁止使用 `cn` 封装和三元运算符链式判断
- 必须使用状态映射函数处理多状态样式
- 使用数组 `join(" ")` 拼接类名

## 注意事项

1. **类型安全**: 所有代码必须有完整的类型定义
2. **错误处理**: 所有 API 调用必须有错误处理
3. **性能优化**: 使用 `useMemo`、`useCallback` 优化渲染
4. **可访问性**: 确保组件具有适当的 ARIA 属性
5. **响应式设计**: 使用 Tailwind 的响应式前缀处理不同屏幕尺寸
