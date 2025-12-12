import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/core/models/wrong_question_summary.dart';
import 'package:student_app/core/utils/formatters.dart';
import 'package:student_app/screens/wrong_records/providers/wrong_records_provider.dart';

/// 错题卡片组件
class WrongQuestionCard extends ConsumerStatefulWidget {
  final WrongQuestionSummary wrongQuestion;

  const WrongQuestionCard({
    super.key,
    required this.wrongQuestion,
  });

  @override
  ConsumerState<WrongQuestionCard> createState() => _WrongQuestionCardState();
}

class _WrongQuestionCardState extends ConsumerState<WrongQuestionCard> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    final isMastered = widget.wrongQuestion.mastered;
    final wrongCount = widget.wrongQuestion.wrongCount;
    final lastWrongTime = widget.wrongQuestion.lastWrongTime;
    final questionContent = widget.wrongQuestion.questionContent ?? '暂无题目内容';
    final knowledge = widget.wrongQuestion.knowledge;

    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isMastered ? Colors.green.shade300 : Colors.red.shade300,
          width: 2,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Container(
          decoration: BoxDecoration(
            color: isMastered ? Colors.green.shade50 : Colors.red.shade50,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 头部：状态、错题次数、展开按钮
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 状态标识
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: isMastered
                            ? Colors.green.withValues(alpha: 0.2)
                            : Colors.red.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isMastered ? Colors.green : Colors.red,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isMastered ? Icons.check_circle : Icons.cancel,
                            size: 16,
                            color: isMastered ? Colors.green.shade700 : Colors.red.shade700,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isMastered ? '已掌握' : '未掌握',
                            style: TextStyle(
                              fontSize: 12,
                              color: isMastered ? Colors.green.shade700 : Colors.red.shade700,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    // 错题次数
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade100,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.orange.shade300),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 16,
                            color: Colors.orange.shade700,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '错$wrongCount次',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.orange.shade700,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    // 展开/收起按钮
                    IconButton(
                      icon: Icon(
                        _isExpanded
                            ? Icons.keyboard_arrow_up
                            : Icons.keyboard_arrow_down,
                        color: Colors.grey.shade600,
                      ),
                      onPressed: () {
                        setState(() {
                          _isExpanded = !_isExpanded;
                        });
                      },
                    ),
                  ],
                ),
              ),
              // 题目内容
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _isExpanded
                    ? SelectableText(
                        _stripHtml(questionContent),
                        style: const TextStyle(
                          fontSize: 14,
                          height: 1.5,
                        ),
                      )
                    : Text(
                        _stripHtml(questionContent),
                        style: const TextStyle(
                          fontSize: 14,
                          height: 1.5,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
              ),
              const SizedBox(height: 12),
              // 时间信息
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  '最后错题: ${Formatters.formatRelativeTime(lastWrongTime)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ),
              // 展开的详情
              if (_isExpanded) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(
                      top: BorderSide(color: Colors.grey.shade200),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 知识点
                      if (knowledge != null && knowledge.isNotEmpty) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.blue.shade200),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Text('📚'),
                                  const SizedBox(width: 4),
                                  Text(
                                    '知识点',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.blue.shade700,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                knowledge,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.blue.shade800,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],
                      // 操作按钮
                      Row(
                        children: [
                          if (!isMastered)
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _handleMarkAsMastered(context),
                                icon: const Icon(Icons.check_circle, size: 18),
                                label: const Text('标记已掌握'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),
                          if (isMastered) ...[
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade100,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.green.shade300),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.check_circle,
                                      size: 18,
                                      color: Colors.green.shade700,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '已掌握',
                                      style: TextStyle(
                                        color: Colors.green.shade700,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  /// 处理标记已掌握
  Future<void> _handleMarkAsMastered(BuildContext context) async {
    if (!mounted) return;
    
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('确认标记'),
        content: const Text('确定要将此题标记为已掌握吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('取消'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('确认'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    final markAsMasteredNotifier = ref.read(markAsMasteredProvider);
    await markAsMasteredNotifier.markAsMastered(widget.wrongQuestion.questionId);

    if (!mounted) return;
    
    // 在异步操作后立即获取 messenger，避免在其他操作后使用 context
    // ignore: use_build_context_synchronously
    final messenger = ScaffoldMessenger.maybeOf(context);
    if (messenger == null || !mounted) return;
    
    final state = ref.read(markAsMasteredStateProvider);
    
    if (state.hasError) {
      messenger.showSnackBar(
        SnackBar(
          content: Text('标记失败: ${state.error}'),
          backgroundColor: Colors.red,
        ),
      );
    } else {
      messenger.showSnackBar(
        const SnackBar(
          content: Text('已标记为已掌握'),
          backgroundColor: Colors.green,
        ),
      );
    }
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

