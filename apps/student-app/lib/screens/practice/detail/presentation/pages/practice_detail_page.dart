import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/screens/practice/detail/providers/detail_provider.dart';
import 'package:student_app/core/models/question.dart';
import 'package:student_app/core/models/practice_answer.dart';
import 'package:student_app/core/utils/practice_utils.dart';
import 'package:student_app/core/utils/formatters.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/screens/practice/detail/presentation/widgets/question_answer_card.dart';
import 'package:student_app/screens/practice/detail/presentation/widgets/report_summary.dart';

/// 练习详情页面
class PracticeDetailPage extends ConsumerWidget {
  final int sessionId;

  const PracticeDetailPage({
    super.key,
    required this.sessionId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(practiceDetailProvider(sessionId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('练习详情'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: detailAsync.when(
        data: (detail) {
          final session = detail.session;
          final questions = detail.questions;
          final answers = detail.answers;
          final report = detail.report;

          // 创建答案映射
          final answerMap = <int, PracticeAnswer>{};
          for (final answer in answers) {
            answerMap[answer.questionId] = answer;
          }

          // 按题目顺序排序（如果有 order 字段）
          final sortedQuestions = List<Question>.from(questions);
          sortedQuestions.sort((a, b) {
            final aOrder = a.order ?? 0;
            final bOrder = b.order ?? 0;
            return aOrder.compareTo(bOrder);
          });

          final isCompleted = session.status == PracticeConstants.statusCompleted;
          final isInProgress = session.status == PracticeConstants.statusInProgress;
          final statusText = PracticeUtils.getStatusText(session.status);
          final statusColor = PracticeUtils.getStatusColor(session.status);
          final practiceTypeName = PracticeUtils.getPracticeTypeName(session.sessionType);
          final accuracy = PracticeUtils.calculateAccuracy(
            session.answerCount,
            session.correctCount,
          );

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 会话信息卡片
                Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade300),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.shade200,
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 标题和状态
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            practiceTypeName,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: statusColor),
                            ),
                            child: Text(
                              statusText,
                              style: TextStyle(
                                fontSize: 14,
                                color: statusColor,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (session.textbook != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          '${session.textbook!.subject} ${session.textbook!.version} ${session.textbook!.grade}年级',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                      const SizedBox(height: 20),
                      // 统计信息
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildStatItem(
                            '总题数',
                            session.questionCount.toString(),
                            Colors.blue,
                          ),
                          _buildStatItem(
                            '已答题',
                            session.answerCount.toString(),
                            Colors.orange,
                          ),
                          _buildStatItem(
                            '正确数',
                            session.correctCount.toString(),
                            Colors.green,
                          ),
                        ],
                      ),
                      if (session.answerCount > 0) ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '正确率: ',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey.shade700,
                                ),
                              ),
                              Text(
                                '$accuracy%',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blue.shade700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      // 时间信息
                      const SizedBox(height: 16),
                      Text(
                        session.endTime != null
                            ? '完成时间: ${Formatters.formatDateTime(session.endTime!)}'
                            : '开始时间: ${Formatters.formatDateTime(session.startTime)}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      // 操作按钮
                      if (isInProgress) ...[
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              context.push('/practice/session/$sessionId');
                            },
                            icon: const Icon(Icons.play_arrow),
                            label: const Text('继续练习'),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                // 报告摘要（如果已完成）
                if (isCompleted && report != null)
                  ReportSummary(
                    report: report,
                    sessionType: session.sessionType,
                  ),
                // 题目列表
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '题目详情',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      if (sortedQuestions.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(40),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            children: [
                              const Text(
                                '📝',
                                style: TextStyle(fontSize: 48),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                '暂无题目',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '该练习还没有题目',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade500,
                                ),
                              ),
                            ],
                          ),
                        )
                      else
                        ...sortedQuestions.asMap().entries.map((entry) {
                          final index = entry.key;
                          final question = entry.value;
                          final answer = answerMap[question.id];
                          return QuestionAnswerCard(
                            question: question,
                            answer: answer,
                            index: index,
                          );
                        }),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                '❌',
                style: TextStyle(fontSize: 48),
              ),
              const SizedBox(height: 16),
              Text(
                '加载失败',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Text(
                  error.toString(),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade500,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  ref.invalidate(practiceDetailProvider(sessionId));
                },
                child: const Text('重试'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}

