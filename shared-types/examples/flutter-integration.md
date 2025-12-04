# Flutter 集成指南

## 1. 集成步骤

### 1.1 复制生成的 Dart 文件

```bash
# 在项目根目录执行
cd mobile

# 创建共享类型目录
mkdir -p lib/core/shared_types

# 复制生成的 Dart 文件
cp -r ../shared-types/build/dart/* lib/core/shared_types/

# 或者使用脚本自动化
../scripts/sync-flutter-types.sh
```

### 1.2 添加依赖

在 `pubspec.yaml` 中添加必要的依赖：

```yaml
dependencies:
  flutter:
    sdk: flutter

  # JSON 序列化支持
  json_annotation: ^4.8.1

dev_dependencies:
  flutter_test:
    sdk: flutter

  # JSON 序列化代码生成
  json_serializable: ^6.7.1
  build_runner: ^2.4.7

  # 代码生成
  build_runner: ^2.4.7
```

### 1.3 生成序列化代码

```bash
cd mobile
flutter pub get

# 生成 JSON 序列化代码
flutter packages pub run build_runner build --delete-conflicting-outputs

# 或者开启 watch 模式（开发时推荐）
flutter packages pub run build_runner watch --delete-conflicting-outputs
```

## 2. 使用示例

### 2.1 导入共享类型

```dart
// lib/core/shared_types/imports.dart
export 'enums.dart';
export 'models.dart';
export 'shared_types.dart';

// 或者直接使用
import 'package:your_project_name/core/shared_types/imports.dart';
```

### 2.2 在 Service 层使用

```dart
// lib/services/student_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:your_project_name/core/shared_types/imports.dart';

class StudentService {
  final String baseUrl = 'http://localhost:7890/api/student';

  Future<Student> login({
    required String phone,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'phone': phone,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return Student.fromJson(data['data']);
    } else {
      throw Exception('Login failed');
    }
  }

  Future<PracticeSession> createPractice({
    required PracticeType type,
    required int textbookId,
    int? unitId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/practices'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'type': type.value,
        'textbook_id': textbookId,
        if (unitId != null) 'unit_id': unitId,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return PracticeSession.fromJson(data['data']);
    } else {
      throw Exception('Failed to create practice');
    }
  }

  Future<SubmitAnswerResponse> submitAnswer({
    required int sessionId,
    required int questionId,
    required String answer,
    required int timeSpent,
    bool isAudioAnswer = false,
    String? audioData,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/practices/answer'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'session_id': sessionId,
        'question_id': questionId,
        'answer': answer,
        'time_spent': timeSpent,
        'is_audio_answer': isAudioAnswer,
        if (audioData != null) 'audio_data': audioData,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return SubmitAnswerResponse.fromJson(data['data']);
    } else {
      throw Exception('Failed to submit answer');
    }
  }
}
```

### 2.3 在 UI 层使用

```dart
// lib/screens/practice_screen.dart
import 'package:flutter/material.dart';
import 'package:your_project_name/core/shared_types/imports.dart';
import 'package:your_project_name/services/student_service.dart';

class PracticeScreen extends StatefulWidget {
  final PracticeSession practiceSession;

  const PracticeScreen({
    Key? key,
    required this.practiceSession,
  }) : super(key: key);

  @override
  _PracticeScreenState createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> {
  final StudentService _studentService = StudentService();
  Question? _currentQuestion;
  List<Question> _questions = [];
  int _currentQuestionIndex = 0;
  String? _selectedAnswer;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  Future<void> _loadQuestions() async {
    try {
      // 加载题目逻辑
      setState(() {
        // 假设从 practiceSession 中获取题目
        _currentQuestion = _questions[_currentQuestionIndex];
      });
    } catch (e) {
      _showErrorDialog('加载题目失败: $e');
    }
  }

  Future<void> _submitAnswer() async {
    if (_selectedAnswer == null || _currentQuestion == null) return;

    try {
      final response = await _studentService.submitAnswer(
        sessionId: widget.practiceSession.id,
        questionId: _currentQuestion!.id,
        answer: _selectedAnswer!,
        timeSpent: 30, // 假设答题时间为30秒
      );

      _showAnswerResult(response);

      // 加载下一题
      if (_currentQuestionIndex < _questions.length - 1) {
        setState(() {
          _currentQuestionIndex++;
          _currentQuestion = _questions[_currentQuestionIndex];
          _selectedAnswer = null;
        });
      } else {
        _showCompletionDialog();
      }
    } catch (e) {
      _showErrorDialog('提交答案失败: $e');
    }
  }

  void _showAnswerResult(SubmitAnswerResponse response) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(response.isCorrect ? '答对了！' : '答错了'),
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('你的答案: ${response.userAnswer}'),
            Text('正确答案: ${response.correctAnswer}'),
            if (response.analysis != null) Text('解析: ${response.analysis}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('继续'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_currentQuestion == null) {
      return Scaffold(
        appBar: AppBar(title: Text('练习中')),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('练习 - 第${_currentQuestionIndex + 1}题'),
        actions: [
          Text(
            '进度: ${_currentQuestionIndex + 1}/${_questions.length}',
            style: TextStyle(fontSize: 16),
          ),
          SizedBox(width: 16),
        ],
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 题目内容
            Card(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  _currentQuestion!.content,
                  style: TextStyle(fontSize: 18),
                ),
              ),
            ),

            SizedBox(height: 20),

            // 选项
            if (_currentQuestion!.options != null) ...[
              ..._currentQuestion!.options!.map((option) {
                final isSelected = _selectedAnswer == option;
                final isCorrect = option == _currentQuestion!.answer;

                return RadioListTile<String>(
                  title: Text(option),
                  value: option,
                  groupValue: _selectedAnswer,
                  onChanged: (value) {
                    setState(() {
                      _selectedAnswer = value;
                    });
                  },
                  tileColor: isSelected
                      ? (isCorrect ? Colors.green.shade50 : Colors.red.shade50)
                      : null,
                );
              }).toList(),
            ],

            SizedBox(height: 20),

            // 提交按钮
            ElevatedButton(
              onPressed: _selectedAnswer != null ? _submitAnswer : null,
              child: Text('提交答案'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('错误'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('确定'),
          ),
        ],
      ),
    );
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text('练习完成'),
        content: Text('恭喜你完成了本次练习！'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop(); // 返回上一页
            },
            child: Text('完成'),
          ),
        ],
      ),
    );
  }
}
```

