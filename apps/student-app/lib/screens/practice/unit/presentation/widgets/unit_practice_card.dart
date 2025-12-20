import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/models/unit.dart';
import 'package:student_app/core/models/textbook.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/screens/practice/unit/providers/unit_practice_provider.dart';
import 'knowledge_dialog.dart';

/// 单元练习卡片组件
class UnitPracticeCard extends ConsumerWidget {
  final Unit unit;
  final Textbook textbook;
  final PracticeSession? practice;

  const UnitPracticeCard({
    super.key,
    required this.unit,
    required this.textbook,
    this.practice,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unitPracticeState = ref.watch(unitPracticeStateProvider);
    final isCreating = unitPracticeState.isCreating;
    final isGenerating = isCreating ||
        (practice != null &&
            practice!.generateStatus ==
                PracticeConstants.generateStatusGenerating);

    if (practice == null && !isCreating) {
      return WaitCard(
        unit: unit,
        textbook: textbook,
        onCreate: () => _handleCreate(context, ref),
      );
    }

    if (isGenerating) {
      return GeneratingCard(unit: unit);
    }

    return InProgressCard(
      unit: unit,
      practice: practice!,
      textbook: textbook,
    );
  }

  Future<void> _handleCreate(BuildContext context, WidgetRef ref) async {
    try {
      await ref
          .read(unitPracticeProvider)
          .createPractice(textbook.id, unit.id);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('创建练习失败: $e')),
        );
      }
    }
  }
}

/// 等待生成状态的单元卡片
class WaitCard extends StatelessWidget {
  final Unit unit;
  final Textbook textbook;
  final VoidCallback onCreate;

  const WaitCard({
    super.key,
    required this.unit,
    required this.textbook,
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
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Expanded(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('✨', style: TextStyle(fontSize: 32)),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          unit.name,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    unit.content.isNotEmpty
                        ? unit.content
                        : '本单元包含多个重点知识点，快来挑战吧！',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                        ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => KnowledgeDialog.show(context, unit.id, unit.name),
                    icon: const Icon(Icons.lightbulb_outline, size: 20),
                    label: const Text('知识点'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onCreate,
                    icon: const Icon(Icons.auto_awesome, size: 20),
                    label: const Text('开始'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
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

/// 生成中状态的单元卡片
class GeneratingCard extends StatelessWidget {
  final Unit unit;

  const GeneratingCard({
    super.key,
    required this.unit,
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
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Expanded(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('⏳', style: TextStyle(fontSize: 32)),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          unit.name,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'AI 正在为你精心准备练习题目，请稍候片刻～',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                        ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '正在创建练习',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.bold,
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

/// 练习中/已完成状态的单元卡片
class InProgressCard extends StatelessWidget {
  final Unit unit;
  final PracticeSession practice;
  final Textbook textbook;

  const InProgressCard({
    super.key,
    required this.unit,
    required this.practice,
    required this.textbook,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = practice.status == PracticeConstants.statusCompleted;
    final emoji = isCompleted ? '🎉' : '📝';
    final cardColor = isCompleted
        ? Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.1)
        : Theme.of(context).colorScheme.secondaryContainer.withValues(alpha: 0.1);
    final borderColor = isCompleted
        ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.3)
        : Theme.of(context).colorScheme.secondary.withValues(alpha: 0.3);

    return Card(
      elevation: 4,
      color: cardColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(
          color: borderColor,
          width: 2,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Expanded(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(emoji, style: const TextStyle(fontSize: 32)),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          unit.name,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    isCompleted
                        ? '本单元练习已完成，查看报告或重新生成新练习。'
                        : '正在进行中，随时可以继续完成剩余题目。',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '✨ 已完成 ${practice.answerCount}/${practice.questionCount} 题 · 正确 ${practice.correctCount} 题',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => KnowledgeDialog.show(context, unit.id, unit.name),
                    icon: const Icon(Icons.lightbulb_outline, size: 20),
                    label: const Text('知识点'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      context.push('/practice/session/${practice.id}');
                    },
                    icon: Icon(
                      isCompleted ? Icons.description_outlined : Icons.play_arrow,
                      size: 20,
                    ),
                    label: Text(isCompleted ? '报告' : '继续'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
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


