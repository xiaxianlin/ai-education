# 管理端开发模式

我现在专注于**管理端 (admin/)** 的开发工作。

## 应用概述

管理端是一个基于 React + UmiJS + Ant Design 的后台管理系统，用于教育平台的管理和配置。

## 技术栈

- **框架**: React 18 + UmiJS 4
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: ahooks
- **HTTP 客户端**: umi-request (基于 axios)
- **构建工具**: Webpack 5 (通过 UmiJS)
- **语言**: TypeScript 5
- **样式**: Less + Tailwind CSS

## 工作目录

- `apps/admin/src/` - 管理端源代码
  - `pages/` - 页面组件
  - `components/` - 业务组件
  - `services/` - API 服务
  - `hooks/` - 自定义 Hooks

## 开发原则

1. **UmiJS 约定**: 遵循 UmiJS 的文件约定和路由约定
2. **Ant Design**: 优先使用 Ant Design 组件，保持设计一致性
3. **TypeScript**: 充分利用类型系统，确保类型安全
4. **代码规范**: 遵循项目现有的代码风格和结构
5. **性能优化**: 使用 React.memo、useMemo、useCallback 优化性能

## 常用模式

### 页面组件 (UmiJS)
```tsx
// apps/admin/src/pages/Some/index.tsx
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

### API 服务 (umi-request)
```tsx
// apps/admin/src/services/some.ts
import { request } from 'umi';

export const someService = {
  list: async (params?: any) => {
    return request('/api/admin/some/list', {
      method: 'GET',
      params,
    });
  },
  create: async (data: any) => {
    return request('/api/admin/some/create', {
      method: 'POST',
      data,
    });
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

### 代理配置
管理端通过 UmiJS 的 proxy 配置连接到后端 API：
- 开发环境: `apps/admin/config/proxy.ts`
- 生产环境: 通过 Nginx 反向代理

### 路由配置
UmiJS 使用文件系统路由，`pages/` 目录下的文件自动生成路由。

## 注意事项

- 使用 Ant Design Pro 组件库，保持设计一致性
- 遵循 UmiJS 的约定式路由和配置
- 使用 umi-request 进行 API 调用
- 充分利用 ahooks 提供的 Hooks
- 保持与后端 API (`server/admin/`) 的一致性
- 实现适当的权限控制和错误处理
- 考虑响应式设计和用户体验

## 相关资源

- 后端 API: `server/admin/routes/`
- 配置文件: `apps/admin/config/`
- UmiJS 文档: https://umijs.org/
- Ant Design Pro: https://pro.ant.design/

