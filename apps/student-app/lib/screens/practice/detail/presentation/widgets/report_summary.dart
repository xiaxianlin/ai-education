import 'package:flutter/material.dart';
import 'package:student_app/core/models/practice_report.dart';
import 'package:student_app/core/utils/formatters.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 报告摘要组件
class ReportSummary extends StatelessWidget {
  final PracticeReport report;
  final String? sessionType;

  const ReportSummary({
    super.key,
    required this.report,
    this.sessionType,
  });

  @override
  Widget build(BuildContext context) {
    final accuracy = report.totalQuestions > 0
        ? ((report.correctQuestions / report.totalQuestions) * 100).round()
        : 0;
    final wrongQuestions = report.totalQuestions - report.correctQuestions;

    return Card(
      elevation: 4,
      shadowColor: Colors.black.withValues(alpha: 0.1),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: AppColors.primary.withValues(alpha: 0.1), width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // 标题
            Center(
              child: Column(
                children: [
                  const Text('🎉', style: TextStyle(fontSize: 48)),
                  const SizedBox(height: 8),
                  Text(
                    '练习报告',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // 统计信息网格
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.3,
              children: [
                _buildStatBox(
                  context,
                  icon: Icons.check_circle,
                  value: report.correctQuestions.toString(),
                  label: '正确题数',
                  color: AppColors.success,
                  bgColor: AppColors.success.withValues(alpha: 0.1),
                ),
                _buildStatBox(
                  context,
                  icon: Icons.cancel,
                  value: wrongQuestions.toString(),
                  label: '错误题数',
                  color: AppColors.error,
                  bgColor: AppColors.error.withValues(alpha: 0.1),
                ),
                _buildStatBox(
                  context,
                  icon: Icons.emoji_events,
                  value: report.overallScore.toStringAsFixed(1),
                  label: '总分',
                  color: AppColors.primary,
                  bgColor: AppColors.primary.withValues(alpha: 0.1),
                ),
                _buildStatBox(
                  context,
                  icon: Icons.timer,
                  value: Formatters.formatDuration(report.totalTime),
                  label: '总用时',
                  color: const Color(0xFFF59E0B),
                  bgColor: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                  smallerValue: true,
                ),
              ],
            ),
            const SizedBox(height: 24),

            // 正确率
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.success.withValues(alpha: 0.15),
                    const Color(0xFF10B981).withValues(alpha: 0.1),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.success.withValues(alpha: 0.2)),
              ),
              child: Column(
                children: [
                  Text(
                    '$accuracy%',
                    style: const TextStyle(
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                      color: AppColors.success,
                    ),
                  ),
                  const Text(
                    '正确率',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.success,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

            // 综合评估 (精美版)
            if (sessionType == PracticeConstants.typeAssessment && report.currentAbility != null) ...[
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.1)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.trending_up, color: AppColors.primary, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          '综合评估',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary.withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    if (report.abilityLevel != null) ...[
                      Text(
                        report.abilityLevel!,
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    Text(
                      '能力值: ${report.currentAbility!.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    if (report.percentile != null && report.percentile! > 0) ...[
                      const SizedBox(height: 4),
                      Text(
                        '超过 ${(report.percentile! * 100).toStringAsFixed(1)}% 的同学',
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatBox(
    BuildContext context, {
    required IconData icon,
    required String value,
    required String label,
    required Color color,
    required Color bgColor,
    bool smallerValue = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.1), width: 1.5),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: smallerValue ? 18 : 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color.withValues(alpha: 0.8),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}


