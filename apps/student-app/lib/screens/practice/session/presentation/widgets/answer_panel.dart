import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/screens/practice/session/providers/session_provider.dart';
import 'package:student_app/core/models/question.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/text_input.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/choice_input.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/judge_input.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/answer_input/audio_input.dart';

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
            _buildInputByType(
              context,
              question: question,
              currentAnswer: currentAnswer,
              currentAudioAnswer: currentAudioAnswer,
              transcription: transcription,
              match: match,
              analysis: analysis,
              hasAnswered: hasAnswered,
              isCorrect: answerStatus == AnswerStatus.correct,
              onAnswerChanged: (answer) {
                sessionNotifier.setCurrentAnswer(answer);
              },
              onAudioRecorded: (audioPath) {
                sessionNotifier.setCurrentAudioAnswer(audioPath);
              },
              onAudioAnalysisReceived: (analysisData) {
                sessionNotifier.setCurrentAudioAnalysis(
                  analysisData['reason'] ?? analysisData['transcription'] ?? '',
                );
              },
              sessionId: sessionId,
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

  Widget _buildInputByType(
    BuildContext context, {
    required Question question,
    String? currentAnswer,
    String? currentAudioAnswer,
    String? transcription,
    bool? match,
    String? analysis,
    required bool hasAnswered,
    bool? isCorrect,
    required ValueChanged<String> onAnswerChanged,
    required ValueChanged<String> onAudioRecorded,
    required ValueChanged<Map<String, dynamic>> onAudioAnalysisReceived,
    required int sessionId,
  }) {
    switch (question.type) {
      case 'fill':
        return TextInputWidget(
          question: question,
          value: currentAnswer,
          disabled: hasAnswered,
          onChanged: onAnswerChanged,
        );
      case 'choice':
        return ChoiceInputWidget(
          question: question,
          value: currentAnswer,
          disabled: hasAnswered,
          hasAnswered: hasAnswered,
          isCorrect: isCorrect,
          onChanged: onAnswerChanged,
        );
      case 'judge':
        return JudgeInputWidget(
          question: question,
          value: currentAnswer,
          disabled: hasAnswered,
          hasAnswered: hasAnswered,
          isCorrect: isCorrect,
          onChanged: onAnswerChanged,
        );
      case 'oral':
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
      default:
        return TextInputWidget(
          question: question,
          value: currentAnswer,
          disabled: hasAnswered,
          onChanged: onAnswerChanged,
        );
    }
  }
}

/// 答案解析组件
class AnswerAnalysisWidget extends StatelessWidget {
  final String? correctAnswer;
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
                  correctAnswer!,
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


