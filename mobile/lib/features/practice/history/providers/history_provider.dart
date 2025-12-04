import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart' show StateNotifier;
import '../../../../core/api/endpoints/practice_endpoints.dart';
import '../../../../core/models/practice_session.dart';
import '../../../../core/constants/practice_constants.dart';

/// 当前选中的历史类型状态管理
class SelectedHistoryTypeNotifier extends StateNotifier<String> {
  SelectedHistoryTypeNotifier() : super(PracticeConstants.typeDailyPractice);

  void setType(String type) {
    state = type;
  }

  /// 获取当前状态（公共方法，用于 Provider 访问）
  String get currentState => state;
}

/// 当前选中的历史类型 Provider (Riverpod 3.x compatible)
final selectedHistoryTypeProvider = Provider<SelectedHistoryTypeNotifier>((ref) {
  return SelectedHistoryTypeNotifier();
});

/// 当前选中的历史类型状态 Provider
final selectedHistoryTypeStateProvider = Provider<String>((ref) {
  return ref.watch(selectedHistoryTypeProvider).currentState;
});

/// 每日练习历史数据
final dailyHistoryProvider = FutureProvider<List<PracticeSession>>((ref) async {
  return await PracticeEndpoints.getHistory(
    type: PracticeConstants.typeDailyPractice,
    limit: 30,
  );
});

/// 单元练习历史数据
final unitHistoryProvider = FutureProvider<List<PracticeSession>>((ref) async {
  return await PracticeEndpoints.getHistory(
    type: PracticeConstants.typeUnitPractice,
    limit: 30,
  );
});

/// 能力评测历史数据
final assessmentHistoryProvider = FutureProvider<List<PracticeSession>>((ref) async {
  return await PracticeEndpoints.getHistory(
    type: PracticeConstants.typeAssessment,
    limit: 30,
  );
});

/// 根据类型获取对应的历史数据 Provider
final historyByTypeProvider = Provider.family<AsyncValue<List<PracticeSession>>, String>((ref, type) {
  switch (type) {
    case PracticeConstants.typeDailyPractice:
      return ref.watch(dailyHistoryProvider);
    case PracticeConstants.typeUnitPractice:
      return ref.watch(unitHistoryProvider);
    case PracticeConstants.typeAssessment:
      return ref.watch(assessmentHistoryProvider);
    default:
      return ref.watch(dailyHistoryProvider);
  }
});

