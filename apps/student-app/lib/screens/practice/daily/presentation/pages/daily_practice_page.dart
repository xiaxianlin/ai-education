import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/screens/practice/daily/providers/daily_practice_provider.dart';
import 'package:student_app/screens/profile/providers/profile_provider.dart';
import 'package:student_app/screens/practice/daily/presentation/widgets/practice_card.dart';
import 'package:student_app/screens/practice/daily/presentation/widgets/subject_tabs.dart';
import 'package:student_app/core/models/practice_session.dart';

/// 每日练习页面
class DailyPracticePage extends ConsumerStatefulWidget {
  const DailyPracticePage({super.key});

  @override
  ConsumerState<DailyPracticePage> createState() => _DailyPracticePageState();
}

class _DailyPracticePageState extends ConsumerState<DailyPracticePage> {
  @override
  void initState() {
    super.initState();
    // 确保个人中心数据已加载
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final profileNotifier = ref.read(profileProvider);
      final dailyNotifier = ref.read(dailyPracticeProvider);
      
      if (ref.read(profileStateProvider).student == null) {
        await profileNotifier.getProfile();
      }
      
      final textbooks = ref.read(profileStateProvider).activeTextbooks;
      if (textbooks.isNotEmpty) {
        dailyNotifier.fetchDailyPractice(textbooks);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileStateProvider);
    final dailyPracticeState = ref.watch(dailyPracticeStateProvider);
    final activeTextbooks = profileState.activeTextbooks;

    return Scaffold(
      appBar: AppBar(
        title: const Text('每日练习'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(profileProvider).refresh();
          final textbooks = ref.read(profileStateProvider).activeTextbooks;
          if (textbooks.isNotEmpty) {
            await ref.read(dailyPracticeProvider).fetchDailyPractice(textbooks);
          }
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 顶部介绍卡片
              _buildIntroCard(context),
              const SizedBox(height: 16),

              // 未选择教材的空状态提示
              if (activeTextbooks.isEmpty) ...[
                _buildEmptyState(context),
              ] else ...[
                // 主体：按学科分组的练习卡片
                SizedBox(
                  height: MediaQuery.of(context).size.height * 0.6,
                  child: SubjectTabs(
                    builder: (subject) {
                      final textbooks = activeTextbooks
                          .where((t) => t.subject == subject)
                          .toList();

                      return GridView.builder(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 0.85,
                        ),
                        itemCount: textbooks.length,
                        itemBuilder: (context, index) {
                          final textbook = textbooks[index];
                          final practice = dailyPracticeState.practices.firstWhere(
                            (p) => p.textbookId == textbook.id,
                            orElse: () => _createEmptyPractice(textbook.id),
                          );

                          return PracticeCard(
                            textbook: textbook,
                            practice: practice.id == 0 ? null : practice,
                          );
                        },
                      );
                    },
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  /// 创建空的练习对象（用于占位）
  PracticeSession _createEmptyPractice(int textbookId) {
    return PracticeSession(
      id: 0,
      studentId: '',
      sessionType: 'daily_practice',
      textbookId: textbookId,
      questionCount: 0,
      answerCount: 0,
      correctCount: 0,
      status: 0,
      generateStatus: 0,
      startTime: 0,
      createTime: 0,
    );
  }

  /// 顶部介绍卡片
  Widget _buildIntroCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withValues(alpha: 0.1),
            AppColors.primary.withValues(alpha: 0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.2),
          width: 1.5,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  '📅',
                  style: TextStyle(fontSize: 36),
                ),
                const SizedBox(width: 12),
                Text(
                  '每日练习',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              '根据你已选教材，智能生成当天的练习任务，帮你保持学习节奏。✨',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  /// 空状态提示
  Widget _buildEmptyState(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 32),
      decoration: BoxDecoration(
        color: AppColors.muted,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          const Text(
            '📖',
            style: TextStyle(fontSize: 56),
          ),
          const SizedBox(height: 20),
          Text(
            '还没有选教材呢',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            '去设置里选择你的学习教材，系统就能为你生成每日练习啦～',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.6,
                ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              // TODO: 跳转到设置或个人中心
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('去选教材'),
          ),
        ],
      ),
    );
  }
}


