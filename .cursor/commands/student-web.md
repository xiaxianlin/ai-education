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

## 注意事项

- 使用 shadcn/ui 组件库，保持 UI 一致性
- 遵循项目的路由结构
- 使用项目定义的 TypeScript 类型
- 保持与现有代码风格一致
- 考虑响应式设计和移动端适配
- 实现适当的错误处理和加载状态
- 与移动端 (student-app) 保持功能一致性

## 相关资源

- 后端 API: `apps/server/student/routes/`
- API 文档: `.cursor/commands/api.md`

