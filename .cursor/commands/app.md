# 移动端开发模式 (@app)

我现在专注于**移动端 (student-app)** 的开发工作。

> **📋 详细规范**: 查看 `.cursor/rules/flutter-mobile/` 获取完整的 Flutter 移动端编码规范。规则会在编辑 `apps/student-app/**` 文件时自动应用。

## 应用概述

移动端是一个基于 Flutter 3.0+ 的跨平台移动应用，为学生提供学习、练习、评测等功能，与 Web 端（student-web）保持功能一致性。

## 技术栈

- **框架**: Flutter 3.0+ (Dart SDK >=3.8.0)
- **语言**: Dart 3.8+
- **状态管理**: Riverpod 3.0.3 (flutter_riverpod, hooks_riverpod, flutter_hooks)
- **路由**: GoRouter 17.0
- **网络请求**: Dio 5.4.0
- **本地存储**: SharedPreferences 2.2.2
- **UI 组件**: Material Design + 自定义组件
- **代码生成**: json_serializable 6.11.2, freezed 3.2.3, build_runner 2.10.4
- **音频录制**: record 6.1.2
- **权限管理**: permission_handler 12.0.1
- **图片缓存**: cached_network_image 3.3.1, flutter_cache_manager 3.3.1
- **工具库**: intl 0.20.2, freezed_annotation 3.1.0, logger 2.6.2
- **代码检查**: flutter_lints 6.0.0

## 工作目录

- `apps/student-app/lib/` - Flutter 源代码
  - `screens/` - 功能模块（auth, home, practice, profile, textbook, wrong_records）
  - `core/` - 核心功能（api, models, theme, utils）
  - `shared/` - 共享组件和工具
  - `app/` - 应用配置（路由等）

## 项目结构

```
apps/student-app/lib/
├── screens/                  # 功能模块
│   ├── auth/                # 认证模块
│   ├── home/                # 首页模块
│   ├── practice/            # 练习模块（daily, unit, session, report, history, detail, assessment）
│   ├── profile/             # 个人中心模块
│   ├── textbook/            # 教材模块
│   └── wrong_records/       # 错题记录模块
├── core/                     # 核心功能
│   ├── api/                 # API 客户端和端点
│   ├── models/              # 数据模型（使用 json_serializable）
│   ├── constants/           # 常量定义
│   ├── theme/               # 主题配置
│   └── utils/               # 工具类
├── shared/                   # 共享组件
│   └── widgets/             # 共享 Widget（animations, loading, error 等）
├── app/                      # 应用配置
│   └── router.dart          # GoRouter 路由配置
└── main.dart                 # 应用入口
```

## 开发原则

1. **跨平台一致性**: 参考 Web 端（student-web）的实现逻辑，保持功能一致性
2. **原生体验**: 使用 Flutter 原生组件和 Material Design
3. **性能优化**: 使用 Riverpod 进行状态管理，优化渲染性能
4. **用户体验**: 流畅的动画和交互，使用自定义动画组件
5. **类型安全**: 充分利用 Dart 的类型系统和代码生成
6. **代码生成**: 使用 build_runner 生成 JSON 序列化代码

## 重要注意事项

### 代码生成

项目使用了 `json_serializable` 和 `freezed` 来生成代码。在首次运行或修改模型后，**必须**运行以下命令：

```bash
cd apps/student-app
./build.sh
# 或
flutter pub run build_runner build --delete-conflicting-outputs
```

## 常用模式

### Widget 结构
```dart
// screens/home/presentation/pages/home_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(someProvider);
    
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: state.when(
        data: (data) => ListView(...),
        loading: () => const CircularProgressIndicator(),
        error: (error, stack) => ErrorWidget(error),
      ),
    );
  }
}
```

### 状态管理 (Riverpod)
```dart
// providers/example_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart';

final exampleProvider = StateNotifierProvider<ExampleNotifier, ExampleState>((ref) {
  return ExampleNotifier(ref);
});

class ExampleState {
  final List<Data> data;
  final bool loading;
  
  ExampleState({required this.data, required this.loading});
  
  ExampleState copyWith({List<Data>? data, bool? loading}) {
    return ExampleState(
      data: data ?? this.data,
      loading: loading ?? this.loading,
    );
  }
}

class ExampleNotifier extends StateNotifier<ExampleState> {
  ExampleNotifier(this.ref) : super(ExampleState(data: [], loading: false));
  final Ref ref;
  
  Future<void> fetchData() async {
    state = state.copyWith(loading: true);
    try {
      final result = await ApiClient.instance.get('/endpoint');
      state = state.copyWith(data: result, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false);
    }
  }
}
```

