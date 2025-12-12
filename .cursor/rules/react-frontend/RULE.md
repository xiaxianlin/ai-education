---
description: "React 前端编码规范，包含 TypeScript、组件结构、状态管理和页面编码规范"
globs:
  - "apps/admin-web/**"
  - "apps/student-web/**"
alwaysApply: false
---

# React 前端编码规范

## TypeScript/JavaScript 规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 进行代码格式化
- 组件使用函数式组件和 Hooks
- 优先使用函数式编程风格

## 应用特定规范

### admin-web (管理端)
- UI 库: Ant Design 5 + Ant Design Pro Components
- 状态管理: ahooks
- 样式: Less + Tailwind CSS
- 使用 `PageContainer` 包裹页面内容
- 使用 `ProTable`、`ProForm` 等高级组件

### student-web (学生端)
- UI 组件: shadcn/ui (基于 Radix UI)
- 状态管理: Zustand + unstated-next
- 样式: Tailwind CSS
- 使用 Tailwind CSS 工具类进行样式设计

## 页面编码规范

### 目录结构
```
pages/[Feature]/[PageName]/
├── index.tsx                    # 页面入口
├── models/
│   └── PageModel.ts            # 页面级状态管理（使用 unstated-next）
├── views/
│   └── Main.tsx                # 主视图组件
├── hooks/
│   └── use[PageName]Hook.ts    # 业务逻辑 Hook
└── components/
    └── [ComponentName]/
        ├── index.tsx           # 组件入口
        ├── types.ts            # 类型定义
        └── [SubComponent].tsx  # 子组件
```

### 状态管理模式

页面级状态使用 `unstated-next` 的 `createContainer`:

```typescript
// models/PageModel.ts
import { createContainer } from "unstated-next";
import { useMemo } from "react";

const useContainer = () => {
  const { someData } = useGlobalModel();
  const derivedData = useMemo(() => {
    // 计算逻辑
  }, [someData]);
  return { someData, derivedData };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
```

### 页面入口规范

```typescript
// index.tsx
import { PageModel } from "./models/PageModel";
import { MainView } from "./views/Main";

export default function PageName() {
  return (
    <PageModel.Provider>
      <MainView />
    </PageModel.Provider>
  );
}
```

### Hook 设计规范

- Hook 命名以 `use` 开头
- 按顺序组织：状态 → 请求 → 副作用 → 操作 → 返回值
- 使用 `useRequest` (ahooks) 管理异步操作
- 返回对象包含数据和操作方法

```typescript
// hooks/use[PageName]Hook.ts
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";

export const usePageNameHook = (params) => {
  const [localState, setLocalState] = useState(initialValue);
  const { data, refresh } = useRequest(() => api.getData(params));
  
  useEffect(() => {
    // 同步状态逻辑
  }, [data]);
  
  const { loading, run: handleAction } = useRequest(
    () => api.doAction(params),
    { manual: true }
  );
  
  return { data, loading, status: localState, refresh, handleAction };
};
```

### 组件组织规范

- 组件目录使用 `index.tsx` 作为入口
- 主组件负责状态管理和分发
- 子组件负责具体 UI 渲染
- 类型定义统一放在 `types.ts`

### 导入顺序规范

1. React 相关
2. 第三方库（ahooks, react-router-dom 等）
3. Ant Design Pro 组件（admin-web）或业务组件（student-web）
4. UI 组件（antd 或 shadcn/ui）
5. 类型定义（./types）
6. 工具函数/常量

### API 调用

使用 Axios 进行 API 调用，统一放在服务目录：

```typescript
// services/some.ts
import { api } from '@/lib/api';

export const someService = {
  list: async (params?: any) => {
    const response = await api.get('/api/admin/some/list', { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/api/admin/some/create', data);
    return response.data;
  },
};
```

## 性能优化

- 使用 `React.memo`、`useMemo`、`useCallback` 优化性能
- 使用代码分割和懒加载
- 考虑响应式设计和移动端适配

## 代码组织原则

1. 单一职责：每个文件/函数只做一件事
2. 关注点分离：状态、视图、逻辑分离
3. 可复用性：通用逻辑提取为 Hook
4. 可维护性：清晰的目录结构和命名
5. 一致性：遵循统一的代码风格