### 2.4 状态管理集成（Riverpod 示例）

```dart
// lib/providers/practice_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:your_project_name/core/shared_types/imports.dart';
import 'package:your_project_name/services/student_service.dart';

final studentServiceProvider = Provider((ref) => StudentService());

final practiceStateProvider = StateNotifierProvider<PracticeStateNotifier, PracticeState>((ref) {
  return PracticeStateNotifier(ref.read(studentServiceProvider));
});

class PracticeState {
  final bool isLoading;
  final String? error;
  final PracticeSession? currentSession;
  final Question? currentQuestion;
  final List<Question> questions;
  final int currentQuestionIndex;
  final SubmitAnswerResponse? lastAnswerResponse;

  PracticeState({
    this.isLoading = false,
    this.error,
    this.currentSession,
    this.currentQuestion,
    this.questions = const [],
    this.currentQuestionIndex = 0,
    this.lastAnswerResponse,
  });

  PracticeState copyWith({
    bool? isLoading,
    String? error,
    PracticeSession? currentSession,
    Question? currentQuestion,
    List<Question>? questions,
    int? currentQuestionIndex,
    SubmitAnswerResponse? lastAnswerResponse,
  }) {
    return PracticeState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      currentSession: currentSession ?? this.currentSession,
      currentQuestion: currentQuestion ?? this.currentQuestion,
      questions: questions ?? this.questions,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      lastAnswerResponse: lastAnswerResponse ?? this.lastAnswerResponse,
    );
  }
}

class PracticeStateNotifier extends StateNotifier<PracticeState> {
  final StudentService _studentService;

  PracticeStateNotifier(this._studentService) : super(PracticeState());

  Future<void> createPractice({
    required PracticeType type,
    required int textbookId,
    int? unitId,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final session = await _studentService.createPractice(
        type: type,
        textbookId: textbookId,
        unitId: unitId,
      );

      // 这里应该加载题目，简化示例
      state = state.copyWith(
        isLoading: false,
        currentSession: session,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> submitAnswer({
    required String answer,
    required int timeSpent,
  }) async {
    if (state.currentSession == null || state.currentQuestion == null) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _studentService.submitAnswer(
        sessionId: state.currentSession!.id,
        questionId: state.currentQuestion!.id,
        answer: answer,
        timeSpent: timeSpent,
      );

      state = state.copyWith(
        isLoading: false,
        lastAnswerResponse: response,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  void setCurrentQuestion(int index) {
    if (index >= 0 && index < state.questions.length) {
      state = state.copyWith(
        currentQuestionIndex: index,
        currentQuestion: state.questions[index],
        lastAnswerResponse: null,
      );
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}
```

### 2.5 使用枚举类型