### API 调用
```dart
// 使用 ApiClient
import 'package:student_app/core/api/api_client.dart';

final response = await ApiClient.instance.get('/endpoint');
final data = response.data;

// 或使用 Repository
final repository = ref.read(exampleRepositoryProvider);
final data = await repository.fetchData();
```

### 路由导航 (GoRouter)
```dart
import 'package:go_router/go_router.dart';

// 导航到新页面
context.go('/path');
context.push('/path');

// 返回上一页
context.pop();

// 带参数导航
context.push('/practice/session', extra: {'sessionId': 123});
```

### 样式 (Material Design)
```dart
import 'package:flutter/material.dart';

// 使用 Material Design 组件
Scaffold(
  appBar: AppBar(
    title: const Text('Title'),
    backgroundColor: Theme.of(context).colorScheme.primary,
  ),
  body: Container(
    padding: const EdgeInsets.all(16),
    child: Column(
      children: [
        Text(
          'Hello World',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
      ],
    ),
  ),
)
```

## 性能优化技巧

1. **使用 const 构造函数**: 减少不必要的重建
```dart
const Text('Static Text');
const SizedBox(height: 16);
```

2. **ListView.builder**: 处理长列表
```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ListTile(title: Text(items[index].name));
  },
)
```

3. **图片缓存**: 使用 cached_network_image
```dart
import 'package:cached_network_image/cached_network_image.dart';

CachedNetworkImage(
  imageUrl: imageUrl,
  placeholder: (context, url) => const CircularProgressIndicator(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
)
```

4. **避免不必要的重建**: 使用 Consumer 和 select
```dart
// 只监听特定状态变化
final count = ref.watch(counterProvider.select((state) => state.count));
```

## 平台特定处理

### iOS vs Android
```dart
import 'dart:io';

if (Platform.isIOS) {
  // iOS 特定代码
} else if (Platform.isAndroid) {
  // Android 特定代码
}
```

### 安全区域处理
```dart
import 'package:flutter/material.dart';

SafeArea(
  child: Scaffold(
    body: Column(
      children: [
        // 内容会自动适配安全区域
      ],
    ),
  ),
)
```

## 注意事项

- **代码生成**: 修改模型后必须运行 `./build.sh` 生成 `.g.dart` 文件
- **参考 Web 端**: 保持与 Web 端（student-web）的实现逻辑一致
- **API 一致性**: 保持与后端 API (`apps/server/student/`) 的一致性
- **错误处理**: 实现适当的错误处理和加载状态
- **性能优化**: 优化渲染性能，避免不必要的 rebuild
- **内存管理**: 注意内存管理，及时释放资源
- **测试适配**: 测试不同屏幕尺寸和设备的适配
- **类型安全**: 充分利用 Dart 的类型系统

## 常用命令

```bash
cd apps/student-app

# 安装依赖
flutter pub get

# 生成代码（必须！）
./build.sh
# 或
flutter pub run build_runner build --delete-conflicting-outputs

# Watch 模式（开发时推荐）
flutter pub run build_runner watch --delete-conflicting-outputs

# 运行应用
flutter run
flutter run -d android  # Android
flutter run -d ios       # iOS

# 代码检查
flutter analyze

# 格式化代码
flutter format .

# 运行测试
flutter test
```

## 常见问题

1. **编译错误：找不到 `_$*FromJson` 或 `_$*ToJson` 方法**
   - 解决：运行 `./build.sh` 或 `flutter pub run build_runner build --delete-conflicting-outputs`

2. **Provider 未找到错误**
   - 检查是否在 `ProviderScope` 内使用
   - 检查 provider 是否正确导入

3. **路由跳转失败**
   - 检查路由是否在 `app/router.dart` 中定义
   - 检查认证状态（某些路由需要登录）

## 快速参考

### 编码规范
详细的 Flutter 移动端编码规范（Dart 规范、Riverpod 状态管理、路由、代码生成）请参考：
- `.cursor/rules/flutter-mobile/` - Flutter 移动端编码规范（自动应用）

### 命名规范
详细的命名规范请参考：
- `.cursor/rules/naming-conventions/` - 命名和文件组织规范（自动应用）

## 相关资源

- Web 端参考: `apps/student-web/src/`（保持逻辑一致性）
- 后端 API: `apps/server/student/routes/`
- API 文档: `.cursor/commands/api.md`
- Flutter 文档: https://flutter.dev/
- Riverpod 文档: https://riverpod.dev/

## 相关规则

- `@flutter-mobile` - Flutter 移动端编码规范（自动应用）
- `@naming-conventions` - 命名规范（自动应用）
- GoRouter 文档: https://pub.dev/packages/go_router
- Material Design: https://material.io/design
