import 'package:flutter/material.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 练习卡片组件
/// 显示练习类型标题、图标和跳转按钮
class PracticeCard extends StatelessWidget {
  final String title;
  final String? description;
  final String icon;
  final VoidCallback onTap;

  const PracticeCard({
    super.key,
    required this.title,
    this.description,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDaily = title.contains('每日') || title.contains('daily');
    final bool isUnit = title.contains('单元') || title.contains('unit');
    
    final Color color = isDaily 
        ? AppColors.primary 
        : (isUnit ? AppColors.success : AppColors.warning);
    
    final Color softColor = isDaily 
        ? AppColors.primarySoft 
        : (isUnit ? AppColors.successSoft : AppColors.warningSoft);

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: AppColors.border,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.08),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Stack(
              children: [
                // 背景装饰
                Positioned(
                  top: -20,
                  right: -20,
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.05),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: softColor,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              icon,
                              style: const TextStyle(fontSize: 32),
                            ),
                          ),
                          const Spacer(),
                          Icon(
                            Icons.arrow_forward_rounded,
                            color: color.withValues(alpha: 0.5),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Expanded(
                        child: Text(
                          description ?? '',
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            height: 1.4,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _getButtonText(title),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.bolt_rounded,
                              color: Colors.white,
                              size: 14,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _getButtonText(String title) {
    if (title.contains('每日')) {
      return '去练习';
    } else if (title.contains('单元')) {
      return '选择单元';
    } else if (title.contains('评估') || title.contains('评测')) {
      return '去评估';
    }
    return '开始';
  }
}


