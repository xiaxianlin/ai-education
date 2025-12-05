import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/screens/textbook/providers/textbook_provider.dart';
import 'package:student_app/screens/profile/providers/profile_provider.dart';
import 'package:student_app/screens/textbook/presentation/widgets/textbook_card.dart';
import 'package:student_app/screens/textbook/presentation/widgets/textbook_filter.dart';
import 'package:student_app/shared/widgets/loading_indicator.dart';
import 'package:student_app/shared/widgets/empty_state.dart';
import 'package:student_app/shared/widgets/error_widget.dart' as shared_widget;

/// 教材列表页面
class TextbookListPage extends ConsumerWidget {
  const TextbookListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileProvider);
    final filteredTextbooks = ref.watch(filteredTextbooksProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('教材列表'),
      ),
      body: Column(
        children: [
          // 筛选器
          const TextbookFilter(),
          // 教材列表
          Expanded(
            child: _buildContent(context, ref, profileState, filteredTextbooks),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    WidgetRef ref,
    dynamic profileState,
    List filteredTextbooks,
  ) {
    // 加载状态
    if (profileState.isLoading) {
      return const LoadingIndicator();
    }

    // 错误状态
    if (profileState.error != null) {
      return shared_widget.ErrorWidget(
        message: profileState.error!,
        onRetry: () {
          ref.read(profileProvider).refresh();
        },
      );
    }

    // 空状态
    if (filteredTextbooks.isEmpty) {
      return EmptyState(
        icon: Icons.book_outlined,
        message: profileState.textbooks.isEmpty
            ? '暂无教材信息'
            : '没有符合条件的教材',
      );
    }

    // 教材列表
    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(profileProvider).refresh();
      },
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.2,
        ),
        itemCount: filteredTextbooks.length,
        itemBuilder: (context, index) {
          return AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: TextbookCard(
              key: ValueKey(filteredTextbooks[index].id),
              textbook: filteredTextbooks[index],
            ),
          );
        },
      ),
    );
  }
}

