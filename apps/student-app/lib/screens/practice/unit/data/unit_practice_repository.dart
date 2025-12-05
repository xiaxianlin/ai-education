import 'package:student_app/core/api/endpoints/practice_endpoints.dart';
import 'package:student_app/core/api/endpoints/textbook_endpoints.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/models/unit.dart';
import 'package:student_app/core/constants/practice_constants.dart';

/// 单元练习数据仓库
class UnitPracticeRepository {
  UnitPracticeRepository._();

  /// 获取单元练习列表
  /// GET /api/student/practice/unit
  static Future<List<PracticeSession>> getUnitPractice() async {
    try {
      return await PracticeEndpoints.getUnitPractice();
    } catch (e) {
      throw Exception('获取单元练习失败: $e');
    }
  }

  /// 获取单元列表
  /// GET /api/student/textbook/{textbook_id}/units
  static Future<List<Unit>> getUnits(int textbookId) async {
    try {
      return await TextbookEndpoints.getUnits(textbookId);
    } catch (e) {
      throw Exception('获取单元列表失败: $e');
    }
  }

  /// 创建单元练习
  /// POST /api/student/practice/create
  /// Returns: session_id
  static Future<int> createPractice(int textbookId, int unitId) async {
    try {
      return await PracticeEndpoints.createPractice(
        type: PracticeConstants.typeUnitPractice,
        textbookId: textbookId,
        unitId: unitId,
      );
    } catch (e) {
      throw Exception('创建单元练习失败: $e');
    }
  }
}

