# 学生端开发模式

我现在专注于**学生端 (student/)** 的开发工作。

## 应用概述

学生端是一个基于 React + Rsbuild + shadcn/ui + Tailwind CSS 的现代化 Web 应用，为学生提供学习、练习、评测等功能。

## 技术栈

- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: react-router-dom
- **HTTP 客户端**: Axios
- **语言**: TypeScript 5

## 工作目录

- `apps/student/src/` - 学生端源代码
  - `pages/` - 页面组件
  - `components/` - UI 组件
  - `stores/` - Zustand 状态管理
  - `services/` - API 服务
  - `lib/` - 工具库和配置

## 开发原则

1. **组件化**: 创建可复用的 React 组件
2. **类型安全**: 充分利用 TypeScript 类型系统
3. **性能优先**: 使用 React.memo、useMemo、useCallback 优化性能
4. **用户体验**: 关注加载状态、错误处理、交互反馈
5. **设计系统**: 使用 shadcn/ui 组件，保持 UI 一致性
6. **响应式**: 使用 Tailwind CSS 实现响应式设计

## 常用模式

### 页面组件
```tsx
// apps/student/src/pages/Some/index.tsx
import { useEffect } from 'react';
import { useSomeStore } from '@/stores/some-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SomePage() {
  const { items, loading, fetchItems } = useSomeStore();

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <div>加载中...</div>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
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
// apps/student/src/stores/some-store.ts
import { create } from 'zustand';
import { someService } from '@/services/some';

interface SomeStore {
  items: SomeType[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  createItem: (data: CreateData) => Promise<void>;
}

export const useSomeStore = create<SomeStore>((set, get) => ({
  items: [],
  loading: false,
  fetchItems: async () => {
    set({ loading: true });
    try {
      const data = await someService.list();
      set({ items: data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
  createItem: async (data) => {
    await someService.create(data);
    await get().fetchItems(); // 刷新列表
  },
}));
```

### API 服务 (Axios)
```tsx
// apps/student/src/services/some.ts
import { api } from '@/lib/api';

export const someService = {
  list: async (params?: any) => {
    const response = await api.get('/api/student/some/list', { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/api/student/some/create', data);
    return response.data;
  },
};
```

### shadcn/ui 组件
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>按钮</Button>
  </CardContent>
</Card>
```

### 路由配置
```tsx
// apps/student/src/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import SomePage from '@/pages/Some';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'some',
        element: <SomePage />,
      },
    ],
  },
]);
```

## 样式规范

### Tailwind CSS
```tsx
// 使用 Tailwind 工具类
<div className="container mx-auto p-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* 内容 */}
  </div>
</div>
```

### 响应式设计
- 移动端优先设计
- 使用 Tailwind 的响应式前缀: `sm:`, `md:`, `lg:`, `xl:`

## 注意事项

- 使用 shadcn/ui 组件库，保持 UI 一致性
- 遵循 Rsbuild 的配置和约定
- 使用 Zustand 管理全局状态
- 使用 react-router-dom 进行路由管理
- 保持与后端 API (`server/student/`) 的一致性
- 实现适当的错误处理和加载状态
- 考虑响应式设计和移动端体验
- 使用 Tailwind CSS 工具类，避免自定义 CSS

## 相关资源

- 后端 API: `server/student/routes/`
- shadcn/ui: https://ui.shadcn.com/
- Rsbuild: https://rsbuild.dev/
- Tailwind CSS: https://tailwindcss.com/
- Zustand: https://zustand-demo.pmnd.rs/

