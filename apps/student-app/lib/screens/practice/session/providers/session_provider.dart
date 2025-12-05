import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart' show StateNotifier;
import 'package:student_app/screens/practice/session/data/practice_repository.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/models/question.dart';
import 'package:student_app/core/models/practice_report.dart';
import 'package:student_app/core/models/submit_answer_params.dart';
import 'package:student_app/core/models/submit_answer_response.dart';

/// 答题状态：0-未答, 1-正确, 2-错误
enum AnswerStatus {
  unanswered(0),
  correct(1),
  wrong(2);

  final int value;
  const AnswerStatus(this.value);

  static AnswerStatus fromInt(int value) {
    return AnswerStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => AnswerStatus.unanswered,
    );
  }
}

/// 练习会话状态
class SessionState {
  final bool loading;
  final PracticeSession? session;
  final List<Question> questions;
  final int currentQuestionIndex;
  final Map<int, String> userAnswers; // questionId -> answer
  final Map<int, String> audioAnswers; // questionId -> audioPath
  final Map<int, String> audioAnalysis; // questionId -> analysis
  final Map<int, AnswerStatus> answerStatus; // questionId -> status
  final bool submitting;
  final PracticeReport? report;
  final int? startTime; // 当前题目开始时间（毫秒时间戳）

  const SessionState({
    this.loading = false,
    this.session,
    this.questions = const [],
    this.currentQuestionIndex = 0,
    this.userAnswers = const {},
    this.audioAnswers = const {},
    this.audioAnalysis = const {},
    this.answerStatus = const {},
    this.submitting = false,
    this.report,
    this.startTime,
  });

  SessionState copyWith({
    bool? loading,
    PracticeSession? session,
    List<Question>? questions,
    int? currentQuestionIndex,
    Map<int, String>? userAnswers,
    Map<int, String>? audioAnswers,
    Map<int, String>? audioAnalysis,
    Map<int, AnswerStatus>? answerStatus,
    bool? submitting,
    PracticeReport? report,
    int? startTime,
    bool clearStartTime = false,
  }) {
    return SessionState(
      loading: loading ?? this.loading,
      session: session ?? this.session,
      questions: questions ?? this.questions,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      userAnswers: userAnswers ?? this.userAnswers,
      audioAnswers: audioAnswers ?? this.audioAnswers,
      audioAnalysis: audioAnalysis ?? this.audioAnalysis,
      answerStatus: answerStatus ?? this.answerStatus,
      submitting: submitting ?? this.submitting,
      report: report ?? this.report,
      startTime: clearStartTime ? null : (startTime ?? this.startTime),
    );
  }

  /// 获取当前题目
  Question? get currentQuestion {
    if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
      return questions[currentQuestionIndex];
    }
    return null;
  }

  /// 获取当前题目的答案
  String? get currentAnswer {
    final question = currentQuestion;
    if (question == null) return null;
    return userAnswers[question.id];
  }

  /// 获取当前题目的音频答案
  String? get currentAudioAnswer {
    final question = currentQuestion;
    if (question == null) return null;
    return audioAnswers[question.id];
  }

  /// 获取当前题目的答题状态
  AnswerStatus get currentAnswerStatus {
    final question = currentQuestion;
    if (question == null) return AnswerStatus.unanswered;
    return answerStatus[question.id] ?? AnswerStatus.unanswered;
  }

  /// 是否已回答当前题目
  bool get hasAnsweredCurrent {
    final question = currentQuestion;
    if (question == null) return false;
    return answerStatus[question.id] != null &&
        answerStatus[question.id] != AnswerStatus.unanswered;
  }

  /// 是否最后一题
  bool get isLastQuestion {
    return currentQuestionIndex >= questions.length - 1;
  }

  /// 已答题数
  int get answeredCount {
    return answerStatus.values
        .where((status) => status != AnswerStatus.unanswered)
        .length;
  }

  /// 总题数
  int get totalQuestions {
    return questions.length;
  }
}

