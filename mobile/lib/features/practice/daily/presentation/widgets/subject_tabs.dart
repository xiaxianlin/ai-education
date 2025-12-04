import 'package:flutter/material.dart';
import '../../../../../core/models/textbook.dart';
import '../../../../profile/providers/profile_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
              color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(100),
              border: Border.all(
                color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.2),
              ),
            ),
            padding: const EdgeInsets.all(6),
            child: TabBar(
              tabs: subjects.map((subject) => Tab(text: subject)).toList(),
              indicator: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(100),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              labelColor: Theme.of(context).colorScheme.onPrimary,
              unselectedLabelColor: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
              labelStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 16,
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

