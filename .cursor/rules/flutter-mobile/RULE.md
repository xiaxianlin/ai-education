---
description: "Flutter 移动端编码规范，包含 Dart 规范、Riverpod 状态管理、路由和代码生成"
globs:
  - "apps/student-app/**"
alwaysApply: false
---

# Flutter 移动端编码规范

## Dart 语言规范

- 使用 Dart 3.8+ 语言特性
- Widget 使用函数式组件和 StatefulWidget/StatelessWidget
- 遵循 Flutter 最佳实践
- 使用 Material Design 进行 UI 设计
- 优化性能和内存使用

## 状态管理 (Riverpod)

使用 Riverpod 进行状态管理：

```dart
// providers/example_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

final exampleProvider = StateNotifierProvider<ExampleNotifier, ExampleState>((ref) {
  return ExampleNotifier(ref);
});

class ExampleNotifier extends StateNotifier<ExampleState> {
  ExampleNotifier(this.ref) : super(ExampleState.initial());
  final Ref ref;
  
  Future<void> loadData() async {
    state = state.copyWith(loading: true);
    try {
      final data = await repository.fetchData();
      state = state.copyWith(loading: false, data: data);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }
}
```

## 路由 (GoRouter)

使用 GoRouter 进行路由管理：

```dart
// app/router.dart
import 'package:go_router/go_router.dart';

final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/practice/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return PracticePage(id: id);
      },
    ),
  ],
);

// 使用路由导航
context.go('/path');
context.push('/path');
context.pop();
```

## 代码生成

项目使用 `json_serializable` 和 `freezed` 进行代码生成。

**重要**: 在首次运行或修改模型后，**必须**运行以下命令：

```bash
cd apps/student-app
./build.sh
# 或
flutter pub run build_runner build --delete-conflicting-outputs
```

### 模型定义示例

```dart
// models/practice_session.dart
import 'package:json_annotation/json_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'practice_session.freezed.dart';
part 'practice_session.g.dart';

@freezed
class PracticeSession with _$PracticeSession {
  const factory PracticeSession({
    required String id,
    required String type,
    required int textbookId,
    int? unitId,
  }) = _PracticeSession;

  factory PracticeSession.fromJson(Map<String, dynamic> json) =>
      _$PracticeSessionFromJson(json);
}
```

## API 调用

使用 Dio 进行网络请求，API 客户端封装在 `core/api/` 目录：

```dart
// 使用 ApiClient
import 'package:student_app/core/api/api_client.dart';

final response = await ApiClient.instance.get('/api/student/practice/list');
final data = PracticeSession.fromJson(response.data);

// 或使用 Repository（推荐）
final repository = ref.read(practiceRepositoryProvider);
final data = await repository.fetchPracticeList();
```

**API 端点定义**: `core/api/endpoints/` 目录
- `auth_endpoints.dart`: 认证 API
- `practice_endpoints.dart`: 练习 API
- `textbook_endpoints.dart`: 教材 API
- `profile_endpoints.dart`: 个人信息 API
- `wrong_records_endpoints.dart`: 错题 API

**与 Web 端对齐**:
- 使用相同的 API 端点路径
- 保持 API 响应结构一致
- 确保数据模型与后端 Schema 一致

## 项目结构

```
lib/
├── app/                  # 应用配置
│   └── router.dart      # GoRouter 路由配置
├── screens/              # 功能模块
│   ├── auth/            # 认证模块
│   ├── home/            # 首页
│   ├── practice/        # 练习模块
│   │   ├── data/        # 数据层（repository）
│   │   ├── presentation/ # UI 层（pages, widgets）
│   │   └── providers/   # 状态管理
│   ├── profile/         # 个人中心
│   ├── textbook/        # 教材模块
│   └── wrong_records/   # 错题记录
├── core/                 # 核心功能
│   ├── api/             # API 客户端
│   │   ├── api_client.dart      # Dio 客户端封装
│   │   ├── endpoints/           # API 端点定义
│   │   └── interceptors/         # 请求拦截器
│   ├── constants/       # 常量定义
│   ├── models/          # 数据模型（需要代码生成）
│   ├── theme/           # 主题配置
│   └── utils/           # 工具类
└── shared/              # 共享组件
    └── widgets/         # 共享 Widget
```

## 开发流程

1. **安装依赖**: `flutter pub get`
2. **生成代码**: `./build.sh`（修改模型后必须运行）
   - 或手动运行: `flutter pub run build_runner build --delete-conflicting-outputs`
3. **运行应用**: `flutter run`
   - Android: `flutter run -d android`
   - iOS: `flutter run -d ios`
4. **代码检查**: `flutter analyze`
5. **格式化代码**: `dart format .`

**重要**: 修改模型后必须运行 `./build.sh` 生成代码，否则会出现编译错误。

## 与 Web 端对齐

- 保持 API 接口一致（使用相同的 endpoints）
- 保持业务逻辑一致（参考 student-web 的实现）
- 保持用户体验一致（在移动端适配，使用 Material Design）
- 数据模型保持一致（确保 API 响应结构一致）

## 性能优化

- 使用 `const` 构造函数
- 使用 `ListView.builder` 处理长列表
- 使用图片缓存（cached_network_image）
- 避免不必要的重建（使用 `Consumer` 和 `select`）

## 注意事项

1. **代码生成**: 修改模型后必须运行 `./build.sh`
2. **Provider 作用域**: 确保在 `ProviderScope` 内使用 Provider
3. **路由配置**: 路由必须在 `app/router.dart` 中定义
4. **类型安全**: 充分利用 Dart 的类型系统
