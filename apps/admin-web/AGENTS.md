# 管理端前端 - Agent 配置

## 应用概述
管理后台前端应用，基于 React 18 + Rsbuild + Ant Design 5 构建。

## 技术栈
- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: ahooks + unstated-next
- **HTTP 客户端**: Axios
- **样式**: Less + Tailwind CSS
- **语言**: TypeScript 5

## 开发原则

### React 最佳实践
1. 使用函数式组件和 Hooks
2. 使用 `React.memo`、`useMemo`、`useCallback` 优化性能
3. 遵循 React Hooks 规则
4. 组件保持单一职责

### Ant Design 使用规范
1. 优先使用 Ant Design 和 Ant Design Pro 组件
2. 保持设计系统一致性
3. 使用 `PageContainer` 包裹页面内容
4. 使用 `ProTable`、`ProForm` 等高级组件

### 状态管理
1. 页面级状态使用 `unstated-next` 的 `createContainer`
2. 异步操作使用 `ahooks` 的 `useRequest`
3. 从全局 Model 获取数据，计算派生状态

### 页面编码规范

#### 目录结构
```
pages/[Feature]/[PageName]/
├── index.tsx                    # 页面入口
├── models/
│   └── PageModel.ts            # 页面级状态管理
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

#### 导入顺序
1. React 相关
2. 第三方库（ahooks, antd 等）
3. Ant Design Pro 组件
4. 业务组件
5. UI 组件（antd）
6. 类型定义
7. 工具函数/常量

### API 调用
- 使用 Axios 进行 API 调用
- API 服务统一放在 `src/services/` 目录
- 使用 `@ai-education/shared-web` 中的 API 客户端

## 注意事项

1. **类型安全**: 充分利用 TypeScript 类型系统
2. **错误处理**: 所有 API 调用必须有错误处理
3. **加载状态**: 使用 `useRequest` 的 `loading` 状态
4. **权限控制**: 实现适当的权限检查
5. **响应式设计**: 考虑不同屏幕尺寸

## 相关资源

- 后端 API: `apps/server/admin/routes/`
- 共享类型: `packages/shared-web/src/types/`
- Ant Design Pro: https://pro.ant.design/
