import 'package:flutter/material.dart';
import 'package:student_app/screens/profile/providers/profile_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 按学科分组的 Tab 组件
class SubjectTabs extends ConsumerWidget {
  final Widget Function(String subject) builder;

  const SubjectTabs({
    super.key,
    required this.builder,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileStateProvider);
    final subjects = profileState.subjects;

    if (subjects.isEmpty) {
      return const SizedBox.shrink();
    }

    return DefaultTabController(
      length: subjects.length,
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
              tabs: subjects.map((subject) => Tab(text: subject)).toList(),
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
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
              dividerColor: Colors.transparent,
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: TabBarView(
              children: subjects.map((subject) => builder(subject)).toList(),
            ),
          ),
        ],
      ),
    );
  }
}


