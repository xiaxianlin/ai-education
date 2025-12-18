# 学生端移动应用 - Agent 配置

## 应用概述
基于 Flutter 3.0+ 的跨平台移动应用，为学生提供学习、练习、评测等功能。

## 技术栈
- **框架**: Flutter 3.0+ (Dart SDK >=3.8.0)
- **语言**: Dart 3.8+
- **状态管理**: Riverpod 3.0.3
- **路由**: GoRouter 17.0
- **网络请求**: Dio 5.4.0
- **本地存储**: SharedPreferences 2.2.2
- **UI**: Material Design + 自定义组件
- **代码生成**: json_serializable, freezed, build_runner

## 开发原则

### Flutter 最佳实践
1. 使用函数式组件和 StatefulWidget/StatelessWidget
2. 使用 Riverpod 进行状态管理
3. 优化性能和内存使用
4. 遵循 Flutter 代码规范

### 项目结构
```
lib/
├── screens/              # 功能模块
│   ├── auth/           # 认证模块
│   ├── home/           # 首页
│   ├── practice/       # 练习模块
│   ├── profile/        # 个人中心
│   ├── textbook/       # 教材模块
│   └── wrong_records/  # 错题记录
├── core/               # 核心功能
│   ├── api/           # API 客户端
│   ├── models/        # 数据模型
│   ├── theme/         # 主题配置
│   └── utils/         # 工具类
├── shared/            # 共享组件
│   └── widgets/       # 共享 Widget
└── app/               # 应用配置
    └── router.dart    # 路由配置
```

### 状态管理 (Riverpod)
```dart
// Provider 定义
final exampleProvider = StateNotifierProvider<ExampleNotifier, ExampleState>((ref) {
  return ExampleNotifier(ref);
});

// StateNotifier 实现
class ExampleNotifier extends StateNotifier<ExampleState> {
  ExampleNotifier(this.ref) : super(ExampleState.initial());
  final Ref ref;
  
  Future<void> loadData() async {
    state = state.copyWith(loading: true);
    // 加载数据逻辑
    state = state.copyWith(loading: false, data: result);
  }
}
```

### API 调用
```dart
// 使用 ApiClient
final response = await ApiClient.instance.get('/endpoint');

// 或使用 Repository
final repository = ref.read(exampleRepositoryProvider);
final data = await repository.fetchData();
```

### 路由导航
```dart
// 使用 GoRouter
context.go('/path');
context.push('/path');
context.pop();
```

## 重要注意事项

### 代码生成
**必须**在修改模型后运行代码生成：
```bash
cd apps/student-app
./build.sh
# 或
flutter pub run build_runner build --delete-conflicting-outputs
```

### 与 Web 端对齐
1. 保持 API 接口一致（使用相同的 endpoints）
2. 保持业务逻辑一致（参考 student-web 的实现）
3. 保持用户体验一致（在移动端适配，使用 Material Design）
4. 数据模型保持一致（确保 API 响应结构一致）

## 开发流程

1. **安装依赖**: `flutter pub get`
2. **生成代码**: `./build.sh`
3. **运行应用**: `flutter run`
4. **代码检查**: `flutter analyze`
5. **格式化**: `flutter format .`

## 注意事项

1. **类型安全**: 充分利用 Dart 的类型系统
2. **错误处理**: 所有 API 调用必须有错误处理
3. **性能优化**: 使用 Riverpod 优化状态管理
4. **用户体验**: 流畅的动画和交互
5. **平台适配**: 考虑 iOS 和 Android 的差异

## 相关资源

- 后端 API: `apps/server/student/routes/`
- Web 端参考: `apps/student-web/`
- Flutter 文档: `https://flutter.dev/`
