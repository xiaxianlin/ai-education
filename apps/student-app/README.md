# Student App - React Native 移动端应用

基于 React Native 构建的学生端移动应用，与 student-web 技术栈对齐。

## 技术栈

- **框架**: React Native 0.73.0 + React 18.2.0 + TypeScript 5.3.3
- **导航**: React Navigation 6.x
- **状态管理**: Zustand 4.5.5
- **网络请求**: Axios 1.13.1 + React Query 5.0.0
- **样式**: NativeWind 4.0 (Tailwind CSS for React Native)
- **UI组件**: 自定义组件系统（基于 CVA）
- **存储**: AsyncStorage + MMKV
- **音频**: react-native-audio-recorder-player
- **共享包**: @ai-education/shared-frontend

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── ui/            # 基础 UI 组件
│   ├── business/      # 业务组件
│   └── guards/        # 路由守卫
├── screens/           # 页面组件
│   ├── Login/         # 登录页
│   ├── Home/          # 首页
│   ├── Practice/      # 练习相关页面
│   ├── Profile/       # 个人中心
│   └── WrongRecords/  # 错题记录
├── navigation/        # 导航配置
├── stores/            # Zustand stores
├── hooks/             # 自定义 Hooks
├── lib/               # 工具库
└── types/             # TypeScript 类型定义
```

## 开发

### 安装依赖

```bash
cd apps/student-app
pnpm install
```

### iOS 开发

```bash
cd ios
pod install
cd ..
pnpm ios
```

### Android 开发

```bash
pnpm android
```

### 启动 Metro

```bash
pnpm start
```

## 构建

### iOS

```bash
pnpm ios --configuration Release
```

### Android

```bash
cd android
./gradlew assembleRelease
```

## 环境配置

在 `src/lib/api.ts` 中配置 API 基础 URL：

```typescript
const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'ios' 
    ? 'http://localhost:7890/api/student'
    : 'http://10.0.2.2:7890/api/student'
  : 'https://your-api-url.com/api/student';
```

## 功能特性

- ✅ 用户认证（登录/登出）
- ✅ 首页导航
- ✅ 个人中心
- ✅ 基础练习页面框架
- ✅ 音频录制和播放
- ✅ 主题系统
- ✅ 路由守卫

## 待完善功能

- 练习会话完整实现
- 音频上传和 AI 分析
- 练习历史详情
- 错题记录功能
- 设置页面

## 注意事项

1. 确保已安装 React Native 开发环境
2. iOS 需要 Xcode 和 CocoaPods
3. Android 需要 Android Studio 和 JDK
4. 音频功能需要麦克风权限

