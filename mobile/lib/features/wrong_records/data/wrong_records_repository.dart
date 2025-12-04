import '../../../core/api/endpoints/wrong_records_endpoints.dart';
import '../../../core/models/wrong_question_summary.dart';

/// 错题本 Repository
class WrongRecordsRepository {
  WrongRecordsRepository._();

  static final WrongRecordsRepository instance = WrongRecordsRepository._();

  /// 获取错题列表
  /// [mastered] 是否已掌握：null-全部, 0-未掌握, 1-已掌握
  Future<List<WrongQuestionSummary>> getWrongRecords({
    int? mastered,
  }) async {
    return await WrongRecordsEndpoints.getWrongRecords(mastered: mastered);
  }

  /// 标记已掌握
  Future<void> markAsMastered(int questionId) async {
    await WrongRecordsEndpoints.markAsMastered(questionId);
  }
}