/// 练习会话状态管理 Provider
class SessionNotifier extends StateNotifier<SessionState> {
  SessionNotifier() : super(const SessionState());

  final _repository = PracticeRepository.instance;

  /// 加载会话详情
  Future<void> loadSession(int sessionId) async {
    try {
      state = state.copyWith(loading: true);

      final detail = await _repository.getSessionDetail(sessionId);
      final session = detail.session;
      final questions = detail.questions;
      final answers = detail.answers;
      final report = detail.report;

      // 恢复已提交的答案
      final restoredAnswers = <int, String>{};
      final restoredAudioAnswers = <int, String>{};
      final restoredStatus = <int, AnswerStatus>{};

      if (answers.isNotEmpty) {
        for (final answer in answers) {
          if (answer.textAnswer != null && answer.textAnswer!.isNotEmpty) {
            restoredAnswers[answer.questionId] = answer.textAnswer!;
          }
          if (answer.audioAnswer != null && answer.audioAnswer!.isNotEmpty) {
            restoredAudioAnswers[answer.questionId] = answer.audioAnswer!;
          }
          restoredStatus[answer.questionId] =
              AnswerStatus.fromInt(answer.status);
        }
      }

      // 找到第一个未回答的题目
      int firstUnansweredIndex = 0;
      if (questions.isNotEmpty) {
        final index = questions.indexWhere(
          (q) =>
              restoredStatus[q.id] == null ||
              restoredStatus[q.id] == AnswerStatus.unanswered,
        );
        if (index != -1) {
          firstUnansweredIndex = index;
        }
      }

      state = state.copyWith(
        loading: false,
        session: session,
        questions: questions,
        userAnswers: restoredAnswers,
        audioAnswers: restoredAudioAnswers,
        answerStatus: restoredStatus,
        currentQuestionIndex: firstUnansweredIndex,
        report: report,
        startTime: DateTime.now().millisecondsSinceEpoch,
        clearStartTime: false,
      );
    } catch (e) {
      state = state.copyWith(loading: false);
      rethrow;
    }
  }

  /// 开始练习
  Future<void> beginPractice() async {
    final session = state.session;
    if (session == null) {
      throw Exception('会话不存在');
    }

    await _repository.beginPractice(session.id);

    // 更新会话状态为进行中（创建新对象）
    final updatedSession = PracticeSession(
      id: session.id,
      studentId: session.studentId,
      sessionType: session.sessionType,
      targetId: session.targetId,
      textbookId: session.textbookId,
      questionCount: session.questionCount,
      answerCount: session.answerCount,
      correctCount: session.correctCount,
      status: 1, // 进行中
      generateStatus: session.generateStatus,
      startTime: session.startTime,
      endTime: session.endTime,
      createTime: session.createTime,
      updateTime: session.updateTime,
      textbook: session.textbook,
    );

    state = state.copyWith(
      session: updatedSession,
      startTime: DateTime.now().millisecondsSinceEpoch,
    );
  }

  /// 设置当前题目的答案
  void setCurrentAnswer(String answer) {
    final question = state.currentQuestion;
    if (question == null) return;

    state = state.copyWith(
      userAnswers: {
        ...state.userAnswers,
        question.id: answer,
      },
    );
  }

  /// 设置当前题目的音频答案
  void setCurrentAudioAnswer(String audioPath) {
    final question = state.currentQuestion;
    if (question == null) return;

    state = state.copyWith(
      audioAnswers: {
        ...state.audioAnswers,
        question.id: audioPath,
      },
    );
  }

  /// 设置当前题目的音频分析
  void setCurrentAudioAnalysis(String analysis) {
    final question = state.currentQuestion;
    if (question == null) return;

    state = state.copyWith(
      audioAnalysis: {
        ...state.audioAnalysis,
        question.id: analysis,
      },
    );
  }

