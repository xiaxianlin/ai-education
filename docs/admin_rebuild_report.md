# Admin 后台管理系统重构方案

## 📋 项目概述

### 当前系统架构

#### 1. 技术栈对比

| 系统 | 框架 | 路由 | 状态管理 | 构建工具 | UI 库 |
|------|------|------|----------|----------|-------|
| **Server** | FastAPI | - | - | uv | Pydantic |
| **Student** | React 18 | TanStack Router | Zustand | Rsbuild | Tailwind CSS + Shadcn/ui |
| **Admin** | React 18 (Umi Max) | Umi Router | Unstated-next + ahooks | Umi Max | Ant Design 5 + ProComponents |

#### 2. 架构分析

**Server（服务端）**
- 技术：FastAPI + Python 3.12 + SQLAlchemy + Redis + LangChain
- 架构：模块化设计，`admin` 和 `student` 独立子应用
- 特点：
  - 清晰的模块分层（routes / services / schema）
  - 统一的中间件和异常处理
  - 完善的认证过滤器（admin_route_filter / student_router_filter）
  - 10个业务模块（auth, textbook, unit, knowledge, question, student, config, ai, task）

**Student（学生系统）**
- 技术：Rsbuild + React 18 + TanStack Router + Zustand + Tailwind CSS
- 架构：现代化的轻量级架构
- 特点：
  - TanStack Router：类型安全的文件路由
  - Zustand：轻量级全局状态管理
  - TanStack Query：服务端状态管理和缓存
  - 统一的 API 层封装（lib/api.ts）
  - 清晰的组件分层（biz / layout / ui）
  - 自定义 hooks 封装业务逻辑

**Admin（后台管理系统）**
- 技术：Umi Max + Ant Design Pro + Unstated-next
- 架构：企业级重量级框架
- 特点：
  - Umi Max：约定式路由 + 集成式方案
  - Ant Design Pro：企业级后台解决方案
  - ProComponents：高级组件库
  - Unstated-next：容器化状态管理（部分页面使用）
  - ahooks：React Hooks 工具库

---

## 🔍 问题识别

### 1. **技术栈不一致**

**问题**：
- Admin 使用 Umi Max（重量级框架），Student 使用 Rsbuild（轻量级）
- 状态管理方案不同：Admin（Unstated-next + ahooks），Student（Zustand + TanStack Query）
- 路由方案差异：Admin（Umi Router），Student（TanStack Router）

**影响**：
- 开发体验割裂，需要在不同技术栈间切换
- 代码模式无法复用
- 维护成本高，需要掌握多套技术方案

### 2. **状态管理混乱**

**问题**：
- 局部状态管理：部分页面使用 Unstated-next 容器模式（如 Textbook/Detail）
- 全局状态管理缺失：没有统一的全局状态管理方案
- 服务端状态管理：依赖 ahooks 的 useRequest，缺少缓存策略

**影响**：
- 页面间无法共享状态
- 重复请求，缺少缓存机制
- 状态管理模式不统一

### 3. **代码组织不规范**

**问题**：
- 部分页面使用 models/hooks + views 分层（如 Textbook/Detail）
- 部分页面直接在页面组件中写业务逻辑（如 Login）
- 缺少统一的组件库和工具函数

**影响**：
- 代码风格不一致
- 业务逻辑和 UI 耦合
- 难以测试和维护

### 4. **构建和开发体验**

**问题**：
- Umi Max 较重，启动和构建较慢
- 配置复杂，约定式路由不够灵活
- 缺少现代化的开发工具支持

**影响**：
- 开发效率低
- 新功能开发周期长
- 学习曲线陡峭

### 5. **UI 组件库冗余**

**问题**：
- Admin 使用 Ant Design + ProComponents（重量级）
- Student 使用 Tailwind CSS + Shadcn/ui（轻量级）
- 两套设计系统，无法复用组件

**影响**：
- 组件无法跨项目复用
- UI 风格不统一
- 维护两套设计系统成本高

---

## 🎯 重构目标

### 核心目标

