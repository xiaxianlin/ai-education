import 'package:flutter/material.dart';
import 'package:student_app/core/models/textbook.dart';
import 'package:student_app/screens/profile/providers/profile_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/core/constants/profile_constants.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 教材 Tab 切换组件
class TextbookTabs extends ConsumerWidget {
  final Widget Function(Textbook textbook) builder;

  const TextbookTabs({
    super.key,
    required this.builder,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileStateProvider);
    final activeTextbooks = profileState.activeTextbooks;

    if (activeTextbooks.isEmpty) {
      return const SizedBox.shrink();
    }

    return DefaultTabController(
      length: activeTextbooks.length,
      child: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              color: AppColors.muted,
              borderRadius: BorderRadius.circular(100),
              border: Border.all(color: AppColors.border),
            ),
            padding: const EdgeInsets.all(4),
            child: TabBar(
              tabs: activeTextbooks.map((textbook) {
                final title =
                    '${textbook.subject} · ${ProfileConstants.getGradeName(textbook.grade)}${textbook.semester}';
                return Tab(text: title);
              }).toList(),
              indicator: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(100),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              labelColor: Colors.white,
              unselectedLabelColor: AppColors.textSecondary,
              labelStyle: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
              dividerColor: Colors.transparent,
              isScrollable: activeTextbooks.length > 2,
              tabAlignment: activeTextbooks.length > 2 ? TabAlignment.start : TabAlignment.fill,
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: TabBarView(
              children: activeTextbooks.map((textbook) => builder(textbook)).toList(),
            ),
          ),
        ],
      ),
    );
  }
}


