import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/core/api/endpoints/practice_endpoints.dart';

/// 练习详情 Provider
/// 根据 sessionId 获取练习会话详情
final practiceDetailProvider = FutureProvider.family<PracticeSessionDetail, int>((ref, sessionId) async {
  return await PracticeEndpoints.getSessionDetail(sessionId);
});

