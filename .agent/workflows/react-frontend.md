---
description: React 前端编码规范，包含 TypeScript、组件结构、状态管理和页面编码规范
---

# React 前端编码规范

## 项目概述

- **admin-web**: 管理端，Ant Design 5 + Ant Design Pro
- **student-web**: 学生端，shadcn/ui (基于 Radix UI)

两个应用共享 `@ai-education/shared-web` 包。

## 页面目录标准结构

```
pages/[Feature]/[PageName]/
├── index.tsx            # 页面入口（必需）
├── models/
│   └── page.ts          # 页面级状态管理（unstated-next）
├── views/
│   └── Main.tsx         # 主视图组件
├── components/          # 页面级组件（可选）
├── hooks/               # 页面级 Hooks（可选）
├── api.ts               # 页面级 API（admin-web）
└── utils.tsx            # 工具函数和常量
```

## 页面入口规范 (index.tsx)

```typescript
import { PageModel } from './models/page';
import MainView from './views/Main';

export default function PageNamePage() {
  return (
    <PageModel.Provider>
      <MainView />
    </PageModel.Provider>
  );
}
```

## Model 层规范 (models/page.ts)

```typescript
import { useRequest } from "ahooks";
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createContainer } from "unstated-next";
import { message } from "antd"; // admin-web
// import { toast } from 'sonner'; // student-web

const useContainer = () => {
  // 1. 路由相关
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 2. 本地状态
  const [localState, setLocalState] = useState<Type>(initialValue);

  // 3. 数据请求
  const { data, loading, refresh } = useRequest(() => Api.getData(id!), {
    ready: !!id,
    onError: (error) => {
      message.error(error?.message || "加载失败");
    },
  });

  // 4. 操作请求（手动触发）
  const { runAsync: handleAction, loading: actionLoading } = useRequest(
    async (params) => {
      await Api.doAction(params);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success("操作成功");
        refresh();
      },
    }
  );

  // 5. 计算属性
  const derivedData = useMemo(() => compute(data), [data]);

  // 6. 返回状态和方法
  return {
    data,
    loading,
    localState,
    derivedData,
    navigate,
    refresh,
    handleAction,
    setLocalState,
  };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
```

## View 层规范 (views/Main.tsx)

```typescript
// admin-web 示例
import { PageContainer } from '@ant-design/pro-components';
import { usePageModel } from '../models/page';

export default function MainView() {
  const { data, loading } = usePageModel();

  if (loading) {
    return <PageContainer loading={loading} />;
  }

  return (
    <PageContainer title="页面标题">
      {/* 页面内容 */}
    </PageContainer>
  );
}
```

## API 调用规范

### GET 请求参数传递

```typescript
// ✅ 正确：直接传递查询参数字典
apiClient.get("/ability/atomics", { subject, grade });

// ❌ 错误：不要嵌套在 params 字段中
apiClient.get("/ability/atomics", { params: { subject, grade } });
```

### admin-web API 组织

```typescript
// pages/[Feature]/api.ts
import { apiClient } from "@/lib/api";

export const FeatureApi = {
  async getList(params?: ListParams) {
    return apiClient.get<{ data: Item[]; total: number }>("/feature/list", params);
  },
  async create(data: CreateRequest) {
    return apiClient.post<Item>("/feature", data);
  },
};
```

### student-web API 组织

```typescript
// lib/api.ts
export const studentApi = {
  async getPracticeList() {
    return apiClient.get<Practice[]>("/practice/list");
  },
};
```

## 状态管理规范

### unstated-next 使用

- **页面级状态**: 使用 `createContainer`
- **全局状态**: Auth、Profile 等使用全局 Model
- **本地状态**: 表单输入、临时 UI 状态使用 `useState`

### ahooks useRequest 最佳实践

- **自动请求**: 数据加载，不设置 `manual: true`
- **手动请求**: 用户操作，设置 `manual: true`
- **条件请求**: 使用 `ready` 参数控制执行时机
- **错误处理**: 始终提供 `onError` 回调

## UI 和逻辑分离

1. **工具函数和常量** → `utils.tsx`
2. **可复用逻辑** → `hooks/`
3. **视图组件** → 只负责 UI 渲染

```typescript
// utils.tsx
export const RESOURCE_STATUS_CONFIG = {
  none: { label: "-", color: "default" },
  complete: { label: "已生成", color: "green" },
} as const;

export function hasResources(question: Question): boolean {
  return !!(question.resources && question.resources.length > 0);
}
```

## 应用特定规范

### admin-web

- UI 库: Ant Design 5 + Ant Design Pro
- 页面容器: `PageContainer`
- 表格/表单: `ProTable`, `ProForm`
- 消息提示: `message` API

### student-web

- UI 组件: shadcn/ui
- 样式: Tailwind CSS
- 消息提示: `toast` (sonner)
