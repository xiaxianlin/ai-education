import 'package:student_app/core/api/endpoints/practice_endpoints.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/constants/practice_constants.dart';

/// 每日练习数据仓库
class DailyPracticeRepository {
  DailyPracticeRepository._();

  /// 获取特定教材的每日练习
  /// GET /api/student/practice/daily/{textbook_id}
  static Future<PracticeSession> getDailyPractice(int textbookId) async {
    try {
      return await PracticeEndpoints.getDailyPractice(textbookId);
    } catch (e) {
      throw Exception('获取每日练习失败: $e');
    }
  }

  /// 创建每日练习
  /// POST /api/student/practice/create
  /// Returns: task_id
  static Future<String> createPractice(int textbookId) async {
    try {
      return await PracticeEndpoints.createPractice(
        type: PracticeConstants.typeDailyPractice,
        textbookId: textbookId,
      );
    } catch (e) {
      throw Exception('创建每日练习失败: $e');
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

