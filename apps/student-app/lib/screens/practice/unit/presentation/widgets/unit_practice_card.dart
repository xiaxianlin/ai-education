import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/models/unit.dart';
import 'package:student_app/core/models/textbook.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/screens/practice/unit/providers/unit_practice_provider.dart';

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
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.2),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.book,
                    size: 32,
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        unit.name,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        unit.content.isNotEmpty
                            ? unit.content
                            : '本单元包含多个重点知识点，快来挑战吧！',
                        style: Theme.of(context).textTheme.bodySmall,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      // TODO: 显示知识点弹窗
                    },
                    icon: const Icon(Icons.lightbulb_outline, size: 18),
                    label: const Text('查看知识点'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onCreate,
                    icon: const Icon(Icons.play_arrow, size: 20),
                    label: const Text('开始练习'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
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
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.2),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.book,
                    size: 32,
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        unit.name,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'AI 正在为你精心准备练习题目，请稍候片刻～',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
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
                  '正在生成练习',
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

/// 进行中状态的单元卡片
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

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: Theme.of(context).colorScheme.primary,
          width: 2,
        ),
      ),
      color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.1),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.book,
                    size: 32,
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        unit.name,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '✨ 已完成 ${practice.answerCount}/${practice.questionCount} 题 · 正确 ${practice.correctCount} 题',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      // TODO: 显示知识点弹窗
                    },
                    icon: const Icon(Icons.lightbulb_outline, size: 18),
                    label: const Text('查看知识点'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
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
                      isCompleted ? Icons.visibility : Icons.play_arrow,
                      size: 20,
                    ),
                    label: Text(isCompleted ? '查看结果' : '继续练习'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
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

