import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/utils/practice_utils.dart';
import 'package:student_app/core/utils/formatters.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 历史记录卡片组件
/// UI 对齐 student-web 设计
class HistoryCard extends StatelessWidget {
  final PracticeSession session;
  final String? practiceName;
  final String? practiceIcon;

  const HistoryCard({
    super.key,
    required this.session,
    this.practiceName,
    this.practiceIcon,
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
        : session.startTime > 0
            ? Formatters.formatDateTime(session.startTime)
            : Formatters.formatRelativeTime(session.createTime);

    final statusText = PracticeUtils.getStatusText(session.status);
    final practiceTypeName = practiceName ?? PracticeUtils.getPracticeTypeName(session.sessionType);
    final icon = practiceIcon ?? _getDefaultIcon(session.sessionType);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Colors.white,
          width: 4,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header - Icon, Name, Time, Status
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon
                Text(
                  icon,
                  style: const TextStyle(fontSize: 32),
                ),
                const SizedBox(width: 12),
                // Name and Time
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        practiceTypeName,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        timeText,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                          color: AppColors.textSecondary.withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ),
                // Status Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getStatusBgColor(isCompleted, isInProgress),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _getStatusBorderColor(isCompleted, isInProgress),
                    ),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: _getStatusTextColor(isCompleted, isInProgress),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Stats Grid - 2 columns
            Row(
              children: [
                // Total Questions
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.muted.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        Text(
                          session.questionCount.toString(),
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '总题数',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textSecondary.withValues(alpha: 0.6),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Accuracy
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        Text(
                          '$accuracy%',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '正确率',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary.withValues(alpha: 0.6),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            
            // Progress Bar (if in progress)
            if (isInProgress) ...[
              const SizedBox(height: 16),
              Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '进度',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      Text(
                        '${session.answerCount} / ${session.questionCount}',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: session.questionCount > 0
                          ? session.answerCount / session.questionCount
                          : 0,
                      minHeight: 8,
                      backgroundColor: AppColors.muted.withValues(alpha: 0.5),
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                ],
              ),
            ],
            
            const SizedBox(height: 20),
            
            // Action Buttons
            Row(
              children: [
                // View Detail Button
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      context.push('/practice/detail/${session.id}');
                    },
                    icon: const Icon(Icons.visibility_outlined, size: 16),
                    label: const Text('详情'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.textPrimary,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: BorderSide(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        width: 2,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      textStyle: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
                if (!isCompleted) ...[
                  const SizedBox(width: 12),
                  // Continue/Start Button
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        context.push('/practice/session/${session.id}');
                      },
                      icon: const Icon(Icons.play_arrow, size: 16),
                      label: Text(isInProgress ? '继续' : '开始'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        elevation: 4,
                        shadowColor: AppColors.primary.withValues(alpha: 0.2),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        textStyle: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                        ),
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

  String _getDefaultIcon(String? sessionType) {
    switch (sessionType) {
      case 'daily_practice':
        return '📅';
      case 'unit_practice':
        return '📚';
      case 'assessment':
        return '🎯';
      default:
        return '📝';
    }
  }

  Color _getStatusBgColor(bool isCompleted, bool isInProgress) {
    if (isCompleted) return Colors.green.shade100;
    if (isInProgress) return AppColors.primary.withValues(alpha: 0.1);
    return AppColors.muted;
  }

  Color _getStatusBorderColor(bool isCompleted, bool isInProgress) {
    if (isCompleted) return Colors.green.shade200;
    if (isInProgress) return AppColors.primary.withValues(alpha: 0.2);
    return AppColors.border;
  }

  Color _getStatusTextColor(bool isCompleted, bool isInProgress) {
    if (isCompleted) return Colors.green.shade600;
    if (isInProgress) return AppColors.primary;
    return AppColors.textSecondary;
  }
}
