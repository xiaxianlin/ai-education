import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart' show StateNotifier;
import 'package:student_app/screens/practice/daily/data/daily_practice_repository.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/core/utils/error_handler.dart';

/// 每日练习状态
class DailyPracticeState {
  final List<PracticeSession> practices;
  final bool isLoading;
  final bool isCreating;
  final String? error;
  final Map<int, Timer> pollingTimers; // textbookId -> Timer

  const DailyPracticeState({
    this.practices = const [],
    this.isLoading = false,
    this.isCreating = false,
    this.error,
    this.pollingTimers = const {},
  });

  DailyPracticeState copyWith({
    List<PracticeSession>? practices,
    bool? isLoading,
    bool? isCreating,
    String? error,
    Map<int, Timer>? pollingTimers,
  }) {
    return DailyPracticeState(
      practices: practices ?? this.practices,
      isLoading: isLoading ?? this.isLoading,
      isCreating: isCreating ?? this.isCreating,
      error: error,
      pollingTimers: pollingTimers ?? this.pollingTimers,
    );
  }
}

/// 每日练习状态管理 Provider
class DailyPracticeNotifier extends StateNotifier<DailyPracticeState> {
  DailyPracticeNotifier() : super(const DailyPracticeState());

  /// 获取所有激活教材的每日练习列表
  Future<void> fetchDailyPractice(List<Textbook> textbooks) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      final List<PracticeSession> practices = [];
      for (final textbook in textbooks) {
        try {
          final practice = await DailyPracticeRepository.getDailyPractice(textbook.id);
          practices.add(practice);
        } catch (e) {
          // 如果某个教材获取失败，暂时忽略或记录，不影响其他教材
          Logger.error('获取教材 ${textbook.name} 的每日练习失败: $e');
        }
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

  /// 创建每日练习
  Future<void> createPractice(int textbookId) async {
    try {
      state = state.copyWith(isCreating: true, error: null);
      final taskId = await DailyPracticeRepository.createPractice(textbookId);
      
      // 启动任务状态轮询
      _startPollingForTask(taskId, textbookId);
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
  void _startPollingForTask(String taskId, int textbookId) {
    Timer.periodic(const Duration(seconds: 2), (timer) async {
      try {
        final status = await DailyPracticeRepository.getTaskStatus(taskId);
        
        // 如果任务成功或失败，停止轮询并刷新
        if (status == 'SUCCESS' || status == 'FAILURE') {
          timer.cancel();
          // 如果需要特定的教材列表，这里可能需要从外面传入，或者在 Fetch 时自行获取
          // 这里暂时通过 fetchDailyPractice 来整体刷新（如果已有 textbooks 缓存）
          // state 中的 practices 可能需要更新
          // 更好的做法是 refresh 整个列表
        }
      } catch (e) {
        timer.cancel();
      }
    });
  }

  /// 启动轮询检查生成状态 (针对已有的 session)
  void _startPollingForGenerating(List<PracticeSession> practices) {
    final timers = Map<int, Timer>.from(state.pollingTimers);

    for (final practice in practices) {
      // 如果生成状态为 0（生成中）且有 textbookId，启动轮询
      if (practice.generateStatus == PracticeConstants.generateStatusGenerating &&
          practice.textbookId != null) {
        final textbookId = practice.textbookId!;
        
        // 如果已经有轮询，跳过
        if (timers.containsKey(textbookId)) {
          continue;
        }

        // 创建轮询定时器，每 4 秒检查一次
        final timer = Timer.periodic(const Duration(seconds: 4), (timer) async {
          try {
            final updatedPractice = await DailyPracticeRepository.getDailyPractice(textbookId);

            // 如果生成完成，停止轮询
            if (updatedPractice.generateStatus !=
                PracticeConstants.generateStatusGenerating) {
              timer.cancel();
              
              final newTimers = Map<int, Timer>.from(state.pollingTimers);
              newTimers.remove(textbookId);
              
              final newPractices = state.practices.map((p) => p.textbookId == textbookId ? updatedPractice : p).toList();
              
              state = state.copyWith(
                practices: newPractices,
                pollingTimers: newTimers,
              );
            } else {
              // 更新练习列表中的对应项
              final newPractices = state.practices.map((p) => p.textbookId == textbookId ? updatedPractice : p).toList();
              state = state.copyWith(practices: newPractices);
            }
          } catch (e) {
            // 轮询失败，停止轮询
            timer.cancel();
            final newTimers = Map<int, Timer>.from(state.pollingTimers);
            newTimers.remove(textbookId);
            state = state.copyWith(pollingTimers: newTimers);
          }
        });

        timers[textbookId] = timer;
      } else if (practice.textbookId != null) {
        // 如果生成已完成，停止该教材的轮询
        final textbookId = practice.textbookId!;
        final timer = timers.remove(textbookId);
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
  DailyPracticeState get currentState => state;
}

/// 每日练习状态 Provider (Riverpod 3.x compatible)
final dailyPracticeProvider = Provider<DailyPracticeNotifier>((ref) {
  return DailyPracticeNotifier();
});

/// 每日练习状态 Provider (用于访问状态)
final dailyPracticeStateProvider = Provider<DailyPracticeState>((ref) {
  return ref.watch(dailyPracticeProvider).currentState;
});

