import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart' show StateNotifier;
import 'package:student_app/screens/wrong_records/data/wrong_records_repository.dart';
import 'package:student_app/core/models/wrong_question_summary.dart';

/// 错题本 Repository Provider
final wrongRecordsRepositoryProvider = Provider<WrongRecordsRepository>((ref) {
  return WrongRecordsRepository.instance;
});

/// 当前选中的筛选类型状态管理
/// null: 全部, 0: 未掌握, 1: 已掌握
class SelectedFilterNotifier extends StateNotifier<int?> {
  SelectedFilterNotifier() : super(null);

  void setFilter(int? filter) {
    state = filter;
  }

  /// 获取当前状态（公共方法，用于 Provider 访问）
  int? get currentState => state;
}

/// 当前选中的筛选类型 Provider (Riverpod 3.x compatible)
final selectedFilterProvider = Provider<SelectedFilterNotifier>((ref) {
  return SelectedFilterNotifier();
});

/// 当前选中的筛选类型状态 Provider
final selectedFilterStateProvider = Provider<int?>((ref) {
  return ref.watch(selectedFilterProvider).currentState;
});

/// 全部错题列表
final allWrongRecordsProvider = FutureProvider<List<WrongQuestionSummary>>((ref) async {
  final repository = ref.watch(wrongRecordsRepositoryProvider);
  return await repository.getWrongRecords();
});

/// 未掌握错题列表
final unmasteredWrongRecordsProvider = FutureProvider<List<WrongQuestionSummary>>((ref) async {
  final repository = ref.watch(wrongRecordsRepositoryProvider);
  return await repository.getWrongRecords(mastered: 0);
});

/// 已掌握错题列表
final masteredWrongRecordsProvider = FutureProvider<List<WrongQuestionSummary>>((ref) async {
  final repository = ref.watch(wrongRecordsRepositoryProvider);
  return await repository.getWrongRecords(mastered: 1);
});

/// 根据筛选类型获取对应的错题列表 Provider
final wrongRecordsByFilterProvider = Provider.family<AsyncValue<List<WrongQuestionSummary>>, int?>((ref, filter) {
  switch (filter) {
    case 0:
      return ref.watch(unmasteredWrongRecordsProvider);
    case 1:
      return ref.watch(masteredWrongRecordsProvider);
    default:
      return ref.watch(allWrongRecordsProvider);
  }
});

/// 标记已掌握的状态管理 (Riverpod 3.x compatible)
final markAsMasteredProvider = Provider<MarkAsMasteredNotifier>((ref) {
  return MarkAsMasteredNotifier(ref);
});

/// 标记已掌握的状态 Provider (用于访问状态)
final markAsMasteredStateProvider = Provider<AsyncValue<void>>((ref) {
  return ref.watch(markAsMasteredProvider).currentState;
});

class MarkAsMasteredNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;

  MarkAsMasteredNotifier(this._ref) : super(const AsyncValue.data(null));

  /// 标记已掌握
  Future<void> markAsMastered(int questionId) async {
    state = const AsyncValue.loading();
    try {
      final repository = _ref.read(wrongRecordsRepositoryProvider);
      await repository.markAsMastered(questionId);
      state = const AsyncValue.data(null);
      
      // 刷新所有相关的 Provider
      _ref.invalidate(allWrongRecordsProvider);
      _ref.invalidate(unmasteredWrongRecordsProvider);
      _ref.invalidate(masteredWrongRecordsProvider);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// 获取当前状态（公共方法，用于 Provider 访问）
  AsyncValue<void> get currentState => state;
}

