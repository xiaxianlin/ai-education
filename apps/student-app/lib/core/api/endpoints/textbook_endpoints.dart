import 'package:student_app/core/api/api_client.dart';
import 'package:student_app/core/models/unit.dart';
import 'package:student_app/core/models/knowledge.dart';

/// 教材相关 API 端点
class TextbookEndpoints {
  TextbookEndpoints._();

  static final _api = ApiClient.instance;

  /// 获取单元列表
  /// GET /api/student/textbook/{textbook_id}/units
  static Future<List<Unit>> getUnits(int textbookId) async {
    final data = await _api.get<List<dynamic>>(
      '/textbook/$textbookId/units',
    );
    return data.map((json) => Unit.fromJson(json)).toList();
  }

  /// 获取知识点列表
  /// GET /api/student/textbook/{unit_id}/knowledges
  static Future<List<Knowledge>> getKnowledges(int unitId) async {
    final data = await _api.get<List<dynamic>>(
      '/textbook/$unitId/knowledges',
    );
    return data.map((json) => Knowledge.fromJson(json)).toList();
  }
}