1. **技术栈统一**：Admin 与 Student 使用相同的技术栈
2. **架构现代化**：采用现代化、轻量级的技术方案
3. **代码可维护**：统一代码组织方式，提升可维护性
4. **开发效率**：提升开发体验和构建速度
5. **渐进式迁移**：支持逐步迁移，不影响现有功能

---

## 🏗️ 重构方案

### 第一阶段：技术栈升级

#### 1.1 构建工具迁移：Umi Max → Rsbuild

**理由**：
- Rsbuild 基于 Rspack，构建速度快（比 Webpack 快 5-10 倍）
- 配置简单，与 Student 系统保持一致
- 开箱即用的现代化特性（ESM、HMR、Tree-shaking）

**实施步骤**：
```bash
# 1. 安装 Rsbuild
pnpm add -D @rsbuild/core @rsbuild/plugin-react

# 2. 创建 rsbuild.config.ts
# 3. 迁移 Umi 配置到 Rsbuild
# 4. 调整 package.json 脚本
```

**配置示例**：
```typescript
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './public/index.html',
  },
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:7890',
        changeOrigin: true,
      },
    },
  },
  output: {
    distPath: {
      root: 'dist',
    },
  },
});
```

#### 1.2 路由迁移：Umi Router → TanStack Router

**理由**：
- 类型安全，编译时检查路由参数
- 灵活的路由配置，支持懒加载
- 与 Student 系统保持一致

**实施步骤**：
```typescript
// src/router.tsx
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { requireAuth } from './lib/router-utils';

// 路由定义示例
const rootRoute = createRootRoute();

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: lazy(() => import('./pages/Home')),
  beforeLoad: requireAuth,
});

// ... 其他路由

const routeTree = rootRoute.addChildren([
  homeRoute,
  // ... 其他路由
]);

export const router = createRouter({ routeTree });
```

**路由配置对照表**：
```typescript
// 旧路由（Umi）
{ path: '/home', name: '首页', icon: 'dashboard', component: './Home' }

// 新路由（TanStack Router）
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: Home,
  beforeLoad: requireAuth,
});
```

#### 1.3 状态管理统一：Unstated-next + ahooks → Zustand + TanStack Query

**理由**：
- Zustand：轻量级、简单易用的全局状态管理
- TanStack Query：强大的服务端状态管理和缓存
- 与 Student 系统保持一致

**实施步骤**：

**全局状态（Zustand）**：
```typescript
// src/stores/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  manager: Manager | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setManager: (manager: Manager | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  manager: null,
  isAuthenticated: !!localStorage.getItem('token'),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      set({ token, isAuthenticated: true });
    } else {
      localStorage.removeItem('token');
      set({ token: null, isAuthenticated: false });
    }
  },
  setManager: (manager) => set({ manager }),
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, manager: null, isAuthenticated: false });
  },
}));
```

**服务端状态（TanStack Query）**：
```typescript
// src/lib/api/textbook.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// 查询
export const useTextbook = (id: number) => {
  return useQuery({
    queryKey: ['textbook', id],
    queryFn: () => api.get<Textbook>(`/textbook/${id}`),
    enabled: !!id,
  });
};

// 列表查询
export const useTextbookList = (params: TextbookSearch) => {
  return useQuery({
    queryKey: ['textbooks', params],
    queryFn: () => api.get<ListData<Textbook>>('/textbook/search', { params }),
  });
};

// 变更操作
export const useUpdateTextbook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TextbookForm }) =>
      api.put<Textbook>(`/textbook/${id}`, data),
    onSuccess: (_, { id }) => {
      // 自动更新缓存
      queryClient.invalidateQueries({ queryKey: ['textbook', id] });
      queryClient.invalidateQueries({ queryKey: ['textbooks'] });
    },
  });
};
```

**迁移对照表**：
```typescript
// 旧方式（Unstated-next + ahooks）
const { data, loading, refresh } = useRequest(() => TextbookApi.get(id), {
  ready: !!id,
});

// 新方式（TanStack Query）
const { data, isLoading, refetch } = useTextbook(id);
```

---

### 第二阶段：代码架构优化

