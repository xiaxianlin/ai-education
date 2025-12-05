import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/textbook_provider.dart';
import '../../../../features/profile/providers/profile_provider.dart';
import '../widgets/unit_card.dart';
import '../../../../shared/widgets/loading_indicator.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../../../../shared/widgets/error_widget.dart' as shared_widget;

/// 单元列表页面
class UnitListPage extends ConsumerStatefulWidget {
  final int textbookId;

  const UnitListPage({
    super.key,
    required this.textbookId,
  });

  @override
  ConsumerState<UnitListPage> createState() => _UnitListPageState();
}

class _UnitListPageState extends ConsumerState<UnitListPage> {
  @override
  void initState() {
    super.initState();
    // 页面加载时获取单元列表
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(unitProvider(widget.textbookId))
          .loadUnits(widget.textbookId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final unitState = ref.watch(unitStateProvider(widget.textbookId));
    final profileState = ref.watch(profileStateProvider);

    // 获取教材信息
    final textbook = profileState.textbooks
        .firstWhere((book) => book.id == widget.textbookId, orElse: () {
      // 如果找不到教材，返回一个默认值（这种情况不应该发生）
      throw Exception('教材不存在');
    },);

    return Scaffold(
      appBar: AppBar(
        title: Text('${textbook.subject} - 单元列表'),
      ),
      body: _buildContent(context, unitState),
    );
  }

  Widget _buildContent(BuildContext context, dynamic unitState) {
    // 加载状态
    if (unitState.isLoading) {
      return const LoadingIndicator(message: '加载单元中...');
    }

    // 错误状态
    if (unitState.error != null) {
      return shared_widget.ErrorWidget(
        message: unitState.error!,
        onRetry: () {
          ref.read(unitProvider(widget.textbookId))
              .refresh(widget.textbookId);
        },
      );
    }

    // 空状态
    if (unitState.units.isEmpty) {
      return const EmptyState(
        icon: Icons.book_outlined,
        message: '该教材暂无单元',
      );
    }

    // 单元列表
    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(unitProvider(widget.textbookId))
            .refresh(widget.textbookId);
      },
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: unitState.units.length,
        itemBuilder: (context, index) {
          return AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: UnitCard(
              key: ValueKey(unitState.units[index].id),
              unit: unitState.units[index],
            ),
          );
        },
      ),
    );
  }
}

