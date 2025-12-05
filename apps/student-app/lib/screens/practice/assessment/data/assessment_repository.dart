import 'package:student_app/core/api/endpoints/practice_endpoints.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/constants/practice_constants.dart';

/// 能力评测数据仓库
class AssessmentRepository {
  AssessmentRepository._();

  /// 获取能力评测列表
  /// GET /api/student/practice/assessment
  static Future<List<PracticeSession>> getAssessment() async {
    try {
      return await PracticeEndpoints.getAssessment();
    } catch (e) {
      throw Exception('获取能力评测失败: $e');
    }
  }

  /// 创建能力评测
  /// POST /api/student/practice/create
  /// Returns: session_id
  static Future<int> createPractice(int textbookId) async {
    try {
      return await PracticeEndpoints.createPractice(
        type: PracticeConstants.typeAssessment,
        textbookId: textbookId,
      );
    } catch (e) {
      throw Exception('创建能力评测失败: $e');
    }
  }
}

