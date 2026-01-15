# 学生移动端 - Agent 配置

## 应用概述
小学生练习系统的学生移动端应用，基于 React Native + Expo + Tamagui + NativeWind 构建。

## 技术栈
- **框架**: React Native 0.81.5 + React 19
- **开发框架**: Expo ~54.0
- **路由**: Expo Router ~6.0 (基于文件系统的路由)
- **UI 组件**: Tamagui ^1.144
- **样式**: NativeWind ^4.2 (Tailwind CSS for React Native)
- **状态管理**: Zustand ^5.0
- **数据请求**: @tanstack/react-query ^5.90
- **HTTP 客户端**: Axios ^1.13
- **动画**: react-native-reanimated + Moti
- **图标**: @expo/vector-icons + lucide-react-native
- **语言**: TypeScript ~5.9

## 项目结构

```
student-mobile/
├── app/                         # Expo Router 页面目录 (基于文件系统路由)
│   ├── _layout.tsx             # 根布局
│   ├── (tabs)/                 # Tab 导航组
│   │   ├── _layout.tsx         # Tab 布局配置
│   │   ├── index.tsx           # 首页 Tab
│   │   ├── practice.tsx        # 练习 Tab
│   │   ├── records.tsx         # 记录 Tab
│   │   └── profile.tsx         # 我的 Tab
│   ├── login/                  # 登录页面
│   │   └── index.tsx
│   └── practice/               # 练习相关页面
│       ├── [sessionId].tsx     # 练习会话页面
│       └── result/
│           └── [sessionId].tsx # 练习结果页面
├── components/                  # 组件库
│   ├── business/               # 业务组件 (待建设)
│   └── ui/                     # UI 基础组件 (待建设)
├── src/                        # 源码目录
│   ├── api/                    # API 相关
│   │   ├── client.ts          # Axios 客户端配置
│   │   └── types.ts           # API 类型定义
│   ├── components/            # 业务组件
│   │   ├── LearningSettingsDialog.tsx  # 学习设置弹窗
│   │   ├── LearningSettingsGuard.tsx   # 学习设置守卫
│   │   ├── SelectionCard.tsx           # 选择卡片
│   │   ├── StatCard.tsx                # 统计卡片
│   │   └── StatisticsSection.tsx       # 统计区块
│   ├── hooks/                 # 共享 Hooks
│   │   ├── useHomeStatistics.ts        # 首页统计数据
│   │   ├── usePracticeSelection.ts     # 练习选择
│   │   └── useUser.ts                  # 用户信息
│   ├── lib/                   # 工具库
│   │   ├── utils.ts           # 通用工具函数
│   │   └── validators.ts      # 表单验证
│   └── stores/                # Zustand 状态管理
│       ├── useAuthStore.ts    # 认证状态
│       └── useProfileStore.ts # 用户信息状态
├── constants/                  # 常量定义
│   └── Colors.ts              # 颜色主题
├── assets/                     # 静态资源
│   ├── fonts/                 # 字体文件
│   └── images/                # 图片资源
├── tamagui.config.ts          # Tamagui 主题配置
├── tailwind.config.js         # Tailwind CSS 配置
└── app.json                   # Expo 配置
```

## 功能模块

### Tab 导航
| Tab | 页面 | 说明 |
|-----|------|------|
| 首页 | `(tabs)/index.tsx` | 学生首页，展示学习统计和快速入口 |
| 练习 | `(tabs)/practice.tsx` | 练习入口，选择练习类型 |
| 记录 | `(tabs)/records.tsx` | 练习记录列表 |
| 我的 | `(tabs)/profile.tsx` | 个人中心和设置 |

### 认证 (Auth)
- **登录页**: `app/login/index.tsx` - 学生手机号登录

### 练习模块 (Practice)
| 页面 | 路径 | 说明 |
|------|------|------|
| 练习选择 | `(tabs)/practice.tsx` | 选择练习类型（能力练习/单元练习） |
| 练习会话 | `practice/[sessionId].tsx` | 答题页面，核心交互模块 |
| 练习结果 | `practice/result/[sessionId].tsx` | 练习完成后的结果查看 |

### 首页组件
| 组件 | 说明 |
|------|------|
| `StatCard` | 统计数据卡片 |
| `StatisticsSection` | 统计区块展示 |
| `SelectionCard` | 练习类型选择卡片 |

### 设置组件
| 组件 | 说明 |
|------|------|
| `LearningSettingsDialog` | 学习设置弹窗（年级、学期、学科） |
| `LearningSettingsGuard` | 学习设置守卫（首次使用引导） |

## 共享 Hooks

| Hook | 说明 |
|------|------|
| `useHomeStatistics` | 获取首页统计数据 |
| `usePracticeSelection` | 练习选择逻辑 |
| `useUser` | 获取用户信息 |

