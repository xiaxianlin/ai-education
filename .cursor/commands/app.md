# 移动端开发模式 (@app)

我现在专注于**移动端 (student-app)** 的开发工作。

## 应用概述

移动端是一个基于 React Native 0.73 的跨平台移动应用，为学生提供学习、练习、评测等功能，与 Web 端（student-web）保持功能一致性。

## 技术栈

- **框架**: React Native 0.73
- **语言**: TypeScript 5
- **状态管理**: Zustand
- **路由**: React Navigation (Stack Navigator + Bottom Tabs Navigator)
- **网络请求**: Axios + React Query (@tanstack/react-query)
- **样式**: NativeWind 4.0 (Tailwind CSS for React Native)
- **本地存储**: AsyncStorage, MMKV
- **UI 组件**: Lucide React Native + 自定义组件
- **表单**: React Hook Form + Zod
- **动画**: React Native Reanimated
- **图片**: React Native Fast Image
- **音频**: React Native Audio Recorder Player
- **权限**: React Native Permissions

## 工作目录

- `apps/student-app/` - React Native 移动端源代码
  - `src/screens/` - 页面组件
  - `src/components/` - UI 组件
  - `src/navigation/` - 路由配置
  - `src/stores/` - Zustand 状态管理
  - `src/hooks/` - 自定义 Hooks
  - `src/lib/` - 工具库和 API 客户端

## 项目结构

```
apps/student-app/src/
├── screens/                  # 页面组件
│   ├── Home/                # 首页
│   ├── Practice/            # 练习相关页面
│   └── ...
├── components/               # UI 组件
│   ├── ui/                  # 基础 UI 组件
│   └── business/            # 业务组件
├── navigation/               # 路由配置
│   ├── RootNavigator.tsx    # 根导航器
│   └── ...
├── stores/                   # Zustand 状态管理
│   ├── auth-store.ts        # 认证状态
│   └── ...
├── hooks/                    # 自定义 Hooks
├── lib/                      # 工具库
│   ├── api.ts               # API 客户端
│   └── ...
└── types/                    # TypeScript 类型定义
```

## 开发原则

1. **组件化**: 创建可复用的 React Native 组件
2. **类型安全**: 充分利用 TypeScript 类型系统
3. **性能优先**: 优化渲染性能，避免不必要的重渲染
4. **用户体验**: 流畅的动画（60 FPS），友好的加载和错误状态
5. **代码规范**: 遵循项目现有的代码风格和结构
6. **跨平台一致性**: 参考 Web 端（student-web）的实现逻辑，保持功能一致性
7. **原生体验**: 使用原生组件和 API，提供原生体验

## 常用模式

### 组件结构
```tsx
// src/screens/Home/index.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useSomeStore } from '@/stores';

export default function HomeScreen() {
  const { data, loading } = useSomeStore();
  
  return (
    <View className="flex-1">
      <Text>Home</Text>
    </View>
  );
}
```

### 状态管理 (Zustand)
```tsx
// src/stores/some-store.ts
import { create } from 'zustand';

interface SomeStore {
  data: DataType[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

export const useSomeStore = create<SomeStore>((set) => ({
  data: [],
  loading: false,
  fetchData: async () => {
    set({ loading: true });
    try {
      const result = await api.get('/endpoint');
      set({ data: result, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
}));
```

### API 调用 (React Query)
```tsx
// 使用 React Query
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function SomeComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['someData'],
    queryFn: async () => {
      const response = await api.get('/endpoint');
      return response.data;
    },
  });
  
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return <Content data={data} />;
}
```

### 路由配置 (React Navigation)
```tsx
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '@/screens/Home';

const Stack = createStackNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 样式 (NativeWind)
```tsx
import { View, Text } from 'react-native';

// 使用 Tailwind CSS 类名
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-gray-900">
    Hello World
  </Text>
</View>
```

### 表单处理 (React Hook Form + Zod)
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

function FormComponent() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <View>
      {/* 表单字段 */}
      <Button onPress={handleSubmit(onSubmit)}>Submit</Button>
    </View>
  );
}
```

## 性能优化技巧

1. **使用 React.memo**: 避免不必要的组件重渲染
```tsx
export default React.memo(SomeComponent);
```

2. **FlatList 优化**: 处理长列表
```tsx
<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={(item) => item.id.toString()}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
/>
```

3. **图片优化**: 使用 Fast Image
```tsx
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: imageUrl }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
/>
```

4. **避免内联函数**: 使用 useCallback
```tsx
const handlePress = useCallback(() => {
  // handle logic
}, [dependencies]);
```

## 平台特定处理

### iOS vs Android
```tsx
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
});
```

### 安全区域处理
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  {/* 内容 */}
</SafeAreaView>
```

## 注意事项

- 遵循项目既定的代码结构和命名规范
- **参考 Web 端（student-web）的实现逻辑，保持功能一致性**
- 保持与后端 API (`server-api/student/`) 的一致性
- 使用 NativeWind 进行样式管理，保持与 Web 端样式一致
- 处理平台特定问题（iOS/Android 差异）
- 实现适当的错误处理和加载状态
- 优化渲染性能，避免不必要的 rebuild
- 使用 React Query 进行数据缓存和同步
- 注意内存管理，及时释放资源
- 测试不同屏幕尺寸和设备的适配

## 常用命令

```bash
cd apps/student-app

# 安装依赖
pnpm install

# 启动 Metro bundler
pnpm start

# 运行 Android 应用
pnpm android

# 运行 iOS 应用
pnpm ios

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 相关资源

- Web 端参考: `apps/student-web/src/`（保持逻辑一致性）
- 后端 API: `apps/server-api/student/routes/`
- React Native 文档: https://reactnative.dev/
- React Navigation 文档: https://reactnavigation.org/
- NativeWind 文档: https://www.nativewind.dev/
- React Query 文档: https://tanstack.com/query/latest
