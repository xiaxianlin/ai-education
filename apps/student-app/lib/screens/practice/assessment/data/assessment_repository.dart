import 'package:student_app/core/api/endpoints/practice_endpoints.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/constants/practice_constants.dart';

/// 能力评测数据仓库
class AssessmentRepository {
  AssessmentRepository._();

  /// 获取特定教材的能力评测
  /// GET /api/student/practice/assessment/{textbook_id}
  static Future<PracticeSession> getAssessment(int textbookId) async {
    try {
      return await PracticeEndpoints.getAssessment(textbookId);
    } catch (e) {
      throw Exception('获取能力评测失败: $e');
    }
  }

  /// 创建能力评测
  /// POST /api/student/practice/create
  /// Returns: task_id
  static Future<String> createPractice(int textbookId) async {
    try {
      return await PracticeEndpoints.createPractice(
        type: PracticeConstants.typeAssessment,
        textbookId: textbookId,
      );
    } catch (e) {
      throw Exception('创建能力评测失败: $e');
    }
  }

  /// 获取练习生成状态
  static Future<String> getTaskStatus(String taskId) async {
    try {
      return await PracticeEndpoints.getPracticeTaskStatus(taskId);
    } catch (e) {
      throw Exception('获取任务状态失败: $e');
    }
  }
}

