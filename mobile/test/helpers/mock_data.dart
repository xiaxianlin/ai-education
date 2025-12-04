import '../../lib/core/models/student.dart';
import '../../lib/core/models/textbook.dart';
import '../../lib/core/models/question.dart';
import '../../lib/core/models/practice_session.dart';

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
    return Textbook(
      id: 1,
      subject: '数学',
      version: '人教版',
      grade: 3,
      semester: '上学期',
    );
  }

  /// 模拟题目数据
  static Question mockQuestion({
    int? id,
    String? type,
    String? content,
  }) {
    return Question(
      id: id ?? 1,
      type: type ?? 'choice',
      subject: '数学',
      grade: 3,
      content: content ?? '1 + 1 = ?',
      options: 'A. 1\nB. 2\nC. 3\nD. 4',
      answer: 'B',
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

