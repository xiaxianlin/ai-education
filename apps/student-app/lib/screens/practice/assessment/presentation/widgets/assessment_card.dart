import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/models/textbook.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/core/constants/profile_constants.dart';
import 'package:student_app/screens/practice/assessment/providers/assessment_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// 评测卡片组件
/// 根据评测状态显示不同的卡片内容
class AssessmentCard extends ConsumerWidget {
  final Textbook textbook;
  final PracticeSession? assessment;

  const AssessmentCard({
    super.key,
    required this.textbook,
    this.assessment,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textbookTitle =
        '${ProfileConstants.getGradeName(textbook.grade)}${textbook.semester}';

    if (assessment == null) {
      return WaitCard(
        title: textbookTitle,
        onCreate: () => _handleCreate(context, ref),
      );
    }

    final isGenerating = ref.watch(assessmentStateProvider).isCreating ||
        assessment!.generateStatus == PracticeConstants.generateStatusGenerating;

    if (isGenerating) {
      return GeneratingCard(title: textbookTitle);
    }

    return CompleteCard(
      session: assessment!,
      textbookTitle: textbookTitle,
    );
  }

  Future<void> _handleCreate(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(assessmentProvider).createPractice(textbook.id);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('创建评测失败: $e')),
        );
      }
    }
  }
}

/// 等待生成状态的评测卡片
class WaitCard extends StatelessWidget {
  final String title;
  final VoidCallback onCreate;

  const WaitCard({
    super.key,
    required this.title,
    required this.onCreate,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(
          color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
          width: 2,
        ),
      ),
      child: Container(
        constraints: const BoxConstraints(minHeight: 280),
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        '🎯',
                        style: TextStyle(fontSize: 32),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        title,
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    '还没有为这本教材生成综合评估，点击下方按钮，一键生成评测题目。',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                        ),
                  ),
                ],
              ),
            ),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: onCreate,
                icon: const Icon(Icons.auto_awesome, size: 20),
                label: const Text(
                  '生成综合评估',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 生成中状态的评测卡片
class GeneratingCard extends StatelessWidget {
  final String title;

  const GeneratingCard({
    super.key,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(
          color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
          width: 2,
        ),
      ),
      child: Container(
        constraints: const BoxConstraints(minHeight: 280),
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0.0, end: 1.0),
                        duration: const Duration(milliseconds: 1500),
                        builder: (context, value, child) {
                          return Transform.translate(
                            offset: Offset(0, -20 * (value - 0.5).abs() * 2),
                            child: const Text(
                              '⚡',
                              style: TextStyle(fontSize: 32),
                            ),
                          );
                        },
                        onEnd: () {},
                      ),
                      const SizedBox(width: 8),
                      Text(
                        title,
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'AI 正在为你精心准备评测题目，请稍候片刻～',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                        ),
                  ),
                ],
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '正在生成评测',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// 已完成状态的评测卡片
class CompleteCard extends StatelessWidget {
  final PracticeSession session;
  final String textbookTitle;

  const CompleteCard({
    super.key,
    required this.session,
    required this.textbookTitle,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = session.status == PracticeConstants.statusCompleted;
    final answerCount = session.answerCount;
    final questionCount = session.questionCount;
    final correctCount = session.correctCount;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(
          color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
          width: 2,
        ),
      ),
      child: Container(
        constraints: const BoxConstraints(minHeight: 280),
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        isCompleted ? '🎉' : '🎯',
                        style: const TextStyle(fontSize: 32),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          textbookTitle,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    '综合评估已为你准备完成，随时可以开始答题或继续完成剩余题目。',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                        ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '✨ 已完成 $answerCount/$questionCount 题 · 正确 $correctCount 题',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w500,
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                        ),
                  ),
                ],
              ),
            ),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: () {
                  context.push('/practice/session/${session.id}');
                },
                icon: Icon(
                  isCompleted ? Icons.visibility : Icons.play_arrow,
                  size: 20,
                ),
                label: Text(
                  isCompleted ? '查看结果' : '开始评测',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

