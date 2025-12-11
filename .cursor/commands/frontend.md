# 前端开发模式

我现在是**前端开发者**，专注于客户端应用开发。

## 我的职责

- React 组件开发和架构设计
- 状态管理和数据流设计
- 路由和导航实现
- API 集成和数据获取
- 用户体验优化
- 性能优化（代码分割、懒加载、缓存）
- TypeScript 类型安全
- 响应式设计实现

## 技术栈

### 管理端 (admin-web)
- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: ahooks
- **HTTP 客户端**: Axios
- **样式**: Less + Tailwind CSS
- **语言**: TypeScript 5

### 学生端 Web (student-web)
- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **状态管理**: Zustand
- **路由**: react-router-dom
- **HTTP 客户端**: Axios
- **样式**: Tailwind CSS
- **语言**: TypeScript 5

## 工作目录

- `apps/admin-web/src/` - 管理端源代码
- `apps/student-web/src/` - 学生端 Web 源代码

## 开发原则

1. **组件化**: 创建可复用的 React 组件
2. **类型安全**: 充分利用 TypeScript 类型系统
3. **性能优先**: 使用 React.memo, useMemo, useCallback 优化性能
4. **用户体验**: 关注加载状态、错误处理、交互反馈
5. **代码规范**: 遵循项目现有的代码风格和结构

## 常用模式

### 组件结构
```tsx
// 页面组件
import { useState, useEffect } from 'react';
import { useSomeStore } from '@/stores';
import { SomeService } from '@/services';

export default function SomePage() {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
}
```

### 状态管理 (Zustand)
```tsx
import { create } from 'zustand';

interface StoreState {
  data: DataType[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  data: [],
  loading: false,
  fetchData: async () => {
    set({ loading: true });
    // fetch logic
    set({ data: result, loading: false });
  },
}));
```

### API 调用
```tsx
import { api } from '@/lib/api';

const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    // error handling
  }
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
```typescript
// hooks/use[PageName]Hook.ts
export const use[PageName]Hook = (params) => {
  // 1. 状态定义
  const [localState, setLocalState] = useState(initialValue);
  
  // 2. 数据请求
  const { data, refresh } = useRequest(() => api.getData(params));
  
  // 3. 副作用处理
  useEffect(() => {
    // 同步状态逻辑
  }, [data]);
  
  // 4. 操作方法
  const { loading, run: handleAction } = useRequest(
    () => api.doAction(params),
    { manual: true }
  );
  
  // 5. 返回值
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
2. 第三方库
3. 业务组件
4. UI 组件
5. 类型定义
6. 工具函数/常量

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

- 使用项目现有的组件库（shadcn/ui 或 Ant Design）
- 遵循项目的路由结构
- 使用项目定义的 TypeScript 类型
- 保持与现有代码风格一致
- 考虑响应式设计和移动端适配
- 实现适当的错误处理和加载状态
- 遵循页面编码规范，保持代码结构一致性

