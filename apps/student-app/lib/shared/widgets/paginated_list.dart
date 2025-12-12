import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// 分页列表状态
class PaginatedListState<T> {
  final List<T> items;
  final bool isLoading;
  final bool hasMore;
  final String? error;
  final int currentPage;
  final int pageSize;

  const PaginatedListState({
    this.items = const [],
    this.isLoading = false,
    this.hasMore = true,
    this.error,
    this.currentPage = 0,
    this.pageSize = 20,
  });

  PaginatedListState<T> copyWith({
    List<T>? items,
    bool? isLoading,
    bool? hasMore,
    String? error,
    int? currentPage,
    int? pageSize,
  }) {
    return PaginatedListState<T>(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      hasMore: hasMore ?? this.hasMore,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      pageSize: pageSize ?? this.pageSize,
    );
  }
}

/// 分页列表组件
/// 支持下拉刷新和上拉加载更多
class PaginatedList<T> extends ConsumerStatefulWidget {
  /// 数据加载函数
  /// 参数：page (从0开始), pageSize
  /// 返回：List&lt;T&gt;
  final Future<List<T>> Function(int page, int pageSize) loadData;

  /// 列表项构建器
  final Widget Function(BuildContext context, T item, int index) itemBuilder;

  /// 每页大小
  final int pageSize;

  /// 空状态组件
  final Widget? emptyWidget;

  /// 错误状态组件
  final Widget Function(String error, VoidCallback onRetry)? errorWidget;

  /// 加载更多指示器
  final Widget? loadMoreIndicator;

  /// 是否启用下拉刷新
  final bool enablePullToRefresh;

  /// ListView 的其他配置
  final ScrollController? controller;
  final EdgeInsets? padding;
  final ScrollPhysics? physics;

  const PaginatedList({
    super.key,
    required this.loadData,
    required this.itemBuilder,
    this.pageSize = 20,
    this.emptyWidget,
    this.errorWidget,
    this.loadMoreIndicator,
    this.enablePullToRefresh = true,
    this.controller,
    this.padding,
    this.physics,
  });

  @override
  ConsumerState<PaginatedList<T>> createState() => _PaginatedListState<T>();
}

class _PaginatedListState<T> extends ConsumerState<PaginatedList<T>> {
  late PaginatedListState<T> _state;
  late ScrollController _scrollController;
  bool _isLoadingMore = false;

  @override
  void initState() {
    super.initState();
    _state = PaginatedListState<T>(pageSize: widget.pageSize);
    _scrollController = widget.controller ?? ScrollController();
    _scrollController.addListener(_onScroll);
    _loadData(0);
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _scrollController.dispose();
    } else {
      _scrollController.removeListener(_onScroll);
    }
    super.dispose();
  }

  void _onScroll() {
    if (_isLoadingMore || !_state.hasMore) return;

    // 当滚动到距离底部 200px 时，加载更多
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  Future<void> _loadData(int page) async {
    if (_state.isLoading) return;

    setState(() {
      _state = _state.copyWith(
        isLoading: true,
        error: null,
      );
    });

    try {
      final items = await widget.loadData(page, widget.pageSize);
      setState(() {
        _state = _state.copyWith(
          items: page == 0 ? items : [..._state.items, ...items],
          isLoading: false,
          hasMore: items.length >= widget.pageSize,
          currentPage: page,
        );
      });
    } catch (e) {
      setState(() {
        _state = _state.copyWith(
          isLoading: false,
          error: e.toString(),
        );
      });
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || !_state.hasMore || _state.isLoading) return;

    setState(() {
      _isLoadingMore = true;
    });

    try {
      final nextPage = _state.currentPage + 1;
      final items = await widget.loadData(nextPage, widget.pageSize);
      setState(() {
        _state = _state.copyWith(
          items: [..._state.items, ...items],
          hasMore: items.length >= widget.pageSize,
          currentPage: nextPage,
        );
        _isLoadingMore = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingMore = false;
        // 加载更多失败，不显示错误，静默失败
      });
    }
  }

  Future<void> _refresh() async {
    await _loadData(0);
  }

  @override
  Widget build(BuildContext context) {
    if (_state.isLoading && _state.items.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_state.error != null && _state.items.isEmpty) {
      if (widget.errorWidget != null) {
        return widget.errorWidget!(_state.error!, () => _loadData(0));
      }
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('加载失败: ${_state.error}'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _loadData(0),
              child: const Text('重试'),
            ),
          ],
        ),
      );
    }

    if (_state.items.isEmpty) {
      return widget.emptyWidget ??
          const Center(
            child: Text('暂无数据'),
          );
    }

    Widget listView = ListView.builder(
      controller: _scrollController,
      padding: widget.padding,
      physics: widget.physics,
      itemCount: _state.items.length + (_state.hasMore ? 1 : 0),
      cacheExtent: 500, // 优化滚动性能
      itemBuilder: (context, index) {
        if (index >= _state.items.length) {
          // 加载更多指示器
          return widget.loadMoreIndicator ??
              const Padding(
                padding: EdgeInsets.all(16),
                child: Center(
                  child: CircularProgressIndicator(),
                ),
              );
        }
        return widget.itemBuilder(context, _state.items[index], index);
      },
    );

    if (widget.enablePullToRefresh) {
      return RefreshIndicator(
        onRefresh: _refresh,
        child: listView,
      );
    }

    return listView;
  }
}

