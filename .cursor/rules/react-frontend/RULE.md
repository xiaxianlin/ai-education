---
description: "React 前端编码规范，包含 TypeScript、组件结构、状态管理和页面编码规范"
globs:
  - "apps/admin-web/**"
  - "apps/student-web/**"
alwaysApply: false
---

# React 前端编码规范

## 项目概述

本项目包含两个前端应用：
- **admin-web**: 管理端，使用 Ant Design 5 + Ant Design Pro
- **student-web**: 学生端，使用 shadcn/ui (基于 Radix UI)

两个应用共享 `@ai-education/shared-web` 包，包含 API 客户端、类型定义和工具函数。

## TypeScript/JavaScript 规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 进行代码格式化
- 组件使用函数式组件和 Hooks
- 优先使用函数式编程风格
- 所有函数参数和返回值必须有类型定义
- 避免使用 `any`，优先使用具体类型或 `unknown`

## 应用特定规范

### admin-web (管理端)

- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: unstated-next（页面/模块模型）+ ahooks（异步/请求辅助）
- **样式**: Less + Tailwind CSS
- **路由**: react-router-dom v6
- **页面容器**: 使用 `PageContainer` 包裹页面内容
- **表格/表单**: 使用 `ProTable`、`ProForm` 等高级组件
- **消息提示**: 使用 `antd` 的 `message` API

### student-web (学生端)

- **UI 组件**: shadcn/ui (基于 Radix UI)
- **状态管理**: unstated-next（全局/页面模型）+ ahooks（异步/请求辅助）
- **样式**: Tailwind CSS
- **路由**: react-router-dom v6
- **消息提示**: 使用 `sonner` 的 `toast` API
- **使用 Tailwind CSS 工具类进行样式设计**

## 目录结构规范

### 项目根目录结构

```
apps/
├── admin-web/                    # 管理端应用
│   ├── src/
│   │   ├── assets/              # 静态资源（图片、字体等）
│   │   ├── components/          # 全局共享组件
│   │   ├── constants/           # 常量定义
│   │   ├── hooks/               # 全局共享 Hooks
│   │   ├── layouts/             # 布局组件
│   │   ├── lib/                 # 库文件（API、路由等）
│   │   ├── models/              # 全局状态模型
│   │   ├── pages/               # 页面目录
│   │   ├── utils/               # 工具函数
│   │   └── index.tsx            # 应用入口
│   └── package.json
│
└── student-web/                  # 学生端应用
    ├── src/
    │   ├── assets/              # 静态资源
    │   ├── common/              # 通用模块（hooks、layouts、models）
    │   ├── components/          # 组件目录
    │   │   ├── biz/             # 业务组件
    │   │   ├── question/        # 题目相关组件
    │   │   └── ui/              # UI 基础组件（shadcn/ui）
    │   ├── lib/                 # 库文件（API、路由、工具等）
    │   ├── pages/               # 页面目录
    │   └── index.tsx            # 应用入口
    └── package.json
```

### 页面目录标准结构

所有页面必须遵循以下目录结构：

```
pages/
└── [Feature]/                   # 功能模块（如 Question、Practice、Student）
    └── [PageName]/              # 页面名称（如 QuestionList、QuestionDetail）
        ├── index.tsx            # 页面入口（必需）
        ├── models/
        │   └── page.ts          # 页面级状态管理（使用 unstated-next）
        ├── views/
        │   └── Main.tsx         # 主视图组件（必需）
        │   └── [OtherView].tsx  # 其他视图组件（可选）
        ├── components/          # 页面级组件（可选）
        │   └── [ComponentName]/
        │       ├── index.tsx
        │       └── [SubComponent].tsx
        ├── hooks/               # 页面级 Hooks（可选）
        │   └── use[PageName]Hook.ts
        ├── api.ts               # 页面级 API（admin-web 使用，可选）
        ├── types.d.ts           # 页面级类型定义（可选）
        └── index.less           # 页面级样式（可选）
```

**目录结构说明**：

