import 'package:flutter/material.dart';
import 'package:student_app/core/models/knowledge.dart';

/// 知识点列表项组件
class KnowledgeItem extends StatelessWidget {
  final Knowledge knowledge;

  const KnowledgeItem({
    super.key,
    required this.knowledge,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Theme.of(context).colorScheme.outlineVariant,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 知识点名称
          Row(
            children: [
              Expanded(
                child: Text(
                  knowledge.name,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ),
              // 难度标签
              if (knowledge.difficulty != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getDifficultyColor(context, knowledge.difficulty!)
                        .withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    knowledge.difficulty!,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: _getDifficultyColor(context, knowledge.difficulty!),
                        ),
                  ),
                ),
            ],
          ),
          // 知识点内容
          if (knowledge.content.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              knowledge.content,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          // 重要性（如果有）
          if (knowledge.importance != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  Icons.star,
                  size: 14,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 4),
                Text(
                  '重要性: ${knowledge.importance}/10',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Color _getDifficultyColor(BuildContext context, String difficulty) {
    switch (difficulty) {
      case '简单':
        return Colors.green;
      case '普通':
        return Colors.orange;
      case '困难':
        return Colors.red;
      default:
        return Theme.of(context).colorScheme.primary;
    }
  }
}

