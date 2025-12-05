# 移动端开发模式

我现在专注于**移动端 (mobile/)** 的开发工作。

## 应用概述

移动端是一个基于 Flutter 3.x 的跨平台移动应用，为学生提供学习、练习、评测等功能，与 Web 端（student/）保持功能一致性。

## 技术栈

- **框架**: Flutter 3.x, Dart 3.x
- **状态管理**: Riverpod 2.x, flutter_hooks
- **路由**: go_router
- **网络请求**: dio + 拦截器
- **本地存储**: shared_preferences
- **UI 组件**: Material 3
- **代码生成**: json_serializable, freezed, build_runner
- **音频录制**: record, permission_handler
- **图片加载**: cached_network_image

## 工作目录

- `apps/mobile/` - Flutter 移动端源代码
  - `lib/core/` - 核心功能（API、模型、工具）
  - `lib/features/` - 功能模块
  - `lib/shared/` - 共享组件和工具
  - `lib/app/` - 应用配置（路由等）

## 项目结构

```
apps/mobile/lib/
├── core/                    # 核心功能
│   ├── api/                 # API 客户端和端点
│   ├── models/              # 数据模型
│   ├── constants/           # 常量定义
│   ├── utils/               # 工具函数
│   └── theme/               # 主题配置
├── features/                # 功能模块
│   ├── auth/               # 认证模块
│   ├── profile/            # 个人中心
│   ├── textbook/           # 教材管理
│   ├── practice/           # 练习模块
│   │   ├── daily/          # 每日练习
│   │   ├── unit/           # 单元练习
│   │   ├── assessment/     # 能力评测
│   │   ├── session/        # 练习会话（核心）
│   │   ├── history/        # 练习历史
│   │   ├── detail/         # 练习详情
│   │   ├── report/         # 练习报告
│   │   └── wrong_records/  # 错题本
│   └── ...
├── shared/                  # 共享组件
│   ├── widgets/            # 可复用 Widget
│   └── hooks/              # 自定义 Hooks
└── app/                     # 应用配置
    └── router.dart         # 路由配置
```

## 开发原则

1. **Clean Architecture**: 分层架构，关注点分离（data/domain/presentation）
2. **功能模块化**: 按功能域组织代码，每个功能独立
3. **状态管理**: 使用 Riverpod 管理全局状态，StateNotifier 管理复杂状态
4. **类型安全**: 充分利用 Dart 的类型系统
5. **性能优先**: 使用 const 构造函数，优化 Widget 重建
6. **用户体验**: 流畅的动画（60 FPS），友好的加载和错误状态
7. **代码规范**: 遵循 Dart 官方代码规范
8. **跨平台一致性**: 参考 Web 端（student/）的实现逻辑，保持功能一致性

## 常用模式

### 状态管理 (Riverpod)
```dart
// lib/features/practice/providers/session_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SessionNotifier extends StateNotifier<SessionState> {
  SessionNotifier() : super(SessionState.initial());
  
  void updateAnswer(int questionId, String answer) {
    state = state.copyWith(
      userAnswers: {...state.userAnswers, questionId: answer},
    );
  }
}

final sessionProvider = StateNotifierProvider<SessionNotifier, SessionState>(
  (ref) => SessionNotifier(),
);

// 在 Widget 中使用
class SomeWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionProvider);
    return Text(session.currentQuestion);
  }
}
```

### API 调用
```dart
// lib/core/api/api_client.dart
import 'package:dio/dio.dart';

final apiClient = ApiClient();

Future<Response> fetchData() async {
  try {
    final response = await apiClient.get('/api/student/endpoint');
    return response;
  } catch (e) {
    // 错误处理
    rethrow;
  }
}
```

### 路由配置 (go_router)
```dart
// lib/app/router.dart
import 'package:go_router/go_router.dart';

final router = GoRouter(
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: '/practice/session/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return PracticeSessionPage(sessionId: int.parse(id));
      },
    ),
  ],
);
```

### 数据模型 (json_serializable)
```dart
// lib/core/models/student.dart
import 'package:json_annotation/json_annotation.dart';

part 'student.g.dart';

@JsonSerializable()
class Student {
  final int id;
  final String name;
  final String phone;
  
  Student({
    required this.id,
    required this.name,
    required this.phone,
  });
  
  factory Student.fromJson(Map<String, dynamic> json) => _$StudentFromJson(json);
  Map<String, dynamic> toJson() => _$StudentToJson(this);
}
```

### Widget 组件
```dart
// lib/features/practice/widgets/question_card.dart
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

class QuestionCard extends HookWidget {
  final Question question;
  
  const QuestionCard({required this.question, super.key});
  
  @override
  Widget build(BuildContext context) {
    final isExpanded = useState(false);
    
    return Card(
      child: Column(
        children: [
          Text(question.content),
          // ...
        ],
      ),
    );
  }
}
```

## 性能优化技巧

1. **使用 const 构造函数**: 减少 Widget 重建
```dart
const Text('Hello')  // 而不是 Text('Hello')
```

2. **ListView.builder**: 处理长列表
```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
)
```

3. **RepaintBoundary**: 隔离重绘区域
```dart
RepaintBoundary(
  child: ExpensiveWidget(),
)
```

4. **图片缓存**: 使用 cached_network_image
```dart
CachedNetworkImage(
  imageUrl: imageUrl,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)
```

## 注意事项

- 遵循项目既定的代码结构和命名规范
- **参考 Web 端（student/）的实现逻辑，保持功能一致性**
- 保持与后端 API (`server/student/`) 的一致性
- 遵循 Material 3 设计规范
- 使用 `flutter pub run build_runner build --delete-conflicting-outputs` 生成代码
- 及时释放资源（Controller、Stream），避免内存泄漏
- 处理平台特定问题（iOS/Android 差异）
- 实现适当的错误处理和加载状态
- 优化 Widget 重建次数，避免不必要的 rebuild

## 常用命令

```bash
cd apps/mobile
flutter pub get              # 安装依赖
flutter pub run build_runner build --delete-conflicting-outputs  # 生成代码
flutter run                   # 运行应用
flutter analyze              # 代码分析
flutter format .             # 格式化代码
```

## 相关资源

- Web 端参考: `apps/student/src/`（保持逻辑一致性）
- 后端 API: `apps/server/student/routes/`
- Flutter 文档: https://flutter.dev/
- Riverpod 文档: https://riverpod.dev/
- go_router 文档: https://pub.dev/packages/go_router

