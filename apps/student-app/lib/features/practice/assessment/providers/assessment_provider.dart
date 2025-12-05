import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart' show StateNotifier;
import '../data/assessment_repository.dart';
import '../../../../core/models/practice_session.dart';
import '../../../../core/constants/practice_constants.dart';
import '../../../../core/utils/error_handler.dart';

/// 能力评测状态
class AssessmentState {
  final List<PracticeSession> assessments;
  final bool isLoading;
  final bool isCreating;
  final String? error;
  final Map<int, Timer> pollingTimers; // textbookId -> Timer

  const AssessmentState({
    this.assessments = const [],
    this.isLoading = false,
    this.isCreating = false,
    this.error,
    this.pollingTimers = const {},
  });

  AssessmentState copyWith({
    List<PracticeSession>? assessments,
    bool? isLoading,
    bool? isCreating,
    String? error,
    Map<int, Timer>? pollingTimers,
  }) {
    return AssessmentState(
      assessments: assessments ?? this.assessments,
      isLoading: isLoading ?? this.isLoading,
      isCreating: isCreating ?? this.isCreating,
      error: error,
      pollingTimers: pollingTimers ?? this.pollingTimers,
    );
  }
}

/// 能力评测状态管理 Provider
class AssessmentNotifier extends StateNotifier<AssessmentState> {
  AssessmentNotifier() : super(const AssessmentState()) {
    // 初始化时获取数据
    fetchAssessment();
  }

  /// 获取能力评测列表
  Future<void> fetchAssessment() async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      final assessments = await AssessmentRepository.getAssessment();
      state = state.copyWith(
        assessments: assessments,
        isLoading: false,
      );
      // 检查是否有生成中的评测，启动轮询
      _startPollingForGenerating(assessments);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: ErrorHandler.getErrorMessage(e),
      );
    }
  }

  /// 创建能力评测
  Future<void> createPractice(int textbookId) async {
    try {
      state = state.copyWith(isCreating: true, error: null);
      await AssessmentRepository.createPractice(textbookId);
      // 创建后刷新列表
      await fetchAssessment();
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

  /// 启动轮询检查生成状态
  void _startPollingForGenerating(List<PracticeSession> assessments) {
    final timers = Map<int, Timer>.from(state.pollingTimers);

    for (final assessment in assessments) {
      // 如果生成状态为 0（生成中）且有 textbookId，启动轮询
      if (assessment.generateStatus == PracticeConstants.generateStatusGenerating &&
          assessment.textbookId != null) {
        final textbookId = assessment.textbookId!;
        
        // 如果已经有轮询，跳过
        if (timers.containsKey(textbookId)) {
          continue;
        }

        // 创建轮询定时器，每 4 秒检查一次
        final timer = Timer.periodic(const Duration(seconds: 4), (timer) async {
          try {
            final updatedAssessments = await AssessmentRepository.getAssessment();
            final updatedAssessment = updatedAssessments.firstWhere(
              (p) => p.textbookId == textbookId,
              orElse: () => assessment,
            );

            // 如果生成完成，停止轮询
            if (updatedAssessment.generateStatus !=
                PracticeConstants.generateStatusGenerating) {
              timer.cancel();
              final newTimers = Map<int, Timer>.from(state.pollingTimers);
              newTimers.remove(textbookId);
              state = state.copyWith(
                assessments: updatedAssessments,
                pollingTimers: newTimers,
              );
            } else {
              // 更新评测列表
              state = state.copyWith(assessments: updatedAssessments);
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
      } else if (assessment.textbookId != null) {
        // 如果生成已完成，停止该教材的轮询
        final textbookId = assessment.textbookId!;
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
  AssessmentState get currentState => state;
}

/// 能力评测状态 Provider (Riverpod 3.x compatible)
final assessmentProvider = Provider<AssessmentNotifier>((ref) {
  return AssessmentNotifier();
});

/// 能力评测状态 Provider (用于访问状态)
final assessmentStateProvider = Provider<AssessmentState>((ref) {
  return ref.watch(assessmentProvider).currentState;
});

