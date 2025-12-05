import '../../../../core/api/endpoints/practice_endpoints.dart';
import '../../../../core/models/practice_session.dart';
import '../../../../core/constants/practice_constants.dart';

/// 每日练习数据仓库
class DailyPracticeRepository {
  DailyPracticeRepository._();

  /// 获取每日练习列表
  /// GET /api/student/practice/daily
  static Future<List<PracticeSession>> getDailyPractice() async {
    try {
      return await PracticeEndpoints.getDailyPractice();
    } catch (e) {
      throw Exception('获取每日练习失败: $e');
    }
  }

  /// 创建每日练习
  /// POST /api/student/practice/create
  /// Returns: session_id
  static Future<int> createPractice(int textbookId) async {
    try {
      return await PracticeEndpoints.createPractice(
        type: PracticeConstants.typeDailyPractice,
        textbookId: textbookId,
      );
    } catch (e) {
      throw Exception('创建每日练习失败: $e');
    }
  }
}