## 状态管理

### Zustand Stores

```typescript
// useAuthStore.ts - 认证状态
interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
}

// useProfileStore.ts - 用户信息
interface ProfileState {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
}
```

### 使用方式

```typescript
import { useAuthStore } from "@/src/stores/useAuthStore";

// 读取状态
const token = useAuthStore((state) => state.token);

// 更新状态
useAuthStore.setState({ token: newToken });
```

## API 调用

### 客户端配置

API 客户端位于 `src/api/client.ts`，基于 Axios 封装：

```typescript
import { studentApi } from "@/src/api/client";

// 登录
const token = await studentApi.login({ phone, password });

// 获取用户信息
const profile = await studentApi.getProfile();

// 创建练习
const sessionId = await studentApi.createPractice({
  type: "ability_practice",
  ability_code: "MATH_001",
});

// 提交答案
await studentApi.submitAnswer({
  session_id: sessionId,
  question_id: questionId,
  answer: userAnswer,
  time_spent: 30,
});
```

### API 列表

| 方法 | 说明 |
|------|------|
| `login` | 学生登录 |
| `getProfile` | 获取用户信息 |
| `updateSettings` | 更新学习设置 |
| `getPracticeStatistics` | 获取练习统计 |
| `getPracticeRecords` | 获取练习记录 |
| `getAbilityAtomics` | 获取能力列表 |
| `getTextbookUnits` | 获取教材单元 |
| `createPractice` | 创建练习会话 |
| `getPracticeSessionData` | 获取练习会话数据 |
| `submitAnswer` | 提交答案 |
| `completePractice` | 完成练习 |

### Token 存储

移动端 Token 存储在 Zustand store 中，持久化使用 `expo-secure-store`：

```typescript
import * as SecureStore from "expo-secure-store";

// 存储 Token
await SecureStore.setItemAsync("_token_", token);

// 读取 Token
const token = await SecureStore.getItemAsync("_token_");
```

## 开发原则

### React Native 最佳实践
1. 使用函数式组件和 Hooks
2. 使用 `React.memo`、`useMemo`、`useCallback` 优化性能
3. 遵循 React Hooks 规则
4. 组件保持单一职责
5. 考虑移动端性能和内存占用

### Expo Router 路由规范
1. 页面文件放在 `app/` 目录下
2. 使用文件系统路由，文件名即路由路径
3. 动态路由使用 `[param].tsx` 格式
4. 布局文件使用 `_layout.tsx`
5. Tab 导航使用 `(group)/` 目录组织

### UI 组件规范
1. 使用 Tamagui 组件库保持 UI 一致性
2. 使用 NativeWind (Tailwind CSS) 进行样式设计
3. 确保响应式设计和不同屏幕尺寸适配
4. 考虑移动端交互体验（触摸、手势等）
5. 使用 react-native-reanimated 实现流畅动画

### 状态管理
1. 全局状态使用 Zustand
2. 服务端状态使用 @tanstack/react-query
3. 从 Store 获取数据，计算派生状态
4. 避免在组件中直接修改 Store

### 样式规范
1. 优先使用 NativeWind 的 className
2. 复杂样式使用 Tamagui 的 styled 组件
3. 遵循 Tailwind CSS 的状态映射规范（参考 `.cursor/rules/tailwind/RULE.md`）

## 开发命令

```bash
# 启动开发服务器
pnpm dev:mobile

# 启动 iOS 模拟器
pnpm --filter student-mobile ios

# 启动 Android 模拟器
pnpm --filter student-mobile android

# 类型检查
pnpm --filter student-mobile lint
```

## 注意事项

1. **类型安全**: 充分利用 TypeScript 类型系统
2. **错误处理**: 所有 API 调用必须有错误处理
3. **加载状态**: 使用适当的加载状态提示（Skeleton、Spinner）
4. **用户体验**: 关注移动端交互反馈和动画效果
5. **性能优化**: 注意移动端性能，避免不必要的重渲染
6. **可选链访问**: 访问嵌套对象属性时，确保使用完整的可选链（如 `obj?.prop?.subProp`）
7. **状态检查**: 在判断练习会话状态时，需要同时检查 `generate_status`（生成状态）和 `status`（会话状态）
8. **移动端适配**: 考虑不同设备的屏幕尺寸和系统差异（iOS/Android）
9. **安全存储**: 敏感信息（Token 等）使用 `expo-secure-store` 存储

## 相关资源

- 后端 API: `apps/server/student/`
- 共享类型: `packages/shared-web/src/types/`
- Expo 文档: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/
- Tamagui 文档: https://tamagui.dev/
- NativeWind 文档: https://www.nativewind.dev/
- Zustand 文档: https://zustand-demo.pmnd.rs/
- React Query: https://tanstack.com/query/latest
