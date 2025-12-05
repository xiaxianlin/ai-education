import 'package:student_app/core/api/api_client.dart';
import 'package:student_app/core/models/wrong_question_summary.dart';

/// 错题本相关 API 端点
class WrongRecordsEndpoints {
  WrongRecordsEndpoints._();

  static final _api = ApiClient.instance;

  /// 获取错题列表
  /// GET /api/student/wrong-records?mastered=0|1&limit=20
  static Future<List<WrongQuestionSummary>> getWrongRecords({
    int? mastered, // 0-未掌握, 1-已掌握
    int? limit, // 限制返回数量（用于分页）
  }) async {
    final queryParams = <String, dynamic>{};
    if (mastered != null) {
      queryParams['mastered'] = mastered;
    }
    if (limit != null) {
      queryParams['limit'] = limit;
    }
    final data = await _api.get<List<dynamic>>(
      '/wrong-records',
      queryParameters: queryParams.isNotEmpty ? queryParams : null,
    );
    return data
        .map((json) => WrongQuestionSummary.fromJson(json))
        .toList();
  }

  /// 标记已掌握
  /// POST /api/student/wrong-records/{question_id}/master
  static Future<void> markAsMastered(int questionId) async {
    await _api.post<void>('/wrong-records/$questionId/master');
  }
}

