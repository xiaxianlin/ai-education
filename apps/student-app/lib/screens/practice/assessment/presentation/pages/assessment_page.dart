import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/screens/practice/assessment/providers/assessment_provider.dart';
import 'package:student_app/screens/profile/providers/profile_provider.dart';
import 'package:student_app/screens/practice/daily/presentation/widgets/subject_tabs.dart';
import 'package:student_app/screens/practice/assessment/presentation/widgets/assessment_card.dart';
import 'package:student_app/core/models/practice_session.dart';

/// 能力评测页面
class AssessmentPage extends ConsumerStatefulWidget {
  const AssessmentPage({super.key});

  @override
  ConsumerState<AssessmentPage> createState() => _AssessmentPageState();
}

class _AssessmentPageState extends ConsumerState<AssessmentPage> {
  @override
  void initState() {
    super.initState();
    // 确保个人中心数据已加载
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final profileNotifier = ref.read(profileProvider);
      final assessmentNotifier = ref.read(assessmentProvider);
      
      if (ref.read(profileStateProvider).student == null) {
        await profileNotifier.getProfile();
      }
      
      final textbooks = ref.read(profileStateProvider).activeTextbooks;
      if (textbooks.isNotEmpty) {
        assessmentNotifier.fetchAssessment(textbooks);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileStateProvider);
    final assessmentState = ref.watch(assessmentStateProvider);
    final activeTextbooks = profileState.activeTextbooks;

    return Scaffold(
      appBar: AppBar(
        title: const Text('综合评估'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(profileProvider).refresh();
          final textbooks = ref.read(profileStateProvider).activeTextbooks;
          if (textbooks.isNotEmpty) {
            await ref.read(assessmentProvider).fetchAssessment(textbooks);
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
                // 主体：按学科分组的评测卡片
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
                          final assessment = assessmentState.assessments.firstWhere(
                            (p) => p.textbookId == textbook.id,
                            orElse: () => _createEmptyAssessment(textbook.id),
                          );

                          return AssessmentCard(
                            textbook: textbook,
                            assessment: assessment.id == 0 ? null : assessment,
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

  /// 创建空的评测对象（用于占位）
  PracticeSession _createEmptyAssessment(int textbookId) {
    return PracticeSession(
      id: 0,
      studentId: '',
      sessionType: 'assessment',
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
            const Color(0xFFF59E0B).withValues(alpha: 0.1),
            const Color(0xFFF59E0B).withValues(alpha: 0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
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
                  '🎯',
                  style: TextStyle(fontSize: 36),
                ),
                const SizedBox(width: 12),
                Text(
                  '综合评估',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              '全面检测你对当前教材的掌握程度，发现薄弱环节，查漏补缺。🚀',
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
            '去设置里选择你的学习教材，系统就能为你生成综合评估啦～',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.6,
                ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              // TODO: 跳转到系统设置或个人中心
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


