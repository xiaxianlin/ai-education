# 快速开始指南

## 解决 "Target of URI hasn't been generated" 错误

如果你看到类似以下错误：
```
Target of URI hasn't been generated: 'package:mobile/core/models/upload_recording_result.g.dart'.
```

**这是正常的！** 这些 `.g.dart` 文件需要通过 `build_runner` 自动生成。

## 解决步骤

### 1. 确保 Flutter 已安装

```bash
flutter --version
```

如果命令不存在，请先安装 Flutter：https://flutter.dev/docs/get-started/install

### 2. 安装依赖

```bash
cd mobile
flutter pub get
```

### 3. 生成代码（重要！）

运行以下命令生成所有 `.g.dart` 文件：

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

或者使用提供的脚本：

```bash
./build.sh
```

### 4. 验证

运行后，你应该会在 `lib/core/models/` 目录下看到所有 `.g.dart` 文件：
- `student.g.dart`
- `textbook.g.dart`
- `unit.g.dart`
- `knowledge.g.dart`
- `question.g.dart`
- `practice_session.g.dart`
- `practice_answer.g.dart`
- `practice_report.g.dart`
- `practice_wrong_record.g.dart`
- `submit_answer_params.g.dart`
- `submit_answer_response.g.dart`
- `upload_recording_result.g.dart`

## 开发模式

在开发过程中，可以使用 watch 模式自动生成代码：

```bash
flutter pub run build_runner watch --delete-conflicting-outputs
```

这样当你修改模型文件时，代码会自动重新生成。

## 常见问题

### Q: 为什么需要生成这些文件？
A: 项目使用了 `json_serializable` 包来自动生成 JSON 序列化/反序列化代码，这样可以减少样板代码并确保类型安全。

### Q: 每次修改模型后都需要运行吗？
A: 是的，每次修改带有 `@JsonSerializable()` 注解的模型后，都需要重新运行 `build_runner`。使用 watch 模式可以自动处理。

### Q: 可以提交 `.g.dart` 文件到 Git 吗？
A: 可以，但通常建议将它们添加到 `.gitignore`。不过为了团队协作，也可以提交它们。

