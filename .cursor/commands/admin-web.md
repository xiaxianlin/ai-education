# 管理端开发模式 (@admin-web)

我现在专注于**管理端 (admin-web)** 的开发工作。

## 应用概述

管理端是一个基于 React + Rsbuild + Ant Design 的后台管理系统，用于教育平台的管理和配置。

## 技术栈

- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: ahooks
- **HTTP 客户端**: Axios
- **语言**: TypeScript 5
- **样式**: Less + Tailwind CSS

## 工作目录

- `apps/admin-web/src/` - 管理端源代码
  - `pages/` - 页面组件
  - `components/` - 业务组件
  - `hooks/` - 自定义 Hooks
  - `utils/` - 工具函数

## 开发原则

1. **React 最佳实践**: 使用函数式组件和 Hooks
2. **Ant Design**: 优先使用 Ant Design 组件，保持设计一致性
3. **TypeScript**: 充分利用类型系统，确保类型安全
4. **代码规范**: 遵循项目现有的代码风格和结构
5. **性能优化**: 使用 React.memo、useMemo、useCallback 优化性能

## 常用模式

### 页面组件
```tsx
// apps/admin-web/src/pages/Some/index.tsx
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { someService } from '@/services/some';

export default function SomePage() {
  const { data, loading, run } = useRequest(someService.list, {
    manual: false,
  });

  return (
    <PageContainer>
      {/* 页面内容 */}
    </PageContainer>
  );
}
```

### API 服务 (Axios)
```tsx
// apps/admin-web/src/services/some.ts
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

### 状态管理 (ahooks)
```tsx
import { useRequest } from 'ahooks';

const { data, loading, run } = useRequest(fetchData, {
  manual: false,
  refreshDeps: [dependency],
});
```

### Ant Design Pro 组件
```tsx
import { ProTable, ProForm, ProFormText } from '@ant-design/pro-components';

<ProTable
  columns={columns}
  request={async (params) => {
    const data = await someService.list(params);
    return { data: data.list, success: true, total: data.total };
  }}
/>
```

## 配置说明

### 构建配置
- 构建工具: Rsbuild
- 配置文件: `apps/admin-web/rsbuild.config.ts`

### 路由配置
使用 react-router-dom 进行路由管理，路由配置在组件中定义。

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
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";

export const use[PageName]Hook = (params) => {
  const [localState, setLocalState] = useState(initialValue);
  const { data, loading, run } = useRequest(() => api.getData(params), {
    manual: false,
  });
  
  useEffect(() => {
    // 同步状态逻辑
  }, [data]);
  
  return { data, loading, status: localState, run };
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
2. 第三方库（ahooks, antd 等）
3. Ant Design Pro 组件（@ant-design/pro-components）
4. 业务组件
5. UI 组件（antd）
6. 类型定义（./types）
7. 工具函数/常量

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

- 使用 Ant Design Pro 组件库，保持设计一致性
- 使用 Axios 进行 API 调用
- 充分利用 ahooks 提供的 Hooks
- 保持与后端 API (`apps/server/admin/`) 的一致性
- 实现适当的权限控制和错误处理
- 考虑响应式设计和用户体验
- 遵循页面编码规范，保持代码结构一致性

## 相关资源

- 后端 API: `apps/server/admin/routes/`
- API 文档: `.cursor/commands/api.md`
- 配置文件: `apps/admin-web/rsbuild.config.ts`
- Ant Design Pro: https://pro.ant.design/
- Rsbuild 文档: https://rsbuild.dev/