1. **index.tsx**: 页面入口文件，负责提供 Model Provider 和渲染主视图
2. **models/page.ts**: 页面级状态管理，使用 `unstated-next` 的 `createContainer`
3. **views/Main.tsx**: 主视图组件，负责页面 UI 渲染
4. **components/**: 页面级组件，仅在该页面使用
5. **hooks/**: 页面级业务逻辑 Hook
6. **api.ts**: 仅 admin-web 使用，按模块组织的 API 方法
7. **types.d.ts**: 页面级类型定义

### 组件目录组织

#### 全局共享组件

- **admin-web**: `src/components/`
- **student-web**: `src/components/biz/`（业务组件）、`src/components/ui/`（UI 基础组件）

组件目录结构：

```
components/
└── [ComponentName]/
    ├── index.tsx                # 组件入口（必需）
    ├── [ComponentName].tsx      # 主组件（可选，如果逻辑简单可直接在 index.tsx）
    ├── [SubComponent].tsx       # 子组件（可选）
    ├── types.ts                 # 类型定义（可选）
    └── index.less               # 组件样式（可选）
```

#### 页面级组件

页面级组件放在对应页面的 `components/` 目录下，结构与全局组件相同。

## 页面开发规范

### 页面入口文件规范（index.tsx）

页面入口文件必须遵循以下模式：

```typescript
// pages/[Feature]/[PageName]/index.tsx
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

**规范要点**：
- 使用默认导出
- 函数名格式：`[PageName]Page`
- 使用 Model Provider 包裹主视图
- 保持文件简洁，不包含业务逻辑

### Model 层规范（models/page.ts）

页面级状态管理使用 `unstated-next` 的 `createContainer`：

```typescript
// models/page.ts
import { useRequest } from 'ahooks';
import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { message } from 'antd'; // admin-web
// import { toast } from 'sonner'; // student-web
import { Api } from '../api'; // admin-web 使用模块 API
// import { studentApi } from '@/lib/api'; // student-web 使用统一 API

const useContainer = () => {
  // 1. 路由相关
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 2. 本地状态
  const [localState, setLocalState] = useState<Type>(initialValue);

  // 3. 数据请求（使用 useRequest）
  const {
    data,
    loading,
    refresh,
  } = useRequest(() => Api.getData(id!), {
    ready: !!id, // 条件请求
    onError: (error) => {
      message.error(error?.message || '加载失败');
      navigate(-1);
    },
  });

  // 4. 操作请求（使用 useRequest，manual: true）
  const { runAsync: handleAction, loading: actionLoading } = useRequest(
    async (params: ActionParams) => {
      await Api.doAction(params);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('操作成功');
        refresh(); // 刷新数据
      },
      onError: (error) => {
        message.error(error?.message || '操作失败');
      },
    },
  );

  // 5. 计算属性（使用 useMemo）
  const derivedData = useMemo(() => {
    // 计算逻辑
    return compute(data);
  }, [data]);

  // 6. 返回状态和方法
  return {
    // 数据
    data,
    loading,
    // 状态
    localState,
    derivedData,
    // 方法
    navigate,
    refresh,
    handleAction,
    setLocalState,
  };
};

// 导出 Model 和 Hook
export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
```

**Model 层规范要点**：

1. **命名规范**：
   - Model 名称：`[PageName]Model`（如 `QuestionDetailModel`）
   - Hook 名称：`use[PageName]Model`（如 `useQuestionDetailModel`）

2. **代码组织顺序**：
   - 路由相关（useNavigate, useParams）
   - 本地状态（useState）
   - 数据请求（useRequest，自动执行）
   - 操作请求（useRequest，manual: true）
   - 副作用（useEffect）
   - 计算属性（useMemo）
   - 返回对象

3. **错误处理**：
   - 所有 API 调用必须有错误处理
   - 使用 `onError` 回调处理错误
   - admin-web 使用 `message.error`
   - student-web 使用 `toast.error`

4. **条件请求**：
   - 使用 `ready` 参数控制请求执行时机
   - 例如：`ready: !!id` 表示 id 存在时才请求

### View 层规范（views/Main.tsx）

主视图组件负责页面 UI 渲染：

```typescript
// views/Main.tsx (admin-web 示例)
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Flex } from 'antd';
import { usePageModel } from '../models/page';
import { CustomComponent } from '../components/CustomComponent';

export default function MainView() {
  const {
    data,
    loading,
    handleAction,
  } = usePageModel();

  if (loading) {
    return <PageContainer loading={loading} />;
  }

  if (!data) {
    return null;
  }

  return (
    <PageContainer title="页面标题" header={{ onBack: () => navigate(-1) }}>
      <Flex vertical gap={16}>
        <Card>
          <CustomComponent data={data} />
        </Card>
      </Flex>
    </PageContainer>
  );
}
```

```typescript
// views/Main.tsx (student-web 示例)
import { usePageModel } from '../models/page';
import { EmptyView } from './EmptyView';
import { ProcessingView } from './ProcessingView';
import { ResultView } from './ResultView';

export function MainView() {
  const { panel, data, loading } = usePageModel();

  if (loading) {
    return <LoadingSpinner />;
  }

  // 根据状态渲染不同视图
  switch (panel) {
    case PanelType.EMPTY:
      return <EmptyView />;
    case PanelType.PROCESSING:
      return <ProcessingView data={data} />;
    case PanelType.RESULT:
      return <ResultView data={data} />;
    default:
      return null;
  }
}
```

**View 层规范要点**：

1. **使用 Model Hook**：
   - 通过 `usePageModel()` 获取状态和方法
   - 不要在 View 中直接调用 API

2. **加载状态处理**：
   - admin-web: 使用 `PageContainer` 的 `loading` 属性
   - student-web: 使用自定义 Loading 组件

3. **条件渲染**：
   - 处理 loading 状态
   - 处理空数据状态
   - 根据业务状态渲染不同视图

4. **组件拆分**：
   - 复杂页面拆分为多个子视图
   - 子视图放在 `views/` 目录下

### Components 层规范

页面级组件放在页面的 `components/` 目录下：

```typescript
// components/[ComponentName]/index.tsx
import { Card } from 'antd'; // admin-web
// import { Card } from '@/components/ui/card'; // student-web

interface ComponentNameProps {
  data: DataType;
  onAction?: () => void;
}

export function ComponentName({ data, onAction }: ComponentNameProps) {
  return (
    <Card title="标题">
      {/* 组件内容 */}
    </Card>
  );
}
```

**组件规范要点**：

1. **Props 类型定义**：
   - 使用 `interface` 定义 Props 类型
   - 必需属性不添加 `?`
   - 可选属性添加 `?`

2. **组件命名**：
   - 使用 PascalCase
   - 与文件名保持一致

3. **导出方式**：
   - 使用命名导出：`export function ComponentName`
   - 或默认导出：`export default function ComponentName`

### Hooks 层规范

页面级业务逻辑 Hook 放在页面的 `hooks/` 目录下：

```typescript
// hooks/use[PageName]Hook.ts
import { useRequest } from 'ahooks';
import { useState } from 'react';