#### 2.1 统一目录结构

**新目录结构**：
```
admin/src/
├── lib/                    # 核心库
│   ├── api.ts             # API 客户端
│   ├── api/               # API 接口定义
│   │   ├── auth.ts
│   │   ├── textbook.ts
│   │   ├── unit.ts
│   │   └── ...
│   ├── types/             # 类型定义
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── ...
│   ├── utils/             # 工具函数
│   │   ├── format.ts
│   │   ├── validate.ts
│   │   └── ...
│   └── hooks/             # 通用 hooks
│       ├── useAuth.ts
│       └── ...
├── stores/                 # 全局状态
│   ├── useAuthStore.ts
│   └── useConfigStore.ts
├── components/             # 组件库
│   ├── ui/                # 基础 UI 组件
│   ├── biz/               # 业务组件
│   └── layout/            # 布局组件
├── pages/                  # 页面
│   ├── Home/
│   │   ├── Home.tsx
│   │   ├── components/    # 页面级组件
│   │   └── hooks/         # 页面级 hooks
│   ├── Textbook/
│   │   ├── List/
│   │   │   ├── TextbookList.tsx
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   └── Detail/
│   │       ├── TextbookDetail.tsx
│   │       ├── components/
│   │       └── hooks/
│   └── ...
├── router.tsx              # 路由配置
├── index.tsx               # 入口文件
└── index.css               # 全局样式
```

#### 2.2 组件分层规范

**规范**：
1. **页面组件（Pages）**：只负责布局和组合，不包含业务逻辑
2. **业务 Hooks**：封装业务逻辑和数据获取
3. **展示组件（Components）**：纯展示，接收 props
4. **工具函数（Utils）**：纯函数，无副作用

**示例：教材详情页重构**

```typescript
// 旧方式（Unstated-next）
// pages/Textbook/Detail/models/page.ts
const useContainer = () => {
  const { data, loading, refresh } = useRequest(() => TextbookApi.get(id));
  const { runAsync: deleteTextbook } = useRequest(TextbookApi.delete, { manual: true });
  // ...
  return { textbook, loading, handleDelete, ... };
};
export const TextbookDetailModel = createContainer(useContainer);

// pages/Textbook/Detail/index.tsx
<TextbookDetailModel.Provider>
  <Main />
</TextbookDetailModel.Provider>

// 新方式（Hooks）
// pages/Textbook/Detail/hooks/useTextbookDetail.ts
export const useTextbookDetail = (id: number) => {
  const { data: textbook, isLoading, refetch } = useTextbook(id);
  const { mutate: deleteTextbook } = useDeleteTextbook();
  const { mutate: toggleStatus } = useToggleTextbookStatus();

  const handleDelete = () => {
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该教材吗？',
      onOk: () => deleteTextbook(id),
    });
  };

  return {
    textbook,
    isLoading,
    refetch,
    handleDelete,
    handleToggleStatus: () => toggleStatus({ id, status: !textbook?.status }),
  };
};

// pages/Textbook/Detail/TextbookDetail.tsx
export const TextbookDetail = () => {
  const { id } = useParams();
  const { textbook, isLoading, handleDelete } = useTextbookDetail(Number(id));

  if (isLoading) return <LoadingSpinner />;

  return (
    <PageContainer>
      <BasicInfoCard textbook={textbook} />
      <UnitsSection textbookId={id} />
      <KnowledgesSection textbookId={id} />
    </PageContainer>
  );
};
```

#### 2.3 API 层统一封装

**统一 API 客户端**：
```typescript
// lib/api.ts
import axios from 'axios';

const API_BASE_URL = '/api/admin';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10 * 60 * 1000,
});

// 请求拦截器
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers['x-access-token'] = token;
  }
  return config;
});

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error(data.message || '未授权');
    }
    if (data.status !== 0 && data.status !== undefined) {
      throw new Error(data.message || '网络异常');
    }
    return response;
  },
  (error) => {
    throw error;
  }
);

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get<ApiData<T>>(url, config).then(res => res.data.data),
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.post<ApiData<T>>(url, data, config).then(res => res.data.data),
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.put<ApiData<T>>(url, data, config).then(res => res.data.data),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete<ApiData<T>>(url, config).then(res => res.data.data),
};
```

