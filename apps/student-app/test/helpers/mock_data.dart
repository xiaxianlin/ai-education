import 'package:student_app/core/models/student.dart';
import 'package:student_app/core/models/textbook.dart';
import 'package:student_app/core/models/question_v2.dart';
import 'package:student_app/core/models/practice_session.dart';

/// 模拟数据
class MockData {
  MockData._();

  /// 模拟学生数据
  static Student mockStudent() {
    return Student(
      id: '1',
      name: '测试学生',
      phone: '13800138000',
      grade: 3,
      status: 0,
      createTime: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      updateTime: DateTime.now().millisecondsSinceEpoch ~/ 1000,
    );
  }

  /// 模拟教材数据
  static Textbook mockTextbook() {
    return const Textbook(
      id: 1,
      subject: '数学',
      version: '人教版',
      grade: 3,
      semester: '上学期',
    );
  }

  /// 模拟题目数据 (V2)
  static QuestionV2 mockQuestion({
    String? id,
    String? questionTypeCode,
    String? content,
  }) {
    return QuestionV2(
      id: id ?? '1',
      questionTypeId: 1,
      questionTypeCode: questionTypeCode ?? 'single_choice',
      subject: '数学',
      grade: 3,
      stage: 'primary_low',
      stem: QuestionStemV2(text: content ?? '1 + 1 = ?'),
      options: [
        QuestionOptionV2(id: 'A', text: '1'),
        QuestionOptionV2(id: 'B', text: '2', isCorrect: true),
        QuestionOptionV2(id: 'C', text: '3'),
        QuestionOptionV2(id: 'D', text: '4'),
      ],
      answer: {'type': 'exact', 'correct_answers': ['B']},
      difficulty: 'easy',
      textbookId: 1,
    );
  }

  /// 模拟练习会话数据
  static PracticeSession mockPracticeSession({
    int? id,
    String? type,
  }) {
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    return PracticeSession(
      id: id ?? 1,
      studentId: '1',
      sessionType: type ?? 'daily_practice',
      textbookId: 1,
      targetId: null,
      status: 1,
      generateStatus: 1,
      questionCount: 10,
      answerCount: 0,
      correctCount: 0,
      startTime: now,
      endTime: null,
      createTime: now,
      updateTime: now,
    );
  }
}


