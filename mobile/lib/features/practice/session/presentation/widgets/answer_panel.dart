import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/session_provider.dart';
import '../../../../../core/models/question.dart';
import 'answer_input/text_input.dart';
import 'answer_input/choice_input.dart';
import 'answer_input/judge_input.dart';
import 'answer_input/audio_input.dart';

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
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '您的答案：',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
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
              onAnalysisReceived: (analysisData) {
                sessionNotifier.setCurrentAudioAnalysis(
                  analysisData['reason'] ?? analysisData['transcription'] ?? '',
                );
              },
              sessionId: sessionId,
            ),
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
    required ValueChanged<Map<String, dynamic>> onAnalysisReceived,
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
          onAnalysisReceived: onAnalysisReceived,
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

/// 用于传递 sessionId 的包装组件
class _AudioInputWithSessionId extends InheritedWidget {
  final int sessionId;

  const _AudioInputWithSessionId({
    required this.sessionId,
    required super.child,
  });

  @override
  bool updateShouldNotify(_AudioInputWithSessionId oldWidget) {
    return sessionId != oldWidget.sessionId;
  }
}