---

### 第三阶段：UI 组件库选择

#### 3.1 方案对比

| 方案 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| **继续使用 Ant Design 5** | 成熟稳定，组件丰富，无需迁移 UI | 与 Student 系统不一致 | ⭐⭐⭐⭐ |
| **迁移到 Tailwind + Shadcn/ui** | 与 Student 统一，现代化，轻量级 | 需要重写所有 UI 组件 | ⭐⭐⭐ |
| **混合方案** | 逐步迁移，兼容性好 | 维护两套 UI 系统 | ⭐⭐ |

#### 3.2 推荐方案：继续使用 Ant Design 5

**理由**：
1. Admin 系统已经基于 Ant Design 5 开发，UI 组件完善
2. Ant Design 5 适合企业级后台，组件功能强大（Table、Form、Modal 等）
3. 迁移 UI 成本极高，收益有限
4. 可以通过统一设计规范，保持 Admin 和 Student 视觉一致性

**优化建议**：
1. 移除 ProComponents，使用基础 Ant Design 组件
2. 统一主题配置，与 Student 系统保持色彩和字体一致
3. 封装业务组件库（如 PageContainer、StatusTag 等）

**主题配置示例**：
```typescript
// src/theme.ts
import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#fff',
    },
  },
};
```

---

### 第四阶段：渐进式迁移策略

#### 4.1 迁移顺序

**阶段 1：基础设施（1-2 周）**
1. ✅ 搭建 Rsbuild 构建环境
2. ✅ 配置 TanStack Router 路由
3. ✅ 配置 Zustand + TanStack Query
4. ✅ 统一 API 层封装
5. ✅ 配置 Ant Design 主题

**阶段 2：核心功能迁移（2-3 周）**
1. ✅ 登录和认证模块（Login、ModifyPassword）
2. ✅ 首页 Dashboard（Home）
3. ✅ 账号管理（Manager）
4. ✅ 教材管理（Textbook List + Detail）

**阶段 3：业务功能迁移（3-4 周）**
1. ✅ 单元管理（Unit）
2. ✅ 知识点管理（Knowledge）
3. ✅ 题目管理（Question List + Edit + Detail）
4. ✅ 学生管理（Student List + Detail + PracticeHistory + PracticeDetail）
5. ✅ 任务管理（Task List + Detail）

**阶段 4：测试和优化（1 周）**
1. ✅ 功能测试
2. ✅ 性能优化
3. ✅ 代码审查
4. ✅ 文档更新

#### 4.2 迁移步骤（单个页面）

**以教材列表页（Textbook/List）为例**：

**Step 1：创建新目录结构**
```bash
src/pages/Textbook/List/
├── TextbookList.tsx        # 页面主组件
├── components/             # 页面级组件
│   ├── TextbookTable.tsx
│   ├── SearchForm.tsx
│   └── CreateModal.tsx
└── hooks/                  # 页面级 hooks
    └── useTextbookList.ts
```

**Step 2：创建 API 层**
```typescript
// lib/api/textbook.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useTextbookList = (params: TextbookSearch) => {
  return useQuery({
    queryKey: ['textbooks', params],
    queryFn: () => api.get<ListData<Textbook>>('/textbook/search', { params }),
  });
};

export const useCreateTextbook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TextbookForm) => api.post<Textbook>('/textbook', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textbooks'] });
      message.success('创建成功');
    },
  });
};

export const useDeleteTextbook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/textbook/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textbooks'] });
      message.success('删除成功');
    },
  });
};
```

