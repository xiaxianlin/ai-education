# 学生端移动应用开发模式 (@student-app)

我现在专注于**学生端移动应用 (student-app)** 的开发工作。

## 应用概述

学生端移动应用是一个基于 Flutter 3.0+ 的跨平台移动应用，为学生提供学习、练习、评测等功能，与 Web 端（student-web）保持功能一致性。

## 技术栈

- **框架**: Flutter 3.0+ (Dart SDK >=3.0.0)
- **语言**: Dart 3.0+
- **状态管理**: Riverpod 3.0 (flutter_riverpod, hooks_riverpod)
- **路由**: GoRouter 17.0
- **网络请求**: Dio 5.4.0
- **本地存储**: SharedPreferences 2.2.2
- **UI 组件**: Material Design + 自定义组件
- **代码生成**: json_serializable, freezed, build_runner
- **音频录制**: record 6.1.2
- **权限管理**: permission_handler 12.0.1
- **图片缓存**: cached_network_image, flutter_cache_manager
- **工具库**: intl, freezed_annotation

## 工作目录

- `apps/student-app/lib/` - Flutter 源代码
  - `features/` - 功能模块
    - `auth/` - 认证模块
    - `home/` - 首页模块
    - `practice/` - 练习模块（daily, unit, session, report, history, detail, assessment）
    - `profile/` - 个人中心模块
    - `textbook/` - 教材模块
    - `wrong_records/` - 错题记录模块
  - `core/` - 核心功能
    - `api/` - API 客户端和端点
    - `models/` - 数据模型（使用 json_serializable）
    - `theme/` - 主题配置
    - `utils/` - 工具类
  - `shared/` - 共享组件和工具
  - `app/` - 应用配置（路由等）

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

- **功能模块化**: 每个功能模块包含 `data/`（数据层）、`presentation/`（UI层）、`providers/`（状态管理）
- **核心功能**: API 客户端、数据模型、主题、工具类集中在 `core/` 目录
- **共享组件**: 可复用的 UI 组件和工具放在 `shared/` 目录

### 与 Web 端对齐

- 保持 API 接口一致
- 保持业务逻辑一致
- 保持用户体验一致（在移动端适配）
