import 'package:flutter/material.dart';
import '../../../../../core/models/textbook.dart';
import '../../../../profile/providers/profile_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/profile_constants.dart';

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
              color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(100),
              border: Border.all(
                color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.2),
              ),
            ),
            padding: const EdgeInsets.all(6),
            child: TabBar(
              tabs: activeTextbooks.map((textbook) {
                final title =
                    '${textbook.subject} · ${ProfileConstants.getGradeName(textbook.grade)}${textbook.semester}';
                return Tab(text: title);
              }).toList(),
              indicator: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(100),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              labelColor: Theme.of(context).colorScheme.onPrimary,
              unselectedLabelColor:
                  Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
              labelStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
              dividerColor: Colors.transparent,
              isScrollable: activeTextbooks.length > 3,
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