**Step 3：创建页面级 Hook**
```typescript
// pages/Textbook/List/hooks/useTextbookList.ts
import { useState } from 'react';
import { useTextbookList, useDeleteTextbook, useCreateTextbook } from '@/lib/api/textbook';
import { Modal } from 'antd';

export const useTextbookListPage = () => {
  const [searchParams, setSearchParams] = useState<TextbookSearch>({
    page: 1,
    limit: 10,
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data, isLoading, refetch } = useTextbookList(searchParams);
  const { mutate: deleteTextbook } = useDeleteTextbook();
  const { mutate: createTextbook, isPending } = useCreateTextbook();

  const handleSearch = (values: Partial<TextbookSearch>) => {
    setSearchParams({ ...searchParams, ...values, page: 1 });
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该教材吗？',
      onOk: () => deleteTextbook(id),
    });
  };

  const handleCreate = (values: TextbookForm) => {
    createTextbook(values, {
      onSuccess: () => setCreateModalOpen(false),
    });
  };

  return {
    textbooks: data?.data || [],
    total: data?.total || 0,
    isLoading,
    searchParams,
    createModalOpen,
    isPending,
    setSearchParams,
    setCreateModalOpen,
    handleSearch,
    handleDelete,
    handleCreate,
    refetch,
  };
};
```

**Step 4：创建页面组件**
```typescript
// pages/Textbook/List/TextbookList.tsx
import { PageContainer } from '@/components/layout/PageContainer';
import { SearchForm } from './components/SearchForm';
import { TextbookTable } from './components/TextbookTable';
import { CreateModal } from './components/CreateModal';
import { useTextbookListPage } from './hooks/useTextbookList';

export const TextbookList = () => {
  const {
    textbooks,
    total,
    isLoading,
    searchParams,
    createModalOpen,
    isPending,
    setSearchParams,
    setCreateModalOpen,
    handleSearch,
    handleDelete,
    handleCreate,
  } = useTextbookListPage();

  return (
    <PageContainer
      title="教材管理"
      extra={
        <Button type="primary" onClick={() => setCreateModalOpen(true)}>
          新增教材
        </Button>
      }
    >
      <SearchForm onSearch={handleSearch} />
      <TextbookTable
        data={textbooks}
        total={total}
        loading={isLoading}
        pagination={searchParams}
        onPaginationChange={setSearchParams}
        onDelete={handleDelete}
      />
      <CreateModal
        open={createModalOpen}
        loading={isPending}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreate}
      />
    </PageContainer>
  );
};
```

**Step 5：添加路由**
```typescript
// router.tsx
const textbookListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/textbook',
  component: lazy(() => import('./pages/Textbook/List/TextbookList')),
  beforeLoad: requireAuth,
});
```

**Step 6：测试和优化**
- 功能测试：确保所有功能正常
- 性能测试：检查请求缓存是否生效
- 代码审查：确保代码规范

---

## 📊 迁移检查清单

### 基础设施
- [ ] Rsbuild 配置完成
- [ ] TanStack Router 配置完成
- [ ] Zustand 状态管理配置完成
- [ ] TanStack Query 配置完成
- [ ] API 层封装完成
- [ ] 类型定义迁移完成
- [ ] Ant Design 主题配置完成

### 页面迁移
- [ ] Login（登录页）
- [ ] ModifyPassword（修改密码）
- [ ] Home（首页）
- [ ] Manager（账号管理）
- [ ] Textbook/List（教材列表）
- [ ] Textbook/Detail（教材详情）
- [ ] Question/List（题目列表）
- [ ] Question/Edit（题目编辑）
- [ ] Question/Detail（题目详情）
- [ ] Student/List（学生列表）
- [ ] Student/Detail（学生详情）
- [ ] Student/PracticeHistory（练习历史）
- [ ] Student/PracticeDetail（练习详情）
- [ ] Task/List（任务列表）
- [ ] Task/Detail（任务详情）

### 组件迁移
- [ ] PageContainer（页面容器）
- [ ] AvatarDropdown（用户头像下拉）
- [ ] StatusTag（状态标签）
- [ ] AudioPlayer（音频播放器）
- [ ] SearchForm（搜索表单）
- [ ] 其他业务组件

### 测试和优化
- [ ] 功能测试通过
- [ ] 性能优化完成
- [ ] 代码审查完成
- [ ] 文档更新完成
- [ ] 部署配置更新

---

## 🚀 实施指南（给 AI 智能体）

### 准备工作

