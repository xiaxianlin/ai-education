# 学生端 Web 开发模式 (@student-web)

我现在专注于**学生端 Web (student-web)** 的开发工作。

## 应用概述

学生端 Web 是一个基于 React + Rsbuild + shadcn/ui + Tailwind CSS 的 Web 应用，为学生提供学习、练习、评测等功能。

## 技术栈

- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **状态管理**: Zustand
- **路由**: react-router-dom
- **HTTP 客户端**: Axios
- **样式**: Tailwind CSS
- **语言**: TypeScript 5

## 工作目录

- `apps/student-web/src/` - 学生端 Web 源代码
  - `pages/` - 页面组件
  - `components/` - UI 组件和业务组件
  - `stores/` - Zustand 状态管理
  - `hooks/` - 自定义 Hooks
  - `lib/` - 工具库和 API 客户端

## 开发原则

1. **组件化**: 创建可复用的 React 组件
2. **类型安全**: 充分利用 TypeScript 类型系统
3. **性能优先**: 使用 React.memo、useMemo、useCallback 优化性能
4. **用户体验**: 关注加载状态、错误处理、交互反馈
5. **代码规范**: 遵循项目现有的代码风格和结构
6. **响应式设计**: 确保在不同屏幕尺寸下良好显示

## 常用模式

### 页面组件
```tsx
// apps/student-web/src/pages/Some/index.tsx
import { useEffect } from 'react';
import { useSomeStore } from '@/stores/some-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SomePage() {
  const { data, loading, fetchData } = useSomeStore();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <div>加载中...</div>
      ) : (
        <div className="grid gap-4">
          {data.map(item => (
            <Card key={item.id}>{item.name}</Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 状态管理 (Zustand)
```tsx
// apps/student-web/src/stores/some-store.ts
import { create } from 'zustand';
import { someService } from '@/services/some';

interface SomeStore {
  data: SomeType[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

export const useSomeStore = create<SomeStore>((set) => ({
  data: [],
  loading: false,
  fetchData: async () => {
    set({ loading: true });
    try {
      const result = await someService.list();
      set({ data: result, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
}));
```

### API 调用
```tsx
// apps/student-web/src/services/some.ts
import { api } from '@/lib/api';

export const someService = {
  list: async () => {
    const response = await api.get('/api/student/some/list');
    return response.data;
  },
  create: async (data: CreateData) => {
    const response = await api.post('/api/student/some/create', data);
    return response.data;
  },
};
```

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
```typescript
// models/PageModel.ts
import { createContainer } from "unstated-next";
import { useProfileModel } from "@/models/ProfileModel";

const useContainer = () => {
  const { activeTextbooksMap } = useProfileModel();
  return { textbooks: activeTextbooksMap };
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
```typescript
// hooks/use[PageName]Hook.ts
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";

export const use[PageName]Hook = (params) => {
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
```typescript
// components/[Component]/index.tsx
export function Component({ prop }: ComponentProps) {
  const { data, status } = useSomeHook(prop.id);
  
  switch (status) {
    case Status1:
      return <SubComponent1 {...props} />;
    case Status2:
      return <SubComponent2 {...props} />;
    default:
      return null;
  }
}
```

### 导入顺序规范
1. React 相关
2. 第三方库（ahooks, react-router-dom 等）
3. 业务组件（@/components/business）
4. UI 组件（@/components/ui）
5. 类型定义（./types）
6. 工具函数/常量（@/lib, @/constants）

### 命名规范
- 组件：PascalCase（如 `WaitCard.tsx`）
- Hook：camelCase，以 `use` 开头（如 `useDailyPractice.ts`）
- 函数：camelCase（如 `handleClick`）
- 常量：UPPER_SNAKE_CASE（如 `PRACTICE_STATUS`）
- 类型/接口：PascalCase（如 `PracticeCardProps`）

### 代码组织原则
1. 单一职责：每个文件/函数只做一件事
2. 关注点分离：状态、视图、逻辑分离
3. 可复用性：通用逻辑提取为 Hook
4. 可维护性：清晰的目录结构和命名
5. 一致性：遵循统一的代码风格

## 注意事项

- 使用 shadcn/ui 组件库，保持 UI 一致性
- 遵循项目的路由结构
- 使用项目定义的 TypeScript 类型
- 保持与现有代码风格一致
- 考虑响应式设计和移动端适配
- 实现适当的错误处理和加载状态
- 与移动端 (student-app) 保持功能一致性
- 遵循页面编码规范，保持代码结构一致性

## 相关资源

- 后端 API: `apps/server/student/routes/`
- API 文档: `.cursor/commands/api.md`

