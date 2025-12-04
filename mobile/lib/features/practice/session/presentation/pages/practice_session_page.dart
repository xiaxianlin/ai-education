import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/session_provider.dart';
import '../../../../../core/utils/error_handler.dart';
import 'start_panel.dart';
import 'result_panel.dart';
import '../widgets/question_card.dart';
import '../widgets/answer_panel.dart';
import '../widgets/progress_indicator.dart';
import '../widgets/navigation_buttons.dart';

/// 练习会话主页面
class PracticeSessionPage extends ConsumerStatefulWidget {
  final String sessionId;

  const PracticeSessionPage({
    super.key,
    required this.sessionId,
  });

  @override
  ConsumerState<PracticeSessionPage> createState() => _PracticeSessionPageState();
}

class _PracticeSessionPageState extends ConsumerState<PracticeSessionPage> {
  @override
  void initState() {
    super.initState();
    // 加载会话
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final sessionId = int.tryParse(widget.sessionId);
      if (sessionId != null) {
        ref.read(sessionProvider).loadSession(sessionId);
      }
    });
  }

  /// 获取练习类型名称
  String _getPracticeTypeName(String? sessionType) {
    switch (sessionType) {
      case 'daily_practice':
        return '每日练习';
      case 'unit_practice':
        return '单元练习';
      case 'assessment':
        return '能力评测';
      default:
        return '练习';
    }
  }

  @override
  Widget build(BuildContext context) {
    // 使用 select 只监听需要的状态，减少不必要的重建
    final loading = ref.watch(sessionStateProvider.select((state) => state.loading));
    final report = ref.watch(sessionStateProvider.select((state) => state.report));
    final session = ref.watch(sessionStateProvider.select((state) => state.session));
    final currentQuestionIndex = ref.watch(
      sessionStateProvider.select((state) => state.currentQuestionIndex),
    );
    final totalQuestions = ref.watch(
      sessionStateProvider.select((state) => state.totalQuestions),
    );
    final answeredCount = ref.watch(
      sessionStateProvider.select((state) => state.answeredCount),
    );
    final currentQuestion = ref.watch(
      sessionStateProvider.select((state) => state.currentQuestion),
    );
    final currentAnswerStatus = ref.watch(
      sessionStateProvider.select((state) => state.currentAnswerStatus),
    );
    final submitting = ref.watch(
      sessionStateProvider.select((state) => state.submitting),
    );
    final hasAnsweredCurrent = ref.watch(
      sessionStateProvider.select((state) => state.hasAnsweredCurrent),
    );
    final currentAnswer = ref.watch(
      sessionStateProvider.select((state) => state.currentAnswer),
    );
    final currentAudioAnswer = ref.watch(
      sessionStateProvider.select((state) => state.currentAudioAnswer),
    );
    final isLastQuestion = ref.watch(
      sessionStateProvider.select((state) => state.isLastQuestion),
    );

    // 加载中
    if (loading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    // 显示结果
    if (report != null) {
      return const ResultPanel();
    }

    // 会话不存在或题目不存在
    if (session == null || currentQuestion == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('练习会话'),
        ),
        body: const Center(
          child: Text('会话或题目不存在'),
        ),
      );
    }

    // 未开始（显示开始面板）
    if (session.status == 0) {
      return const StartPanel();
    }

    // 进行中（显示题目步骤）
    final practiceType = _getPracticeTypeName(session.sessionType);
    final sessionNotifier = ref.read(sessionProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(practiceType),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 进度指示器
            ProgressIndicatorWidget(
              currentIndex: currentQuestionIndex,
              totalQuestions: totalQuestions,
              answeredCount: answeredCount,
              practiceType: practiceType,
            ),
            const SizedBox(height: 16),
            // 题目卡片
            QuestionCard(
              question: currentQuestion!,
              index: currentQuestionIndex,
              answerStatus: currentAnswerStatus,
            ),
            const SizedBox(height: 16),
            // 答案输入面板
            const AnswerPanel(),
            const SizedBox(height: 16),
            // 导航按钮
            NavigationButtons(
              canGoPrevious: currentQuestionIndex > 0,
              hasAnswered: hasAnsweredCurrent,
              hasAnswer: currentQuestion?.type == 'oral'
                  ? currentAudioAnswer != null
                  : currentAnswer != null,
              submitting: submitting,
              isLastQuestion: isLastQuestion,
              onPrevious: () {
                sessionNotifier.goPrev();
              },
              onNext: () {
                sessionNotifier.goNext();
              },
              onSubmit: () async {
                try {
                  final result = await sessionNotifier.submitAnswer();
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(result.isCorrect ? '回答正确！' : '回答错误'),
                        backgroundColor: result.isCorrect ? Colors.green : Colors.red,
                      ),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('提交答案失败: ${ErrorHandler.getErrorMessage(e)}'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              onComplete: () async {
                // 显示确认对话框
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('确认完成'),
                    content: const Text('确定要完成练习吗？完成后将无法继续答题。'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        child: const Text('取消'),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).pop(true),
                        child: const Text('确定'),
                      ),
                    ],
                  ),
                );

                if (confirmed == true && mounted) {
                  try {
                    await sessionNotifier.completePractice();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('练习已完成！'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('完成练习失败: ${ErrorHandler.getErrorMessage(e)}'),
                          backgroundColor: Colors.red,
                        ),
                      );
                    }
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