**1. 备份当前代码**
```bash
cd admin
git checkout -b backup/before-refactor
git push origin backup/before-refactor
```

**2. 创建新分支**
```bash
git checkout main
git checkout -b feature/admin-refactor
```

### 阶段 1：基础设施搭建

**任务 1.1：安装依赖**
```bash
cd admin
pnpm add @rsbuild/core @rsbuild/plugin-react
pnpm add @tanstack/react-router @tanstack/react-query
pnpm add zustand axios
pnpm add -D @types/node
```

**任务 1.2：创建 Rsbuild 配置**
```bash
# 创建文件：rsbuild.config.ts
# 参考本文档"1.1 构建工具迁移"部分
```

**任务 1.3：创建新的目录结构**
```bash
mkdir -p src/lib/api
mkdir -p src/lib/types
mkdir -p src/lib/utils
mkdir -p src/lib/hooks
mkdir -p src/stores
mkdir -p src/components/ui
mkdir -p src/components/biz
mkdir -p src/components/layout
```

**任务 1.4：创建 API 层**
```bash
# 创建文件：src/lib/api.ts
# 参考本文档"2.3 API 层统一封装"部分
```

**任务 1.5：创建路由配置**
```bash
# 创建文件：src/router.tsx
# 创建文件：src/lib/router-utils.ts
# 参考本文档"1.2 路由迁移"部分
```

**任务 1.6：创建全局状态**
```bash
# 创建文件：src/stores/useAuthStore.ts
# 参考本文档"1.3 状态管理统一"部分
```

**任务 1.7：更新入口文件**
```typescript
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { router } from './router';
import { theme } from './theme';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5分钟
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>
);
```

**任务 1.8：更新 package.json**
```json
{
  "scripts": {
    "dev": "rsbuild dev",
    "build": "rsbuild build",
    "preview": "rsbuild preview",
    "lint": "eslint --cache --ext .js,.jsx,.ts,.tsx --format=pretty ./src",
    "lint:fix": "eslint --fix --cache --ext .js,.jsx,.ts,.tsx ./src",
    "type-check": "tsc --noEmit"
  }
}
```

### 阶段 2：页面迁移

**页面迁移通用步骤**（以 Textbook/List 为例）：

**Step 1：分析旧代码**
```bash
# 阅读以下文件，理解业务逻辑
src/pages/Textbook/List/index.tsx
src/pages/Textbook/List/models/page.ts
src/services/textbook.ts
types/textbook.d.ts
```

**Step 2：创建 API 接口**
```bash
# 创建文件：src/lib/api/textbook.ts
# 将 src/services/textbook.ts 的接口转换为 TanStack Query hooks
```

**Step 3：创建页面目录**
```bash
mkdir -p src/pages/Textbook/List/components
mkdir -p src/pages/Textbook/List/hooks
```

**Step 4：创建页面级 Hook**
```bash
# 创建文件：src/pages/Textbook/List/hooks/useTextbookList.ts
# 将 models/page.ts 的逻辑转换为普通 hook
```

**Step 5：创建页面组件**
```bash
# 创建文件：src/pages/Textbook/List/TextbookList.tsx
# 将旧的 views/Main.tsx 改造为新的 TextbookList.tsx
```

**Step 6：创建子组件**
```bash
# 创建文件：src/pages/Textbook/List/components/SearchForm.tsx
# 创建文件：src/pages/Textbook/List/components/TextbookTable.tsx
# 创建文件：src/pages/Textbook/List/components/CreateModal.tsx
```

**Step 7：添加路由**
```typescript
// router.tsx
const textbookListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/textbook',
  component: lazy(() => import('./pages/Textbook/List/TextbookList')),
  beforeLoad: requireAuth,
});
```

**Step 8：测试**
```bash
pnpm dev
# 访问 http://localhost:8000/textbook
# 测试所有功能是否正常
```

### 阶段 3：优化和清理

**任务 3.1：删除旧代码**
```bash
# 确认所有页面迁移完成后
rm -rf src/.umi
rm -rf src/.umi-production
rm -rf config
rm -f .umirc.ts
```