```dart
// lib/utils/enums_extension.dart
import 'package:your_project_name/core/shared_types/imports.dart';

extension PracticeTypeExtension on PracticeType {
  String get displayName {
    switch (this) {
      case PracticeType.daily:
        return '每日练习';
      case PracticeType.unit:
        return '单元练习';
      case PracticeType.assessment:
        return '能力评估';
    }
  }

  String get description {
    switch (this) {
      case PracticeType.daily:
        return '根据你的水平推送的日常练习题';
      case PracticeType.unit:
        return '针对特定单元的练习题';
      case PracticeType.assessment:
        return '全面评估你的学习水平';
    }
  }
}

extension DifficultyExtension on Difficulty {
  Color get color {
    switch (this) {
      case Difficulty.easy:
        return Colors.green;
      case Difficulty.medium:
        return Colors.orange;
      case Difficulty.hard:
        return Colors.red;
    }
  }

  String get displayName {
    switch (this) {
      case Difficulty.easy:
        return '简单';
      case Difficulty.medium:
        return '中等';
      case Difficulty.hard:
        return '困难';
    }
  }
}

// 在 UI 中使用
class PracticeTypeSelector extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: PracticeType.values.map((type) {
        return ListTile(
          title: Text(type.displayName),
          subtitle: Text(type.description),
          leading: Icon(Icons.play_arrow),
          onTap: () {
            // 选择练习类型
          },
        );
      }).toList(),
    );
  }
}
```

## 3. 迁移策略

### 3.1 渐进式迁移

1. **第一阶段**：在新功能中使用共享类型
   ```dart
   // 新的 API 调用使用共享类型
   import 'package:your_project_name/core/shared_types/imports.dart';
   ```

2. **第二阶段**：包装现有模型
   ```dart
   // 包装现有模型，逐步替换
   class OldStudentWrapper {
     final OldStudent oldStudent;

     OldStudentWrapper(this.oldStudent);

     // 转换方法
     Student toSharedType() {
       return Student(
         id: oldStudent.id,
         name: oldStudent.name,
         // ... 其他字段
       );
     }
   }
   ```

3. **第三阶段**：完全替换
   ```dart
   // 移除旧模型，完全使用共享类型
   ```

### 3.2 测试策略

```dart
// test/unit/models_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:your_project_name/core/shared_types/imports.dart';

void main() {
  group('Shared Types Tests', () {
    test('Student serialization/deserialization', () {
      final student = Student(
        id: '123',
        name: '张三',
        phone: '13800138000',
        grade: 5,
        status: 1,
        createTime: 1640995200,
      );

      final json = student.toJson();
      final restored = Student.fromJson(json);

      expect(restored.id, student.id);
      expect(restored.name, student.name);
      expect(restored.grade, student.grade);
    });

    test('Enum conversion', () {
      final practiceType = PracticeType.daily;
      expect(practiceType.value, 'daily_practice');

      final restored = PracticeType.fromValue('daily_practice');
      expect(restored, practiceType);
    });

    test('Complex model with nested types', () {
      final question = Question(
        id: 1,
        type: '选择题',
        subject: '数学',
        grade: 5,
        content: '1 + 1 = ?',
        options: ['2', '3', '4'],
        answer: '2',
        textbookId: 1,
        createTime: 1640995200,
      );

      final json = question.toJson();
      final restored = Question.fromJson(json);

      expect(restored.options, question.options);
      expect(restored.answer, question.answer);
    });
  });
}
```

## 4. 常见问题

### 4.1 字段名映射问题

**问题**：后端返回下划线命名的字段，Flutter 使用驼峰命名

**解决方案**：生成的 Dart 模型已经包含 `@JsonKey` 注解

```dart
@JsonKey(name: 'create_time')
final int? createTime;
```

### 4.2 类型转换问题

**问题**：后端返回的字段类型与期望不符

**解决方案**：在 JSON 序列化时添加类型转换

```dart
@JsonKey(name: 'grade', fromJson: _intFromDynamic, toJson: _intToJson)
final int grade;

static int _intFromDynamic(dynamic value) => value is int ? value : int.parse(value.toString());
static dynamic _intToJson(int value) => value;
```

### 4.3 可空字段处理

**问题**：某些字段在特定情况下为空

**解决方案**：使用 Dart 的可空类型和默认值

```dart
final String? endTime; // 可空字段
final List<String> options = []; // 带默认值的字段
```

## 5. 最佳实践

1. **统一错误处理**：为共享类型创建统一的错误处理机制
2. **类型安全**：充分利用 Dart 的类型系统避免运行时错误
3. **代码生成**：使用 build_runner 自动生成序列化代码
4. **测试覆盖**：为所有共享类型编写单元测试
5. **文档维护**：及时更新类型文档和注释

通过以上步骤，你可以成功地将共享类型集成到 Flutter 项目中，实现跨端类型一致性。