# 前端开发模式 (@frontend)

我现在是**前端开发者**，专注于客户端应用开发。

> **📋 详细规范**: 查看 `.cursor/rules/react-frontend/` 获取完整的 React 前端编码规范。规则会在编辑 `apps/admin-web/**` 和 `apps/student-web/**` 文件时自动应用。

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
- **状态管理**: unstated-next（页面/模块模型）+ ahooks（异步/请求辅助）
- **HTTP 客户端**: Axios（封装于 `@ai-education/shared-web` 的 `ApiClient`）
- **样式**: Less + Tailwind CSS
- **语言**: TypeScript 5

### 学生端 Web (student-web)
- **框架**: React 18
- **构建工具**: Rsbuild
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **状态管理**: unstated-next（全局/页面模型）+ ahooks（异步/请求辅助）
- **路由**: react-router-dom
- **HTTP 客户端**: Axios（封装于 `@ai-education/shared-web` 的 `ApiClient`）
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

export default function SomePage() {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
}
```

### 状态管理（unstated-next：推荐做法）
```tsx
// models/PageModel.ts
import { createContainer } from "unstated-next";
import { useMemo } from "react";
import { useRequest } from "ahooks";

import { studentApi } from "@/lib/api"; // student-web 示例；admin-web 对应 adminApi

const useContainer = () => {
  const { data, loading, refresh } = useRequest(() => studentApi.getProfile());
  const displayName = useMemo(() => data?.name ?? "-", [data]);

  return { data, loading, refresh, displayName };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
```

### API 调用
```tsx
// admin-web: 使用业务模块 API
import { StudentApi } from "@/pages/Student/api";
import { CommonApi } from "@/lib/api";

const data = await StudentApi.searchStudents(params);
const configs = await CommonApi.getConfigs();

// student-web: 使用统一封装的 API
import { studentApi } from "@/lib/api";

const profile = await studentApi.getProfile();
const practices = await studentApi.listPractices();
```

## 快速参考

### 页面编码规范
详细的页面编码规范（目录结构、状态管理、Hook 设计等）请参考：
- `.cursor/rules/react-frontend/` - React 前端编码规范

### 命名规范
详细的命名规范请参考：
- `.cursor/rules/naming-conventions/` - 命名和文件组织规范

## 注意事项

- 使用项目现有的组件库（shadcn/ui 或 Ant Design）
- 遵循项目的路由结构
- 使用项目定义的 TypeScript 类型
- 保持与现有代码风格一致
- 考虑响应式设计和移动端适配
- 实现适当的错误处理和加载状态
- 遵循页面编码规范，保持代码结构一致性

## 相关规则

- `@react-frontend` - React 前端编码规范（自动应用）
- `@naming-conventions` - 命名规范（自动应用）
- `@api-design` - API 设计规范（智能应用）

