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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profileState = ref.read(profileStateProvider);
      if (profileState.student == null) {
        ref.read(profileProvider).getProfile();
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
          await Future.wait<void>([
            ref.read(profileProvider).refresh(),
            ref.read(dailyPracticeProvider).fetchDailyPractice(),
          ]);
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
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  '📅',
                  style: TextStyle(fontSize: 32),
                ),
                const SizedBox(width: 8),
                Text(
                  '每日练习',
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '根据你已选教材，智能生成当天的练习任务，帮你保持学习节奏。',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                  ),
            ),
          ],
        ),
      ),
    );
  }

  /// 空状态提示
  Widget _buildEmptyState(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(
          color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.3),
          width: 2,
        ),
      ),
      color: Theme.of(context).colorScheme.secondaryContainer.withValues(alpha: 0.3),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
        child: Column(
          children: [
            const Text(
              '📖',
              style: TextStyle(fontSize: 48),
            ),
            const SizedBox(height: 16),
            Text(
              '还没有选教材呢',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              '去设置里选择你的学习教材，系统就能为你生成每日练习啦～',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