**任务 3.2：更新 CLAUDE.md**
```bash
# 更新项目文档，说明新的架构和规范
```

**任务 3.3：性能优化**
- 启用路由懒加载
- 配置 TanStack Query 缓存策略
- 优化打包体积

**任务 3.4：代码审查**
- 检查代码规范
- 检查类型安全
- 检查错误处理

---

## 📝 代码迁移模板

### 旧代码（Unstated-next + ahooks）

```typescript
// models/page.ts
import { useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';
import { TextbookApi } from '@/services/textbook';

const useContainer = () => {
  const { data, loading, refresh } = useRequest(TextbookApi.search, {
    defaultParams: [{ page: 1, limit: 10 }],
  });

  const { runAsync: deleteTextbook } = useRequest(TextbookApi.delete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      refresh();
    },
  });

  return { data, loading, refresh, deleteTextbook };
};

export const TextbookListModel = createContainer(useContainer);

// index.tsx
<TextbookListModel.Provider>
  <Main />
</TextbookListModel.Provider>
```

### 新代码（Zustand + TanStack Query）

```typescript
// lib/api/textbook.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useTextbookList = (params: TextbookSearch) => {
  return useQuery({
    queryKey: ['textbooks', params],
    queryFn: () => api.get<ListData<Textbook>>('/textbook/search', { params }),
  });
};

export const useDeleteTextbook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/textbook/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textbooks'] });
      message.success('删除成功');
    },
  });
};

// pages/Textbook/List/hooks/useTextbookList.ts
export const useTextbookListPage = () => {
  const [params, setParams] = useState({ page: 1, limit: 10 });
  const { data, isLoading } = useTextbookList(params);
  const { mutate: deleteTextbook } = useDeleteTextbook();

  return { data, isLoading, params, setParams, deleteTextbook };
};

// pages/Textbook/List/TextbookList.tsx
export const TextbookList = () => {
  const { data, isLoading, deleteTextbook } = useTextbookListPage();
  return <Main data={data} loading={isLoading} onDelete={deleteTextbook} />;
};
```

---

## 🎓 技术细节说明

### 1. 为什么选择 TanStack Query？

**优势**：
- **自动缓存**：减少重复请求
- **乐观更新**：提升用户体验
- **自动重试**：处理网络波动
- **请求去重**：避免并发重复请求
- **后台刷新**：保持数据新鲜度
- **分页和无限滚动**：内置支持

**示例：自动缓存**
```typescript
// 第一次访问教材详情页，发起请求
const { data } = useTextbook(1);

// 第二次访问同一教材，从缓存读取，不发请求
const { data } = useTextbook(1);

// 5分钟后缓存过期，自动重新请求
```

### 2. 为什么选择 Zustand？

**优势**：
- **简单**：API 极简，学习成本低
- **轻量**：gzip 后仅 1KB
- **无样板代码**：不需要 actions、reducers
- **TypeScript 友好**：完美的类型推导
- **灵活**：支持中间件和 DevTools