export function usePageNameHook(params: HookParams) {
  const [state, setState] = useState(initialValue);

  const { data, loading } = useRequest(() => {
    // 请求逻辑
  });

  const handleAction = () => {
    // 操作逻辑
  };

  return {
    data,
    loading,
    state,
    handleAction,
  };
}
```

**Hook 规范要点**：

1. **命名规范**：
   - Hook 名称以 `use` 开头
   - 格式：`use[PageName]Hook` 或 `use[Feature]Hook`

2. **代码组织顺序**：
   - 状态声明（useState）
   - 数据请求（useRequest）
   - 副作用（useEffect）
   - 操作方法
   - 返回值

3. **返回值**：
   - 返回对象，包含数据、状态和方法

### UI 和逻辑分离规范

**核心原则**：UI 组件只负责渲染，业务逻辑和数据处理应提取到独立的文件或 Hooks 中。

#### 1. 工具函数和常量分离

**规则**：将业务逻辑相关的工具函数、映射常量和类型定义提取到独立的 `utils.tsx` 或 `utils.ts` 文件中。

**示例**：

```typescript
// pages/Question/QuestionList/utils.tsx
/**
 * 素材相关的映射常量和功能函数
 */

// 常量定义
export const RESOURCE_STATUS_CONFIG = {
  none: { label: '-', color: 'default' },
  not_generated: { label: '未生成', color: 'red' },
  partial: { label: '生成不足', color: 'orange' },
  complete: { label: '已生成', color: 'green' },
} as const;

export type ResourceStatus = keyof typeof RESOURCE_STATUS_CONFIG;

