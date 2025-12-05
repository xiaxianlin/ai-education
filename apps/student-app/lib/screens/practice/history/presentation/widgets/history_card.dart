import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/utils/practice_utils.dart';
import 'package:student_app/core/utils/formatters.dart';
import 'package:student_app/core/constants/practice_constants.dart';

/// 历史记录卡片组件
class HistoryCard extends StatelessWidget {
  final PracticeSession session;

  const HistoryCard({
    super.key,
    required this.session,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = session.status == PracticeConstants.statusCompleted;
    final isInProgress = session.status == PracticeConstants.statusInProgress;
    final accuracy = PracticeUtils.calculateAccuracy(
      session.answerCount,
      session.correctCount,
    );

    // 确定显示的时间
    final timeText = session.endTime != null
        ? Formatters.formatDateTime(session.endTime!)
        : Formatters.formatDateTime(session.startTime);

    final statusText = PracticeUtils.getStatusText(session.status);
    final statusColor = PracticeUtils.getStatusColor(session.status);
    final practiceTypeName = PracticeUtils.getPracticeTypeName(session.sessionType);

    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: Colors.grey.shade300,
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 头部信息
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            practiceTypeName,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: statusColor),
                            ),
                            child: Text(
                              statusText,
                              style: TextStyle(
                                fontSize: 12,
                                color: statusColor,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (session.textbook != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          '${session.textbook!.subject} ${session.textbook!.version} ${session.textbook!.grade}年级',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // 统计信息
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  context,
                  '总题数',
                  session.questionCount.toString(),
                  Colors.blue,
                ),
                _buildStatItem(
                  context,
                  '已答题',
                  session.answerCount.toString(),
                  Colors.orange,
                ),
                _buildStatItem(
                  context,
                  '正确数',
                  session.correctCount.toString(),
                  Colors.green,
                ),
              ],
            ),
            // 正确率
            if (session.answerCount > 0) ...[
              const SizedBox(height: 12),
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
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue.shade700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            // 时间信息
            const SizedBox(height: 12),
            Text(
              isCompleted && session.endTime != null
                  ? '完成: $timeText'
                  : isInProgress
                      ? '开始: $timeText'
                      : '创建: ${Formatters.formatRelativeTime(session.createTime)}',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
            // 操作按钮
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      context.push('/practice/detail/${session.id}');
                    },
                    icon: const Icon(Icons.visibility, size: 16),
                    label: const Text('详情'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                  ),
                ),
                if (!isCompleted) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        context.push('/practice/session/${session.id}');
                      },
                      icon: const Icon(Icons.play_arrow, size: 16),
                      label: const Text('继续'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String label,
    String value,
    Color color,
  ) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
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

