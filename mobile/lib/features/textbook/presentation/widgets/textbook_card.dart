import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/models/textbook.dart';
import '../../../../core/constants/profile_constants.dart';

/// 教材卡片组件
class TextbookCard extends StatelessWidget {
  final Textbook textbook;
  final VoidCallback? onTap;

  const TextbookCard({
    super.key,
    required this.textbook,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap ??
            () {
              context.push('/textbooks/${textbook.id}/units');
            },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // 科目名称
              Text(
                textbook.subject,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
              ),
              const SizedBox(height: 8),
              // 版本、年级、学期信息
              Text(
                '${textbook.version} · ${ProfileConstants.getGradeName(textbook.grade)} · ${textbook.semester}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