// 工具函数
export function hasResources(question: Question): boolean {
  return !!(question.resources && question.resources.length > 0);
}

export function getResourceStatus(question: Question): ResourceStatus {
  // 业务逻辑实现
}
```

**在组件中使用**：

```typescript
// views/List.tsx
import { getResourceStatus, hasResources, RESOURCE_STATUS_CONFIG } from '../utils';

export function ListView() {
  // UI 渲染逻辑
  const status = getResourceStatus(record);
  const config = RESOURCE_STATUS_CONFIG[status];
  // ...
}
```

#### 2. 可复用逻辑提取为 Hooks

**规则**：跨页面或跨组件使用的业务逻辑应提取为独立的 Hooks，放在功能模块的 `hooks/` 目录下。

**示例**：

```typescript
// pages/Question/hooks/useGenerateQuestionResources.ts
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { QuestionApi } from '../api';

/**
 * 生成题目素材的 Hook
 * 供列表页和详情页复用
 */
export function useGenerateQuestionResources(onSuccess?: () => void) {
  const { runAsync: generateResources, loading } = useRequest(
    async (questionId: string) => {
      await QuestionApi.generateQuestionResources(questionId);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('素材生成成功');
        onSuccess?.();
      },
      onError: (error: any) => {
        message.error(error?.message || '素材生成失败');
      },
    },
  );

  return {
    generateResources,
    loading,
  };
}
```

#### 3. 组件职责划分

**规则**：

1. **视图组件（views/）**：只负责 UI 渲染和用户交互，不包含复杂业务逻辑
2. **工具文件（utils.tsx）**：存放纯函数、常量映射、类型定义
3. **Hooks（hooks/）**：存放可复用的业务逻辑、状态管理、副作用处理
4. **模型（models/）**：存放页面级状态管理和数据流

**目录结构示例**：

```
pages/Question/QuestionList/
├── index.tsx                    # 页面入口
├── models/page.ts               # 页面状态管理
├── views/
│   └── List.tsx                 # UI 渲染（导入工具函数和 Hooks）
├── hooks/                       # 页面级 Hooks（可选）
├── utils.tsx                    # 工具函数和常量（新建）
└── components/                  # 页面级组件
```

#### 4. 分离的好处

1. **可维护性**：逻辑集中管理，易于修改和测试
2. **可复用性**：工具函数和 Hooks 可在多个组件间复用
3. **可测试性**：纯函数易于单元测试
4. **可读性**：组件代码更简洁，专注于 UI 渲染

#### 5. 实施检查清单

在编写代码时，检查以下事项：

- [ ] 常量映射是否提取到 `utils.tsx`？
- [ ] 工具函数是否提取到 `utils.tsx`？
- [ ] 跨组件/跨页面的逻辑是否提取为 Hooks？
- [ ] 组件文件是否只包含 UI 渲染逻辑？
- [ ] 业务逻辑是否与 UI 完全分离？
   - 保持返回值结构清晰

## 状态管理规范

### unstated-next 使用规范

页面级/模块级状态使用 `unstated-next` 的 `createContainer`：

```typescript
import { createContainer } from 'unstated-next';

const useContainer = () => {
  // 状态和逻辑
  return { /* 返回的状态和方法 */ };
};

export const Model = createContainer(useContainer);
export const useModel = Model.useContainer;
```

**使用场景**：
- 页面级状态管理（推荐）
- 模块级状态管理
- 全局状态管理（如 Auth、Profile）

**不适用场景**：
- 简单的本地状态（使用 `useState`）
- 表单状态（使用 `Form.useForm`）
- 临时 UI 状态（使用 `useState`）

### ahooks 使用规范

使用 `ahooks` 的 `useRequest` 管理异步操作：

```typescript
// 自动执行的请求（数据加载）
const { data, loading, refresh } = useRequest(() => Api.getData(), {
  ready: condition, // 条件请求
  onSuccess: (data) => {
    // 成功回调
  },
  onError: (error) => {
    // 错误处理
  },
});

