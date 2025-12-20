import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart' show StateNotifier;
import 'package:student_app/screens/practice/unit/data/unit_practice_repository.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/models/unit.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/core/utils/error_handler.dart';

/// 单元练习状态
class UnitPracticeState {
  final List<PracticeSession> practices;
  final Map<int, List<Unit>> unitsCache; // textbookId -> units
  final Map<int, bool> unitsLoading; // textbookId -> loading
  final bool isLoading;
  final bool isCreating;
  final String? error;
  final Map<String, Timer> pollingTimers; // "textbookId_unitId" -> Timer

  const UnitPracticeState({
    this.practices = const [],
    this.unitsCache = const {},
    this.unitsLoading = const {},
    this.isLoading = false,
    this.isCreating = false,
    this.error,
    this.pollingTimers = const {},
  });

  UnitPracticeState copyWith({
    List<PracticeSession>? practices,
    Map<int, List<Unit>>? unitsCache,
    Map<int, bool>? unitsLoading,
    bool? isLoading,
    bool? isCreating,
    String? error,
    Map<String, Timer>? pollingTimers,
  }) {
    return UnitPracticeState(
      practices: practices ?? this.practices,
      unitsCache: unitsCache ?? this.unitsCache,
      unitsLoading: unitsLoading ?? this.unitsLoading,
      isLoading: isLoading ?? this.isLoading,
      isCreating: isCreating ?? this.isCreating,
      error: error,
      pollingTimers: pollingTimers ?? this.pollingTimers,
    );
  }
}

/// 单元练习状态管理 Provider
class UnitPracticeNotifier extends StateNotifier<UnitPracticeState> {
  UnitPracticeNotifier() : super(const UnitPracticeState());

  /// 获取单元练习列表（获取所有历史记录以展示各单元状态）
  Future<void> fetchUnitPractice({int? unitId}) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      List<PracticeSession> practices;
      if (unitId != null) {
        // 获取特定单元的最新会话
        final practice = await UnitPracticeRepository.getUnitPractice(unitId);
        // 更新现有列表中的对应项
        practices = state.practices.map((p) => p.targetId == unitId ? practice : p).toList();
        if (!state.practices.any((p) => p.targetId == unitId)) {
          practices.add(practice);
        }
      } else {
        // 获取所有单元练习历史
        practices = await PracticeEndpoints.getHistory(type: PracticeConstants.typeUnitPractice);
      }

      state = state.copyWith(
        practices: practices,
        isLoading: false,
      );
      // 检查是否有生成中的练习，启动轮询
      _startPollingForGenerating(practices);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: ErrorHandler.getErrorMessage(e),
      );
    }
  }

  /// 获取单元列表
  Future<void> fetchUnits(int textbookId) async {
    // 同时也获取该教材相关的练习记录
    fetchUnitPractice();

    // 如果已缓存，直接返回
    if (state.unitsCache.containsKey(textbookId)) {
      return;
    }
    // ... rest of the fetchUnits logic ...
    try {
      state = state.copyWith(
        unitsLoading: {
          ...state.unitsLoading,
          textbookId: true,
        },
      );
      final units = await UnitPracticeRepository.getUnits(textbookId);
      state = state.copyWith(
        unitsCache: {
          ...state.unitsCache,
          textbookId: units,
        },
        unitsLoading: {
          ...state.unitsLoading,
          textbookId: false,
        },
      );
    } catch (e) {
      state = state.copyWith(
        unitsLoading: {
          ...state.unitsLoading,
          textbookId: false,
        },
        error: ErrorHandler.getErrorMessage(e),
      );
    }
  }

  /// 创建单元练习
  Future<void> createPractice(int textbookId, int unitId) async {
    try {
      state = state.copyWith(isCreating: true, error: null);
      final taskId = await UnitPracticeRepository.createPractice(textbookId, unitId);
      
      // 启动任务状态轮询
      _startPollingForTask(taskId, unitId);
    } catch (e) {
      state = state.copyWith(
        isCreating: false,
        error: ErrorHandler.getErrorMessage(e),
      );
      rethrow;
    } finally {
      state = state.copyWith(isCreating: false);
    }
  }

  /// 启动任务状态轮询 (用于异步生成)
  void _startPollingForTask(String taskId, int unitId) {
    Timer.periodic(const Duration(seconds: 2), (timer) async {
      try {
        final status = await UnitPracticeRepository.getTaskStatus(taskId);
        
        if (status == 'SUCCESS' || status == 'FAILURE') {
          timer.cancel();
          // 刷新该单元的状态
          fetchUnitPractice(unitId: unitId);
        }
      } catch (e) {
        timer.cancel();
      }
    });
  }

  /// 启动轮询检查生成状态
  void _startPollingForGenerating(List<PracticeSession> practices) {
    final timers = Map<String, Timer>.from(state.pollingTimers);

    for (final practice in practices) {
      // 如果生成状态为 0（生成中）且有 targetId 和 textbookId，启动轮询
      if (practice.generateStatus == PracticeConstants.generateStatusGenerating &&
          practice.targetId != null &&
          practice.textbookId != null) {
        final key = '${practice.textbookId}_${practice.targetId}';
        
        // 如果已经有轮询，跳过
        if (timers.containsKey(key)) {
          continue;
        }

        // 创建轮询定时器，每 4 秒检查一次
        final timer = Timer.periodic(const Duration(seconds: 4), (timer) async {
          try {
            final unitId = practice.targetId!;
            final updatedPractice = await UnitPracticeRepository.getUnitPractice(unitId);

            // 如果生成完成，停止轮询
            if (updatedPractice.generateStatus !=
                PracticeConstants.generateStatusGenerating) {
              timer.cancel();
              final newTimers = Map<String, Timer>.from(state.pollingTimers);
              newTimers.remove(key);
              
              final newPractices = state.practices.map((p) => p.targetId == unitId ? updatedPractice : p).toList();
              
              state = state.copyWith(
                practices: newPractices,
                pollingTimers: newTimers,
              );
            } else {
              // 更新练习列表中的对应项
              final newPractices = state.practices.map((p) => p.targetId == unitId ? updatedPractice : p).toList();
              state = state.copyWith(practices: newPractices);
            }
          } catch (e) {
            // 轮询失败，停止轮询
            timer.cancel();
            final newTimers = Map<String, Timer>.from(state.pollingTimers);
            newTimers.remove(key);
            state = state.copyWith(pollingTimers: newTimers);
          }
        });

        timers[key] = timer;
      } else if (practice.targetId != null && practice.textbookId != null) {
        // 如果生成已完成，停止该单元的轮询
        final key = '${practice.textbookId}_${practice.targetId}';
        final timer = timers.remove(key);
        timer?.cancel();
      }
    }

    state = state.copyWith(pollingTimers: timers);
  }

  @override
  void dispose() {
    // 清理所有轮询定时器
    for (final timer in state.pollingTimers.values) {
      timer.cancel();
    }
    super.dispose();
  }

  /// 获取当前状态（公共方法，用于 Provider 访问）
  UnitPracticeState get currentState => state;
}

/// 单元练习状态 Provider (Riverpod 3.x compatible)
final unitPracticeProvider = Provider<UnitPracticeNotifier>((ref) {
  return UnitPracticeNotifier();
});

/// 单元练习状态 Provider (用于访问状态)
final unitPracticeStateProvider = Provider<UnitPracticeState>((ref) {
  return ref.watch(unitPracticeProvider).currentState;
});

