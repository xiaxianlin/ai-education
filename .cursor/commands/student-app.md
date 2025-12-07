# 学生端移动应用开发模式 (@student-app)

我现在专注于**学生端移动应用 (student-app)** 的开发工作。

## 应用概述

学生端移动应用是一个基于 Flutter 3.0+ 的跨平台移动应用，为学生提供学习、练习、评测等功能，与 Web 端（student-web）保持功能一致性。

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
  - `screens/` - 功能模块（按功能划分）
    - `auth/` - 认证模块
      - `domain/` - 领域服务
      - `presentation/` - UI 层（pages, widgets）
      - `providers/` - 状态管理
    - `home/` - 首页模块
      - `presentation/` - UI 层（pages, widgets）
    - `practice/` - 练习模块
      - `daily/` - 每日练习（data, presentation, providers）
      - `unit/` - 单元练习（data, presentation, providers）
      - `session/` - 练习会话（data, presentation, providers）
      - `report/` - 练习报告（presentation, providers）
      - `history/` - 练习历史（presentation, providers）
      - `detail/` - 练习详情（presentation, providers）
      - `assessment/` - 评估测试（data, presentation, providers）
    - `profile/` - 个人中心模块
      - `presentation/` - UI 层（pages）
      - `providers/` - 状态管理
    - `textbook/` - 教材模块
      - `data/` - 数据层（repository）
      - `presentation/` - UI 层（pages, widgets）
      - `providers/` - 状态管理
    - `wrong_records/` - 错题记录模块
      - `data/` - 数据层（repository）
      - `presentation/` - UI 层（pages, widgets）
      - `providers/` - 状态管理
  - `core/` - 核心功能
    - `api/` - API 客户端
      - `api_client.dart` - API 客户端主类
      - `endpoints/` - API 端点定义
      - `interceptors/` - 拦截器（认证、错误、重试）
    - `models/` - 数据模型（使用 json_serializable，生成 .g.dart 文件）
    - `constants/` - 常量定义
    - `theme/` - 主题配置
    - `utils/` - 工具类（错误处理、格式化、导航、存储等）
  - `shared/` - 共享组件和工具
    - `widgets/` - 共享 Widget
      - `animations/` - 动画组件
      - 其他通用组件（loading, error, empty state 等）
  - `app/` - 应用配置
    - `router.dart` - GoRouter 路由配置
  - `main.dart` - 应用入口

## 开发原则

1. **跨平台一致性**: 参考 Web 端（student-web）的实现逻辑
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

### 开发流程

1. **安装依赖**: `flutter pub get`
2. **生成代码**: `./build.sh` 或使用 build_runner
3. **运行应用**: `flutter run`
4. **代码检查**: `flutter analyze`
5. **格式化代码**: `flutter format .`

### 项目结构说明

- **功能模块化**: 每个功能模块（screens/）包含：
  - `data/`（可选）- 数据层，包含 Repository
  - `presentation/` - UI 层，包含 pages/ 和 widgets/
  - `providers/` - 状态管理，使用 Riverpod
  - `domain/`（可选）- 领域服务层
- **核心功能**: API 客户端、数据模型、主题、工具类集中在 `core/` 目录
- **共享组件**: 可复用的 UI 组件和工具放在 `shared/widgets/` 目录
- **路由配置**: 使用 GoRouter，配置在 `app/router.dart`

### 常用开发模式

#### Riverpod Provider
```dart
// providers/example_provider.dart
final exampleProvider = StateNotifierProvider<ExampleNotifier, ExampleState>((ref) {
  return ExampleNotifier(ref);
});

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

#### API 调用
```dart
// 使用 ApiClient
final response = await ApiClient.instance.get('/endpoint');
// 或使用 Repository
final repository = ref.read(exampleRepositoryProvider);
final data = await repository.fetchData();
```

#### 路由导航
```dart
// 使用 GoRouter
context.go('/path');
context.push('/path');
context.pop();
```

### 与 Web 端对齐

- 保持 API 接口一致（使用相同的 endpoints）
- 保持业务逻辑一致（参考 student-web 的实现）
- 保持用户体验一致（在移动端适配，使用 Material Design）
- 数据模型保持一致（确保 API 响应结构一致）

### API 配置

默认 API 基础 URL: `http://127.0.0.1:7890`

可以通过环境变量配置：
```bash
flutter run --dart-define=API_BASE_URL=http://your-api-url
```

### 开发命令

```bash
# 安装依赖
cd apps/student-app
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

### 常见问题

1. **编译错误：找不到 `_$*FromJson` 或 `_$*ToJson` 方法**
   - 解决：运行 `./build.sh` 或 `flutter pub run build_runner build --delete-conflicting-outputs`

2. **Provider 未找到错误**
   - 检查是否在 `ProviderScope` 内使用
   - 检查 provider 是否正确导入

3. **路由跳转失败**
   - 检查路由是否在 `app/router.dart` 中定义
   - 检查认证状态（某些路由需要登录）