// 手动触发的请求（操作）
const { runAsync: handleAction, loading: actionLoading } = useRequest(
  (params) => Api.doAction(params),
  {
    manual: true, // 手动触发
    onSuccess: () => {
      message.success('操作成功');
      refresh(); // 刷新数据
    },
  },
);
```

**useRequest 最佳实践**：

1. **自动请求**：用于数据加载，不设置 `manual: true`
2. **手动请求**：用于用户操作，设置 `manual: true`
3. **条件请求**：使用 `ready` 参数控制执行时机
4. **错误处理**：始终提供 `onError` 回调
5. **数据刷新**：操作成功后调用 `refresh()` 刷新数据

### 全局状态 vs 页面状态

**全局状态**（使用 unstated-next）：
- 用户认证信息（Auth）
- 用户资料（Profile）
- 系统配置（Configs）
- 主题设置等

**页面状态**（使用 unstated-next）：
- 页面数据
- 页面操作状态
- 页面 UI 状态

**本地状态**（使用 useState）：
- 表单输入
- 临时 UI 状态（如 modal 显示/隐藏）
- 组件内部状态

### 状态命名规范

- Model 名称：`[Feature]Model` 或 `[PageName]Model`
- Hook 名称：`use[Feature]Model` 或 `use[PageName]Model`
- 状态变量：使用描述性名称，如 `loading`、`data`、`selectedItem`
- 操作方法：使用动词开头，如 `handleSubmit`、`handleDelete`、`handleRefresh`

## API 调用规范

### ApiClient 使用方式

项目 Web 端统一通过 `@ai-education/shared-web` 的 `ApiClient`（内部基于 Axios）进行请求。

**API 响应格式**：
- 后端返回统一格式：`{ status: 0, message: "ok", data: T }`
- `ApiClient` 会自动提取 `response.data.data` 作为业务返回值
- 错误响应：`status !== 0` 时会抛出错误，错误信息在 `message` 字段

**重要：GET 请求参数传递方式**：
- `ApiClient.get()` 方法的第二个参数是查询参数字典，直接传递对象，不要嵌套在 `params` 字段中
- 第三个参数是 Axios 配置对象（可选）

```typescript
// ✅ 正确：直接传递查询参数字典
apiClient.get("/ability/atomics", { subject, grade })

// ❌ 错误：不要嵌套在 params 字段中
apiClient.get("/ability/atomics", { params: { subject, grade } })
```

### admin-web API 组织方式

**模块化 API 组织**：按功能模块拆分到各业务目录下的 `api.ts`

```typescript
// pages/[Feature]/api.ts
import { apiClient } from '@/lib/api';

export const FeatureApi = {
  /**
   * 获取列表
   * GET /feature/list
   */
  async getList(params?: ListParams) {
    return apiClient.get<{ data: Item[]; total: number }>('/feature/list', params);
  },

  /**
   * 获取详情
   * GET /feature/{id}
   */
  async getDetail(id: string) {
    return apiClient.get<Item>(`/feature/${id}`);
  },

  /**
   * 创建
   * POST /feature
   */
  async create(data: CreateRequest) {
    return apiClient.post<Item>('/feature', data);
  },

  /**
   * 更新
   * PATCH /feature/{id}
   */
  async update(id: string, data: UpdateRequest) {
    return apiClient.patch<Item>(`/feature/${id}`, data);
  },

  /**
   * 删除
   * DELETE /feature/{id}
   */
  async delete(id: string) {
    return apiClient.delete(`/feature/${id}`);
  },
};
```

**使用方式**：

```typescript
import { FeatureApi } from '../api';

const { data } = useRequest(() => FeatureApi.getList(params));
```

**规范要点**：
- 每个功能模块有独立的 `api.ts` 文件
- API 方法使用 JSDoc 注释说明 HTTP 方法和路径
- 方法名使用动词：`get`、`create`、`update`、`delete`
- 类型定义明确，使用泛型指定返回类型

### student-web API 组织方式

**统一 API 封装**：所有 API 统一封装在 `src/lib/api.ts` 的 `studentApi` 对象中

```typescript
// lib/api.ts
import { apiClient } from './api';

export const studentApi = {
  // ========== 认证相关 ==========
  /**
   * 用户登录
   * POST /login
   */
  async login(params: LoginRequest) {
    return apiClient.post<string>('/login', params);
  },

  // ========== 练习相关 ==========
  /**
   * 获取练习列表
   * GET /practice/list
   */
  async getPracticeList() {
    return apiClient.get<Practice[]>('/practice/list');
  },
};
```

**使用方式**：

```typescript
import { studentApi } from '@/lib/api';

