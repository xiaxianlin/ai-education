# 学生端 Web - Agent 配置

## 应用概述
学生端 Web 应用，基于 React 18 + Rsbuild + shadcn/ui + Tailwind CSS 构建。

## 技术栈
- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **状态管理**: Zustand + unstated-next
- **路由**: react-router-dom
- **HTTP 客户端**: Axios
- **样式**: Tailwind CSS
- **语言**: TypeScript 5

## 开发原则

### React 最佳实践
1. 使用函数式组件和 Hooks
2. 使用 `React.memo`、`useMemo`、`useCallback` 优化性能
3. 遵循 React Hooks 规则
4. 组件保持单一职责

### UI 组件规范
1. 使用 shadcn/ui 组件库保持 UI 一致性
2. 使用 Tailwind CSS 进行样式设计
3. 确保响应式设计和移动端适配
4. 考虑可访问性 (a11y)

### 状态管理
1. 全局状态使用 Zustand
2. 页面级状态使用 `unstated-next` 的 `createContainer`
3. 异步操作使用 `ahooks` 的 `useRequest`
4. 从全局 Model 获取数据，计算派生状态

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
2. 第三方库（ahooks, react-router-dom 等）
3. 业务组件（@/components）
4. UI 组件（@/components）
5. 类型定义
6. 工具函数/常量（@/lib, @/constants）

### API 调用
- 使用 Axios 进行 API 调用
- API 服务统一放在 `src/lib/api/` 目录
- 使用 `@ai-education/shared-web` 中的 API 客户端

## 注意事项

1. **类型安全**: 充分利用 TypeScript 类型系统
2. **错误处理**: 所有 API 调用必须有错误处理
3. **加载状态**: 使用适当的加载状态提示
4. **用户体验**: 关注交互反馈和动画效果
5. **跨平台一致性**: 与移动端（student-app）保持功能一致性

## 相关资源

- 后端 API: `apps/server/student/routes/`
- 共享类型: `packages/shared-web/src/types/`
- shadcn/ui: https://ui.shadcn.com/
