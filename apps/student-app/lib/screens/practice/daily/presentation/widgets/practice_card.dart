import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/models/textbook.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/core/constants/profile_constants.dart';
import 'package:student_app/screens/practice/daily/providers/daily_practice_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 练习卡片组件
/// 根据练习状态显示不同的卡片内容
class PracticeCard extends ConsumerWidget {
  final Textbook textbook;
  final PracticeSession? practice;

  const PracticeCard({
    super.key,
    required this.textbook,
    this.practice,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final textbookTitle =
        '${ProfileConstants.getGradeName(textbook.grade)}${textbook.semester}';

    if (practice == null) {
      return WaitCard(
        title: textbookTitle,
        onCreate: () => _handleCreate(context, ref),
      );
    }

    final isGenerating = ref.watch(dailyPracticeStateProvider).isCreating ||
        practice!.generateStatus == PracticeConstants.generateStatusGenerating;

    if (isGenerating) {
      return GeneratingCard(title: textbookTitle);
    }

    return CompleteCard(
      session: practice!,
      textbookTitle: textbookTitle,
    );
  }

  Future<void> _handleCreate(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(dailyPracticeProvider).createPractice(textbook.id);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('创建练习失败: $e')),
        );
      }
    }
  }
}

/// 等待生成状态的练习卡片
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
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('✨', style: TextStyle(fontSize: 24)),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  '暂无今日练习',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: onCreate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  '立即生成',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 生成中状态的练习卡片
class GeneratingCard extends StatelessWidget {
  final String title;

  const GeneratingCard({
    super.key,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(
              width: 40,
              height: 40,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'AI 题目生成中...',
              style: TextStyle(
                fontSize: 13,
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 已完成状态的练习卡片
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
    
    final Color color = isCompleted ? AppColors.success : AppColors.primary;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: color.withValues(alpha: 0.2),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      isCompleted ? '🎉' : '📖',
                      style: const TextStyle(fontSize: 20),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        textbookTitle,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    isCompleted ? '已完成' : '进行中',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  '$answerCount/$questionCount 题 · 正确 $correctCount',
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton(
                onPressed: () {
                  context.push('/practice/session/${session.id}');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: color,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  isCompleted ? '查看结果' : '继续练习',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


