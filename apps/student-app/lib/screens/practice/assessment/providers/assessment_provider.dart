import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart' show StateNotifier;
import 'package:student_app/screens/practice/assessment/data/assessment_repository.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/core/utils/error_handler.dart';

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
  AssessmentNotifier() : super(const AssessmentState());

  /// 获取所有激活教材的能力评测列表
  Future<void> fetchAssessment(List<Textbook> textbooks) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      
      final List<PracticeSession> assessments = [];
      for (final textbook in textbooks) {
        try {
          final session = await AssessmentRepository.getAssessment(textbook.id);
          assessments.add(session);
        } catch (e) {
          Logger.error('获取教材 ${textbook.name} 的能力评测失败: $e');
        }
      }

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
      final taskId = await AssessmentRepository.createPractice(textbookId);
      
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
        final status = await AssessmentRepository.getTaskStatus(taskId);
        
        if (status == 'SUCCESS' || status == 'FAILURE') {
          timer.cancel();
          // 刷新数据通常在页面层面调用 fetchAssessment
        }
      } catch (e) {
        timer.cancel();
      }
    });
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
            final updatedAssessment = await AssessmentRepository.getAssessment(textbookId);

            // 如果生成完成，停止轮询
            if (updatedAssessment.generateStatus !=
                PracticeConstants.generateStatusGenerating) {
              timer.cancel();
              final newTimers = Map<int, Timer>.from(state.pollingTimers);
              newTimers.remove(textbookId);
              
              final newAssessments = state.assessments.map((p) => p.textbookId == textbookId ? updatedAssessment : p).toList();
              
              state = state.copyWith(
                assessments: newAssessments,
                pollingTimers: newTimers,
              );
            } else {
              // 更新评测列表
              final newAssessments = state.assessments.map((p) => p.textbookId == textbookId ? updatedAssessment : p).toList();
              state = state.copyWith(assessments: newAssessments);
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