const { data } = useRequest(() => studentApi.getPracticeList());
```

**规范要点**：
- 所有 API 方法集中在 `studentApi` 对象中
- 使用注释分组（如 `// ========== 认证相关 ==========`）
- 方法名使用动词：`get`、`create`、`update`、`delete`
- 类型定义明确，使用泛型指定返回类型

### 错误处理规范

**API 客户端配置**：

```typescript
// lib/api.ts
apiClient.addResponseInterceptor(
  (response) => {
    const { status, message } = response?.data || {};
    if (status === 0) {
      return response;
    }
    if (status === 401) {
      apiClient.removeToken();
      go('/login'); // 跳转登录页
    }
    throw Error(message);
  },
  (error) => error,
);

apiClient.addResponseInterceptor(
  (response) => response,
  (error) => {
    // 开发环境输出日志
    if (process.env.NODE_ENV === 'development') {
      console.log(error.message);
    }
    // 统一错误提示
    message.error(error.message || '网络错误'); // admin-web
    // toast.error(error.message || '网络错误'); // student-web
    return Promise.reject(error);
  },
);
```

**在 Model 中使用**：

```typescript
const { data, loading } = useRequest(() => Api.getData(), {
  onError: (error) => {
    // 错误已在拦截器中处理，这里可以处理特殊逻辑
    message.error(error?.message || '加载失败');
  },
});
```

### 请求拦截器配置

**Token 管理**：
- Token 存储在 `localStorage`，key 为 `_token_`（`ApiClient` 默认值）
- 请求自动携带 Token：`x-access-token` 头
- 认证错误（status === 401）自动跳转登录页

**请求配置**：
- 超时时间：10 分钟
- Content-Type：`application/json`
- 文件上传：使用 `apiClient.form()` 方法

## 组件开发规范

### 组件目录结构

```
components/
└── [ComponentName]/
    ├── index.tsx                # 组件入口（必需）
    ├── [ComponentName].tsx      # 主组件（可选）
    ├── [SubComponent].tsx       # 子组件（可选）
    ├── types.ts                 # 类型定义（可选）
    └── index.less               # 组件样式（可选）
```

### 组件命名规范

- **组件名**：使用 PascalCase，如 `QuestionCard`、`AudioPlayer`
- **文件名**：与组件名保持一致
- **Props 接口**：`[ComponentName]Props`

### Props 类型定义

```typescript
// components/ComponentName/index.tsx
interface ComponentNameProps {
  // 必需属性
  data: DataType;
  onAction: (id: string) => void;
  
  // 可选属性
  title?: string;
  className?: string;
}

export function ComponentName({ data, onAction, title, className }: ComponentNameProps) {
  // 组件实现
}
```

**规范要点**：
- 使用 `interface` 定义 Props 类型
- 必需属性不添加 `?`
- 可选属性添加 `?`
- 事件处理函数使用 `on` 前缀，如 `onClick`、`onSubmit`

### 共享组件使用规范

**admin-web 共享组件**：

```typescript
// src/components/index.ts
export * from './PageHeader';
export * from './DeleteButton';
export * from './DetailCard';
// ...
```

使用方式：

```typescript
import { PageHeader, DeleteButton } from '@/components';
```

**student-web 共享组件**：

```typescript
// src/components/biz/index.ts
export * from './AudioPlayer';
export * from './Header';
// ...

// src/components/ui/index.ts
export * from './button';
export * from './card';
// ...
```

使用方式：

```typescript
import { AudioPlayer } from '@/components/biz';
import { Button, Card } from '@/components/ui';
```

### 组件开发最佳实践

1. **单一职责**：每个组件只负责一个功能
2. **可复用性**：提取通用逻辑为 Hook
3. **类型安全**：所有 Props 必须有类型定义
4. **性能优化**：使用 `React.memo`、`useMemo`、`useCallback`
5. **可访问性**：遵循无障碍设计原则

## 样式规范

### admin-web 样式规范

- **Less + Tailwind CSS**：优先使用 Tailwind CSS 工具类
- **页面样式**：使用 Less 文件（`index.less`）
- **组件样式**：优先使用 Tailwind CSS，复杂样式使用 Less

