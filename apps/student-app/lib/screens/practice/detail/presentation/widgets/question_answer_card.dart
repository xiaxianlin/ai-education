import 'package:flutter/material.dart';
import 'package:student_app/core/models/question.dart';
import 'package:student_app/core/models/practice_answer.dart';
import 'package:student_app/core/utils/practice_utils.dart';
import 'package:student_app/core/utils/formatters.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 题目答案卡片组件
class QuestionAnswerCard extends StatefulWidget {
  final Question question;
  final PracticeAnswer? answer;
  final int index;

  const QuestionAnswerCard({
    super.key,
    required this.question,
    this.answer,
    required this.index,
  });

  @override
  State<QuestionAnswerCard> createState() => _QuestionAnswerCardState();
}

class _QuestionAnswerCardState extends State<QuestionAnswerCard> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    final status = widget.answer?.status ?? PracticeConstants.answerStatusNotAnswered;
    final hasAnswer = status != PracticeConstants.answerStatusNotAnswered;
    final isCorrect = status == PracticeConstants.answerStatusCorrect;
    final statusText = PracticeUtils.getAnswerStatusText(status);
    final statusColor = hasAnswer 
        ? (isCorrect ? AppColors.success : AppColors.error)
        : AppColors.textSecondary;
    final userAnswer = widget.answer?.textAnswer ?? '未作答';
    final correctAnswer = widget.question.answer ?? '';
    final timeSpent = widget.answer?.timeSpent ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: hasAnswer
              ? statusColor.withValues(alpha: 0.2)
              : AppColors.border,
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 头部：序号、状态、展开按钮
            InkWell(
              onPressed: () {
                setState(() {
                  _isExpanded = !_isExpanded;
                });
              },
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 序号图标
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: hasAnswer
                            ? (isCorrect ? AppColors.success : AppColors.error)
                            : AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text(
                          '${widget.index + 1}',
                          style: TextStyle(
                            color: hasAnswer ? Colors.white : AppColors.primary,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    // 题目内容和状态
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // 状态标识和题目类型
                          Row(
                            children: [
                              if (hasAnswer)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: statusColor.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        isCorrect ? Icons.check_circle : Icons.cancel,
                                        size: 14,
                                        color: statusColor,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        statusText,
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: statusColor,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              else
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.muted,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    '未答',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: AppColors.textSecondary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.05),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  widget.question.type,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // 题目内容
                          Text(
                            _stripHtml(widget.question.content),
                            style: const TextStyle(
                              fontSize: 15,
                              color: AppColors.textPrimary,
                              height: 1.6,
                            ),
                            maxLines: _isExpanded ? null : 2,
                            overflow: _isExpanded ? null : TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(
                      _isExpanded ? Icons.expand_less : Icons.expand_more,
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
              ),
            ),
            // 展开的详情
            if (_isExpanded)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Color(0xFFFBFDFF),
                  border: Border(
                    top: BorderSide(color: AppColors.border),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 答题耗时
                    if (hasAnswer) ...[
                      Row(
                        children: [
                          const Icon(Icons.access_time, size: 14, color: AppColors.textSecondary),
                          const SizedBox(width: 6),
                          Text(
                            '答题耗时: ${Formatters.formatDuration(timeSpent)}',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                    ],
                    // 用户答案
                    if (hasAnswer) ...[
                      _buildInfoSection(
                        title: '你的答案',
                        content: userAnswer,
                        color: isCorrect ? AppColors.success : AppColors.error,
                        icon: isCorrect ? '✅' : '❌',
                      ),
                      const SizedBox(height: 16),
                    ],
                    // 正确答案（如果答错）
                    if (hasAnswer && !isCorrect && correctAnswer.isNotEmpty) ...[
                      _buildInfoSection(
                        title: '正确答案',
                        content: correctAnswer,
                        color: AppColors.success,
                        icon: '🎯',
                      ),
                      const SizedBox(height: 16),
                    ],
                    // 未答题提示
                    if (!hasAnswer)
                      Container(
                        padding: const EdgeInsets.all(16),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: AppColors.muted,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          '📋 此题尚未作答',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    // 知识点
                    if (widget.question.knowledge != null &&
                        widget.question.knowledge!.isNotEmpty) ...[
                      _buildInfoSection(
                        title: '知识点',
                        content: widget.question.knowledge!,
                        color: AppColors.primary,
                        icon: '📚',
                      ),
                    ],
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoSection({
    required String title,
    required String content,
    required Color color,
    required String icon,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SelectableText(
            content,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textPrimary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  /// 简单去除 HTML 标签（用于显示）
  String _stripHtml(String html) {
    return html
        .replaceAll(RegExp(r'<[^>]*>'), '')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&')
        .trim();
  }
}