  /// 提交当前题目答案
  Future<SubmitAnswerResponse> submitAnswer() async {
    final session = state.session;
    final question = state.currentQuestion;
    final startTime = state.startTime;

    if (session == null || question == null) {
      throw Exception('会话或题目不存在');
    }

    // 验证答案是否已填写
    final answer = state.userAnswers[question.id];
    final audioAnswer = state.audioAnswers[question.id];

    if (question.type == '口语题' || question.type == 'oral') {
      if (audioAnswer == null || audioAnswer.isEmpty) {
        throw Exception('请先录制语音答案');
      }
    } else {
      if (answer == null || answer.isEmpty) {
        throw Exception('请先填写答案');
      }
    }

    try {
      state = state.copyWith(submitting: true);

      // 计算答题耗时
      final timeSpent = startTime != null
          ? ((DateTime.now().millisecondsSinceEpoch - startTime) / 1000).round()
          : 0;

      // 获取音频分析结果（如果有）
      final audioAnalysis = state.audioAnalysis[question.id];
      final audioMatch = audioAnalysis != null
          ? audioAnalysis.contains('匹配') || audioAnalysis.contains('正确')
          : null;

      final params = SubmitAnswerParams(
        sessionId: session.id,
        questionId: question.id,
        answer: answer ?? '',
        timeSpent: timeSpent,
        isAudioAnswer: question.type == '口语题' || question.type == 'oral',
        audioData: audioAnswer,
        audioMatch: audioMatch,
        audioAnalysis: audioAnalysis,
      );

      final result = await _repository.submitAnswer(params);

      // 更新答案状态
      final newStatus = result.isCorrect
          ? AnswerStatus.correct
          : AnswerStatus.wrong;

      // 更新会话状态（创建新对象，因为 PracticeSession 是不可变的）
      PracticeSession? updatedSession = state.session;
      if (updatedSession != null) {
        updatedSession = PracticeSession(
          id: updatedSession.id,
          studentId: updatedSession.studentId,
          sessionType: updatedSession.sessionType,
          targetId: updatedSession.targetId,
          textbookId: updatedSession.textbookId,
          questionCount: updatedSession.questionCount,
          answerCount: result.sessionProgress.answerCount,
          correctCount: result.sessionProgress.correctCount,
          status: result.sessionProgress.status,
          generateStatus: updatedSession.generateStatus,
          startTime: updatedSession.startTime,
          endTime: updatedSession.endTime,
          createTime: updatedSession.createTime,
          updateTime: updatedSession.updateTime,
          textbook: updatedSession.textbook,
        );
      }

      state = state.copyWith(
        answerStatus: {
          ...state.answerStatus,
          question.id: newStatus,
        },
        session: updatedSession,
        startTime: DateTime.now().millisecondsSinceEpoch,
        submitting: false,
      );

      return result;
    } catch (e) {
      state = state.copyWith(submitting: false);
      rethrow;
    }
  }

  /// 上一题
  void goPrev() {
    if (state.currentQuestionIndex > 0) {
      state = state.copyWith(
        currentQuestionIndex: state.currentQuestionIndex - 1,
        startTime: DateTime.now().millisecondsSinceEpoch,
      );
    }
  }

  /// 下一题
  void goNext() {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      state = state.copyWith(
        currentQuestionIndex: state.currentQuestionIndex + 1,
        startTime: DateTime.now().millisecondsSinceEpoch,
      );
    }
  }

  /// 完成练习
  Future<int> completePractice() async {
    final session = state.session;
    if (session == null) {
      throw Exception('会话不存在');
    }

    final reportId = await _repository.completePractice(session.id);

    // 重新加载会话以获取报告
    await loadSession(session.id);

    return reportId;
  }

  /// 重置状态
  void reset() {
    state = const SessionState();
  }

  /// 获取当前状态（公共方法，用于 Provider 访问）
  SessionState get currentState => state;
}

/// 练习会话状态 Provider (Riverpod 3.x compatible)
final sessionProvider = Provider<SessionNotifier>((ref) {
  return SessionNotifier();
});

/// 练习会话状态 Provider (用于访问状态)
final sessionStateProvider = Provider<SessionState>((ref) {
  return ref.watch(sessionProvider).currentState;
});