```typescript
// 使用 Tailwind CSS
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
  {/* 内容 */}
</div>

// 使用 Less（复杂样式）
import './index.less';
<div className="custom-component">
  {/* 内容 */}
</div>
```

### student-web 样式规范

- **Tailwind CSS**：完全使用 Tailwind CSS 工具类
- **不使用 Less/CSS 文件**：所有样式通过 Tailwind 类名实现

```typescript
// 完全使用 Tailwind CSS
<div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  {/* 内容 */}
</div>
```

### 样式组织方式

1. **内联样式**：仅用于动态样式（如基于 props 的样式）
2. **Tailwind 类名**：优先使用，保持一致性
3. **Less 文件**：仅 admin-web 使用，用于复杂样式或主题定制

## 代码组织原则

### 导入顺序规范

```typescript
// 1. React 相关
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 2. 第三方库
import { useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';

// 3. Ant Design Pro 组件（admin-web）或业务组件（student-web）
import { PageContainer, ProTable } from '@ant-design/pro-components';
// import { LoadingSpinner } from '@/components/biz';

// 4. UI 组件
import { Button, Card, message } from 'antd'; // admin-web
// import { Button, Card } from '@/components/ui'; // student-web
// import { toast } from 'sonner'; // student-web

// 5. 类型定义
import type { Question, QuestionListParams } from '../types';

// 6. 工具函数/常量
import { formatDate } from '@/utils/format';
import { QuestionApi } from '../api'; // admin-web
// import { studentApi } from '@/lib/api'; // student-web

// 7. 样式文件（可选）
import './index.less';
```

### 文件命名规范

- **页面文件**：`index.tsx`（入口）、`Main.tsx`（主视图）
- **组件文件**：`index.tsx` 或 `[ComponentName].tsx`
- **类型文件**：`types.ts` 或 `types.d.ts`
- **样式文件**：`index.less`（仅 admin-web）
- **API 文件**：`api.ts`（仅 admin-web）

### 类型定义规范

```typescript
// 页面级类型定义：types.d.ts
interface PageData {
  id: string;
  name: string;
}

interface PageParams {
  page?: number;
  size?: number;
}

// 组件 Props 类型：在组件文件中定义
interface ComponentProps {
  data: PageData;
  onAction?: () => void;
}
```

### 注释规范

```typescript
/**
 * 页面级状态管理
 * 负责管理 [功能描述]
 */
const useContainer = () => {
  // ...
};

/**
 * 获取列表数据
 * @param params 查询参数
 * @returns 列表数据
 */
async function getList(params: ListParams) {
  // ...
}
```

## 性能优化

- 使用 `React.memo` 优化组件渲染
- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 缓存函数引用
- 使用代码分割和懒加载（React.lazy）
- 考虑响应式设计和移动端适配
- 避免在渲染函数中创建新对象/数组

## 代码组织原则

1. **单一职责**：每个文件/函数只做一件事
2. **关注点分离**：状态、视图、逻辑分离
3. **可复用性**：通用逻辑提取为 Hook 或工具函数
4. **可维护性**：清晰的目录结构和命名
5. **一致性**：遵循统一的代码风格和规范
6. **类型安全**：充分利用 TypeScript 类型系统
7. **错误处理**：所有异步操作必须有错误处理

## 差异化总结

### admin-web vs student-web

| 方面 | admin-web | student-web |
|------|-----------|-------------|
| UI 库 | Ant Design 5 + Pro | shadcn/ui |
| 消息提示 | `message` (antd) | `toast` (sonner) |
| API 组织 | 模块化（各模块 api.ts） | 统一封装（studentApi） |
| 样式方案 | Less + Tailwind CSS | Tailwind CSS |
| 页面容器 | `PageContainer` | 自定义布局 |
| 表格组件 | `ProTable` | 自定义实现 |
| 表单组件 | `ProForm` | 自定义实现 |

### 共同规范

- 使用 `unstated-next` 进行状态管理
- 使用 `ahooks` 的 `useRequest` 管理异步操作
- 使用 `react-router-dom` v6 进行路由管理
- 使用 `@ai-education/shared-web` 的 `ApiClient`
- 遵循相同的目录结构和页面组织方式
- 使用 TypeScript 进行类型检查