**对比 Redux**：
```typescript
// Redux（复杂）
const INCREMENT = 'INCREMENT';
const increment = () => ({ type: INCREMENT });
const reducer = (state = 0, action) => {
  if (action.type === INCREMENT) return state + 1;
  return state;
};
const store = createStore(reducer);

// Zustand（简单）
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 3. TanStack Router vs React Router

| 特性 | TanStack Router | React Router |
|------|-----------------|--------------|
| 类型安全 | ✅ 编译时检查 | ❌ 运行时检查 |
| 路由参数 | ✅ 自动推导类型 | ❌ 需手动定义 |
| 懒加载 | ✅ 内置支持 | ✅ 需手动配置 |
| 数据预加载 | ✅ beforeLoad | ⚠️ loader（v6.4+） |
| 文件路由 | ✅ 可选 | ❌ 不支持 |

---

## 📦 依赖包对照表

### 构建工具
- ❌ `@umijs/max` → ✅ `@rsbuild/core` + `@rsbuild/plugin-react`

### 路由
- ❌ `umi` (内置路由) → ✅ `@tanstack/react-router`

### 状态管理
- ❌ `unstated-next` → ✅ `zustand`
- ❌ `ahooks` (useRequest) → ✅ `@tanstack/react-query`
- ✅ `ahooks` (其他 hooks) → ✅ 保留使用

### HTTP 客户端
- ❌ `umi` (内置 request) → ✅ `axios`

### UI 组件库
- ✅ `antd` → ✅ 保留
- ⚠️ `@ant-design/pro-components` → ⚠️ 逐步移除，替换为基础 Ant Design 组件

### 工具库
- ✅ `lodash` / `lodash-es` → ✅ 保留
- ✅ `dayjs` → ✅ 保留

---

## ⚠️ 注意事项

### 1. 迁移期间的兼容性

在迁移过程中，可能需要同时维护新旧两套代码：
- 新页面使用新架构（TanStack Router + Zustand + TanStack Query）
- 旧页面继续使用旧架构（Umi + Unstated-next + ahooks）

**建议**：
- 优先迁移独立性强的页面（如 Login、Home）
- 逐步迁移有依赖关系的页面（如 Textbook → Unit → Knowledge）
- 最后删除旧代码和旧依赖

### 2. 类型定义迁移

现有类型定义在 `types/` 目录下（如 `manager.d.ts`、`textbook.d.ts`），需要：
- 保留现有类型定义
- 迁移到 `src/lib/types/` 目录
- 统一导出方式（使用 `export` 而非 `declare global`）

```typescript
// 旧方式（types/textbook.d.ts）
declare global {
  interface Textbook {
    id: number;
    name: string;
  }
}

// 新方式（src/lib/types/models.ts）
export interface Textbook {
  id: number;
  name: string;
}
```

### 3. API 接口变更

如果服务端 API 发生变化，需要同步更新：
- `src/lib/api/` 下的接口定义
- `src/lib/types/` 下的类型定义

### 4. 性能优化

**路由懒加载**：
```typescript
const TextbookList = lazy(() => import('./pages/Textbook/List/TextbookList'));
```

**TanStack Query 缓存策略**：
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
      cacheTime: 10 * 60 * 1000, // 缓存保留10分钟
      retry: 1, // 失败重试1次
    },
  },
});
```

### 5. 错误处理

统一错误处理策略：
- API 层处理 HTTP 错误（401、499、500 等）
- 业务层处理业务错误（弹窗提示）
- 全局错误边界处理未捕获的错误

---

## 📖 参考资料

### 官方文档
- [Rsbuild 文档](https://rsbuild.dev/)
- [TanStack Router 文档](https://tanstack.com/router)
- [TanStack Query 文档](https://tanstack.com/query)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [Ant Design 5 文档](https://ant.design/components/overview-cn/)

### 相关文档
- Student 系统代码（参考示例）
- Server API 文档（server/admin/__init__.py, server/admin/schema.py）
- 数据库设计（docs/001_database.sql）

---

## 🎯 总结

### 核心改进

1. **技术栈统一**：Admin 与 Student 使用相同的现代化技术栈
2. **开发效率提升**：Rsbuild 构建速度快 5-10 倍
3. **代码质量提升**：统一的代码组织方式，清晰的分层架构
4. **可维护性提升**：类型安全、组件化、hooks 复用
5. **用户体验提升**：TanStack Query 自动缓存，减少请求次数

### 预期收益

- **构建速度**：从 Webpack 的 20-30 秒降低到 Rsbuild 的 3-5 秒
- **HMR 速度**：从 2-3 秒降低到 100-300ms
- **包体积**：移除 ProComponents 后减小约 500KB
- **开发效率**：统一技术栈后提升约 30%
- **代码可维护性**：提升约 50%

### 风险控制

- **渐进式迁移**：避免一次性大规模改动
- **保持兼容**：迁移期间新旧代码共存
- **充分测试**：每个页面迁移后进行功能测试
- **及时回滚**：遇到问题可快速回退到旧版本

---

**重构完成后，Admin 系统将拥有与 Student 系统一致的现代化架构，极大提升开发效率和代码质量！**
