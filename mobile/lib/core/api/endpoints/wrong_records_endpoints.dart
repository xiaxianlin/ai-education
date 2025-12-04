import '../api_client.dart';
import '../../models/practice_wrong_record.dart';

/// 错题本相关 API 端点
class WrongRecordsEndpoints {
  WrongRecordsEndpoints._();

  static final _api = ApiClient.instance;

  /// 获取错题列表
  /// GET /api/student/wrong-records?mastered=0|1
  static Future<List<PracticeWrongRecord>> getWrongRecords({
    int? mastered, // 0-未掌握, 1-已掌握
  }) async {
    final data = await _api.get<List<dynamic>>(
      '/wrong-records',
      queryParameters: mastered != null ? {'mastered': mastered} : null,
    );
    return data
        .map((json) => PracticeWrongRecord.fromJson(json))
        .toList();
  }

  /// 标记已掌握
  /// POST /api/student/wrong-records/{question_id}/master
  static Future<void> markAsMastered(int questionId) async {
    await _api.post<void>('/wrong-records/$questionId/master');
  }
}

