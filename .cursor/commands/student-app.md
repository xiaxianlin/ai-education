# 学生端移动应用开发模式 (@student-app)

我现在专注于**学生端移动应用 (student-app)** 的开发工作。

## 应用概述

学生端移动应用是一个基于 React Native 0.73 的跨平台移动应用，为学生提供学习、练习、评测等功能，与 Web 端（student-web）保持功能一致性。

## 技术栈

- **框架**: React Native 0.73
- **语言**: TypeScript 5
- **状态管理**: Zustand
- **路由**: React Navigation (Stack + Bottom Tabs)
- **网络请求**: Axios + React Query
- **样式**: NativeWind 4.0 (Tailwind CSS)
- **本地存储**: AsyncStorage, MMKV
- **UI 组件**: Lucide React Native + 自定义组件
- **表单**: React Hook Form + Zod

## 工作目录

- `apps/student-app/src/` - React Native 源代码
  - `screens/` - 页面组件
  - `components/` - UI 组件
  - `navigation/` - 路由配置
  - `stores/` - Zustand 状态管理
  - `hooks/` - 自定义 Hooks

## 开发原则

1. **跨平台一致性**: 参考 Web 端（student-web）的实现逻辑
2. **原生体验**: 使用原生组件和 API
3. **性能优化**: 优化渲染性能，避免不必要的重渲染
4. **用户体验**: 流畅的动画和交互
5. **类型安全**: 充分利用 TypeScript

## 注意事项

- 与 Web 端（student-web）保持功能一致性
- 使用 NativeWind 进行样式管理
- 处理平台特定问题（iOS/Android）
- 优化性能和内存使用

