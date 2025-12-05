import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 快速操作组件
/// 显示功能入口卡片
class QuickActions extends StatelessWidget {
  const QuickActions({super.key});

  static const List<Map<String, dynamic>> _actions = [
    {
      'label': '练习记录',
      'emoji': '📊',
      'path': '/practice/history',
      'color': AppColors.success,
    },
    {
      'label': '错题复习',
      'emoji': '🔄',
      'path': '/wrong-records',
      'color': AppColors.error,
    },
    {
      'label': '敬请期待',
      'emoji': '🤩',
      'path': null,
      'color': AppColors.primary,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 16),
          child: Text(
            '🚀 功能入口',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        Row(
          children: _actions.map((action) {
            final color = action['color'] as Color;
            final hasPath = action['path'] != null;
            final index = _actions.indexOf(action);
            
            return Expanded(
              child: Padding(
                padding: EdgeInsets.only(
                  right: index < _actions.length - 1 ? 8 : 0,
                ),
                child: Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(
                      color: color.withValues(alpha: 0.2),
                      width: 2,
                    ),
                  ),
                  child: InkWell(
                    onTap: hasPath
                        ? () => context.go(action['path'] as String)
                        : null,
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      height: 100,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        color: color.withValues(alpha: 0.05),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            action['emoji'] as String,
                            style: const TextStyle(fontSize: 36),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            action['label'] as String,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: hasPath
                                  ? AppColors.textSecondary
                                  : AppColors.textMuted,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

