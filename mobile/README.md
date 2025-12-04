# AI Education Platform - Mobile App

Flutter 移动端应用

## 环境要求

- Flutter SDK 3.0.0 或更高版本
- Dart SDK 3.0.0 或更高版本

## 安装依赖

```bash
cd mobile
flutter pub get
```

## 生成代码

**重要**: 项目使用了 `json_serializable` 来生成 JSON 序列化代码。在首次运行或修改模型后，**必须**运行以下命令生成 `.g.dart` 文件，否则会出现编译错误。

### 方法 1: 使用脚本（推荐）

```bash
./build.sh
```

### 方法 2: 手动运行

```bash
# 1. 安装依赖
flutter pub get

# 2. 生成代码
flutter pub run build_runner build --delete-conflicting-outputs
```

### 方法 3: Watch 模式（开发时推荐）

在开发过程中，可以使用 watch 模式自动生成代码：

```bash
flutter pub run build_runner watch --delete-conflicting-outputs
```

### 常见错误

如果遇到 `_$*FromJson` 或 `_$*ToJson` 方法未定义的错误，说明还没有运行 `build_runner`。请按照上述步骤生成代码。

## 运行应用

```bash
flutter run
```

## 项目结构

参考 `docs/FLUTTER_DEVELOPMENT_PLAN.md` 中的详细说明。

## 开发说明

### API 基础 URL 配置

默认使用 `http://127.0.0.1:7890`，可以通过环境变量配置：

```bash
flutter run --dart-define=API_BASE_URL=http://your-api-url
```

### 代码规范

项目使用 `flutter_lints` 进行代码检查：

```bash
flutter analyze
```

格式化代码：

```bash
flutter format .
```

