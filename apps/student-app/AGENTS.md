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

## 项目结构

```
lib/
├── app/                          # 应用配置
│   └── router.dart              # GoRouter 路由配置
├── core/                         # 核心功能
│   ├── api/                     # API 层
│   │   ├── api_client.dart      # Dio 客户端封装
│   │   ├── endpoints/           # API 端点定义
│   │   └── interceptors/        # 请求拦截器
│   ├── constants/               # 常量定义
│   ├── models/                  # 数据模型 (需要代码生成)
│   ├── theme/                   # 主题配置
│   └── utils/                   # 工具类
├── screens/                      # 功能模块
│   ├── auth/                    # 认证模块
│   ├── home/                    # 首页
│   ├── practice/                # 练习模块
│   ├── profile/                 # 个人中心
│   ├── textbook/                # 教材模块
│   └── wrong_records/           # 错题记录
├── shared/                       # 共享组件
│   └── widgets/                 # 通用 Widget
└── main.dart                     # 应用入口
```

## 功能模块

### 认证模块 (auth)
- **登录页**: `presentation/pages/login_page.dart`
- **状态管理**: `providers/auth_provider.dart`
- **服务层**: `domain/auth_service.dart`

### 首页 (home)
- **首页**: `presentation/pages/home_page.dart`
- **组件**: WelcomeCard, QuickActions, PracticeCard
- **状态管理**: `providers/practice_list_provider.dart`

### 练习模块 (practice)
采用 Clean Architecture 风格组织：

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| daily | 日常练习 | `daily_practice_provider.dart`, `daily_practice_repository.dart` |
| unit | 单元练习 | `unit_practice_provider.dart`, `unit_practice_repository.dart` |
| assessment | 综合评估 | `assessment_provider.dart`, `assessment_repository.dart` |
| session | 练习会话 | `session_provider.dart`, `practice_repository.dart` |
| detail | 练习详情 | `detail_provider.dart` |
| report | 练习报告 | `report_provider.dart` |
| history | 练习历史 | `history_provider.dart` |

每个子模块结构：
```
[module]/
├── data/
│   └── [module]_repository.dart    # 数据仓库
├── presentation/
│   ├── pages/                      # 页面
│   └── widgets/                    # 组件
└── providers/
    └── [module]_provider.dart      # Riverpod Provider
```

### 教材模块 (textbook)
- **教材列表**: `presentation/pages/textbook_list_page.dart`
- **单元列表**: `presentation/pages/unit_list_page.dart`
- **状态管理**: `providers/textbook_provider.dart`
- **数据仓库**: `data/textbook_repository.dart`

### 个人中心 (profile)
- **个人页**: `presentation/pages/profile_page.dart`
- **状态管理**: `providers/profile_provider.dart`

### 错题记录 (wrong_records)
- **错题列表**: `presentation/pages/wrong_records_page.dart`
- **状态管理**: `providers/wrong_records_provider.dart`
- **数据仓库**: `data/wrong_records_repository.dart`

## 核心模块

### API 端点 (core/api/endpoints)
| 文件 | 说明 |
|------|------|
| `auth_endpoints.dart` | 认证 API |
| `practice_endpoints.dart` | 练习 API |
| `textbook_endpoints.dart` | 教材 API |
| `profile_endpoints.dart` | 个人信息 API |
| `wrong_records_endpoints.dart` | 错题 API |

### 数据模型 (core/models)
| 模型 | 说明 |
|------|------|
| `student.dart` | 学生信息 |
| `textbook.dart` | 教材 |
| `unit.dart` | 单元 |
| `knowledge.dart` | 知识点 |
| `question.dart` | 题目 |
| `practice_session.dart` | 练习会话 |
| `practice_answer.dart` | 答题记录 |
| `practice_report.dart` | 练习报告 |
| `practice_wrong_record.dart` | 错题记录 |
| `wrong_question_summary.dart` | 错题汇总 |

### 共享组件 (shared/widgets)
| 组件 | 说明 |
|------|------|
| `main_layout.dart` | 主布局 |
| `loading_indicator.dart` | 加载指示器 |
| `empty_state.dart` | 空状态 |
| `error_widget.dart` | 错误组件 |
| `error_boundary.dart` | 错误边界 |
| `error_snackbar.dart` | 错误提示 |
| `skeleton_loader.dart` | 骨架屏 |
| `paginated_list.dart` | 分页列表 |
| `custom_refresh_indicator.dart` | 下拉刷新 |
| `animations/` | 动画组件（FadeIn, Scale, Slide, Staggered） |

## 开发原则

### Flutter 最佳实践
1. 使用 StatelessWidget/StatefulWidget 合理分离
2. 使用 Riverpod 进行状态管理
3. 优化性能和内存使用
4. 遵循 Flutter 代码规范

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
1. **API 接口一致**: 使用相同的 endpoints，确保路径和参数一致
2. **业务逻辑一致**: 参考 student-web 的实现，保持功能逻辑一致
3. **用户体验一致**: 在移动端适配，使用 Material Design，但保持交互流程一致
4. **数据模型一致**: 确保 API 响应结构一致，模型字段与后端 Schema 对应
5. **错误处理一致**: 使用相同的错误处理机制和提示信息

## 开发流程

1. **安装依赖**: `flutter pub get`
2. **生成代码**: `./build.sh`
3. **运行应用**: `flutter run`
4. **代码检查**: `flutter analyze`
5. **格式化**: `dart format .`

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
- Riverpod 文档: `https://riverpod.dev/`
