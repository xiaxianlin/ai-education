import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/screens/practice/session/providers/session_provider.dart';
import 'package:student_app/core/models/question_v2.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/text_input.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/choice_input.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/judge_input.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/audio_input.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/v2/drag_drop_widget.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/v2/connect_line_widget.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/v2/sort_order_widget.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/v2/handwriting_widget.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/fill_blank_input.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 答案输入面板（统一入口）
class AnswerPanel extends ConsumerWidget {
  const AnswerPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // 使用 select 只监听需要的状态，减少不必要的重建
    final question = ref.watch(
      sessionStateProvider.select((state) => state.currentQuestion),
    );
    if (question == null) {
      return const SizedBox.shrink();
    }

    final currentAnswer = ref.watch(
      sessionStateProvider.select((state) => state.currentAnswer),
    );
    final currentAudioAnswer = ref.watch(
      sessionStateProvider.select((state) => state.currentAudioAnswer),
    );
    final audioAnalysis = ref.watch(
      sessionStateProvider.select((state) => state.audioAnalysis[question.id]),
    );
    final answerStatus = ref.watch(
      sessionStateProvider.select((state) => state.currentAnswerStatus),
    );
    final hasAnswered = ref.watch(
      sessionStateProvider.select((state) => state.hasAnsweredCurrent),
    );
    final sessionId = ref.watch(
      sessionStateProvider.select((state) => state.session?.id ?? 0),
    );
    final sessionNotifier = ref.read(sessionProvider);

    // 解析音频分析结果
    bool? match;
    String? transcription;
    String? analysis;

    if (audioAnalysis != null) {
      // 简单解析，实际应该从 UploadRecordingResult 中获取
      match = audioAnalysis.contains('匹配') || audioAnalysis.contains('正确');
      transcription = audioAnalysis;
      analysis = audioAnalysis;
    }

    return Card(
      elevation: 4,
      shadowColor: Colors.black.withValues(alpha: 0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '您的答案：',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
            ),
            const SizedBox(height: 16),
            // 根据题目类型显示不同的输入组件
            _buildV2Input(
              context,
              question as QuestionV2,
              hasAnswered,
              answerStatus == AnswerStatus.correct,
              (answer) => sessionNotifier.setCurrentAnswer(answer),
              (audioPath) => sessionNotifier.setAudioAnswer(question.id, audioPath),
              (analysisData) => sessionNotifier.setAudioAnalysis(
                question.id,
                analysisData['reason'] ?? analysisData['transcription'] ?? '',
              ),
              sessionId,
              sessionNotifier,
              currentAnswer,
              currentAudioAnswer,
              transcription,
              match,
              analysis,
            ),
            
            // 答案解析部分 (仅在已答且错误时显示)
            if (hasAnswered && answerStatus == AnswerStatus.wrong) ...[
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 24),
              AnswerAnalysisWidget(
                correctAnswer: ref.watch(sessionStateProvider.select((s) => s.currentCorrectAnswer)),
                analysis: ref.watch(sessionStateProvider.select((s) => s.currentAnalysis)),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildV2Input(
    BuildContext context,
    QuestionV2 question,
    bool hasAnswered,
    bool? isCorrect,
    ValueChanged<dynamic> onAnswerChanged,
    ValueChanged<String> onAudioRecorded,
    ValueChanged<Map<String, dynamic>> onAudioAnalysisReceived,
    int sessionId,
    SessionNotifier notifier,
    dynamic currentAnswer,
    String? currentAudioAnswer,
    String? transcription,
    bool? match,
    String? analysis,
  ) {
    switch (question.questionTypeCode) {
      case 'single_choice':
      case 'multi_choice':
        return ChoiceInputWidget(
          question: question,
          value: currentAnswer is String ? currentAnswer : null,
          disabled: hasAnswered,
          hasAnswered: hasAnswered,
          isCorrect: isCorrect,
          onChanged: onAnswerChanged,
        );
      case 'drag_drop':
        return DragDropWidget(
          question: question,
          value: currentAnswer,
          disabled: hasAnswered,
          onChanged: onAnswerChanged,
        );
      case 'connect_line':
        return ConnectLineWidget(
          question: question,
          value: currentAnswer,
          disabled: hasAnswered,
          onChanged: onAnswerChanged,
        );
      case 'sort_order':
        return SortOrderWidget(
          question: question,
          value: currentAnswer,
          disabled: hasAnswered,
          onChanged: onAnswerChanged,
        );
      case 'handwriting':
        return HandwritingWidget(
          question: question,
          value: currentAnswer,
          disabled: hasAnswered,
          onChanged: onAnswerChanged,
        );
      case 'voice_input':
        return AudioInputWidget(
          question: question,
          sessionId: sessionId,
          audioPath: currentAudioAnswer,
          transcription: transcription,
          match: match,
          analysis: analysis,
          disabled: hasAnswered,
          onAudioRecorded: onAudioRecorded,
          onAnalysisReceived: onAudioAnalysisReceived,
        );
      case 'fill_blank':
        // 获取填空数量（从题目的 blanks 字段或默认为1）
        final blanksCount = question.blanks?.length ?? 1;
        final values = currentAnswer is List<String>
            ? currentAnswer
            : currentAnswer is String
                ? [currentAnswer]
                : null;
        return FillBlankInput(
          question: question,
          values: values,
          blanksCount: blanksCount,
          disabled: hasAnswered,
          onChanged: onAnswerChanged,
        );
      case 'text_input':
        return TextInputWidget(
          question: question,
          value: currentAnswer is String ? currentAnswer : null,
          disabled: hasAnswered,
          onChanged: onAnswerChanged,
        );
      default:
        return const Center(child: Text('暂不支持此题型 (V2)'));
    }
  }
}

/// 答案解析组件
class AnswerAnalysisWidget extends StatelessWidget {
  final dynamic correctAnswer;
  final String? analysis;

  const AnswerAnalysisWidget({
    super.key,
    this.correctAnswer,
    this.analysis,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (correctAnswer != null && correctAnswer!.isNotEmpty) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.success.withValues(alpha: 0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.check_circle_outline, color: AppColors.success, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      '正确答案',
                      style: TextStyle(
                        color: AppColors.success.withValues(alpha: 0.8),
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  correctAnswer is String ? correctAnswer! : correctAnswer.toString(),
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
        if (analysis != null && analysis!.isNotEmpty) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.warning.withValues(alpha: 0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.lightbulb_outline, color: AppColors.warning, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      '解析',
                      style: TextStyle(
                        color: AppColors.warning.withValues(alpha: 0.8),
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  analysis!,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 15,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}


