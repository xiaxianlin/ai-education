import 'package:flutter/material.dart';

/// 懒加载工具类
/// 支持图片和数据懒加载
class LazyLoader {
  LazyLoader._();

  /// 图片懒加载配置
  /// 当图片进入视口时才开始加载
  static Widget lazyImage({
    required String imageUrl,
    required BuildContext context,
    double? width,
    double? height,
    BoxFit fit = BoxFit.cover,
    Widget? placeholder,
    Widget? errorWidget,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return _LazyImageWidget(
          imageUrl: imageUrl,
          width: width ?? constraints.maxWidth,
          height: height,
          fit: fit,
          placeholder: placeholder,
          errorWidget: errorWidget,
        );
      },
    );
  }

  /// 数据懒加载
  /// 当组件进入视口时才开始加载数据
  static Widget lazyData<T>({
    required Future<T> Function() loadData,
    required Widget Function(BuildContext context, T data) builder,
    Widget? loadingWidget,
    Widget? errorWidget,
  }) {
    return _LazyDataWidget<T>(
      loadData: loadData,
      builder: builder,
      loadingWidget: loadingWidget,
      errorWidget: errorWidget,
    );
  }
}

/// 懒加载图片组件
class _LazyImageWidget extends StatefulWidget {
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? placeholder;
  final Widget? errorWidget;

  const _LazyImageWidget({
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorWidget,
  });

  @override
  State<_LazyImageWidget> createState() => _LazyImageWidgetState();
}

class _LazyImageWidgetState extends State<_LazyImageWidget> {
  bool _isVisible = false;
  bool _hasError = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 检查是否在视口中
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && !_isVisible) {
        final renderObject = context.findRenderObject();
        if (renderObject != null) {
          final box = renderObject as RenderBox;
          final position = box.localToGlobal(Offset.zero);
          final size = box.size;
          final screenSize = MediaQuery.of(context).size;

          // 检查是否在视口中
          if (position.dy < screenSize.height &&
              position.dy + size.height > 0) {
            setState(() {
              _isVisible = true;
            });
          }
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_isVisible) {
      return widget.placeholder ??
          Container(
            width: widget.width,
            height: widget.height,
            color: Colors.grey.shade200,
          );
    }

    if (_hasError) {
      return widget.errorWidget ??
          Container(
            width: widget.width,
            height: widget.height,
            color: Colors.grey.shade100,
            child: const Icon(Icons.broken_image),
          );
    }

    return Image.network(
      widget.imageUrl,
      width: widget.width,
      height: widget.height,
      fit: widget.fit,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return widget.placeholder ??
            Container(
              width: widget.width,
              height: widget.height,
              color: Colors.grey.shade200,
              child: Center(
                child: CircularProgressIndicator(
                  value: loadingProgress.expectedTotalBytes != null
                      ? loadingProgress.cumulativeBytesLoaded /
                          loadingProgress.expectedTotalBytes!
                      : null,
                ),
              ),
            );
      },
      errorBuilder: (context, error, stackTrace) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            setState(() {
              _hasError = true;
            });
          }
        });
        return widget.errorWidget ??
            Container(
              width: widget.width,
              height: widget.height,
              color: Colors.grey.shade100,
              child: const Icon(Icons.broken_image),
            );
      },
    );
  }
}

/// 懒加载数据组件
class _LazyDataWidget<T> extends StatefulWidget {
  final Future<T> Function() loadData;
  final Widget Function(BuildContext context, T data) builder;
  final Widget? loadingWidget;
  final Widget? errorWidget;

  const _LazyDataWidget({
    required this.loadData,
    required this.builder,
    this.loadingWidget,
    this.errorWidget,
  });

  @override
  State<_LazyDataWidget<T>> createState() => _LazyDataWidgetState<T>();
}

class _LazyDataWidgetState<T> extends State<_LazyDataWidget<T>> {
  bool _isVisible = false;
  T? _data;
  bool _isLoading = false;
  String? _error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 检查是否在视口中
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && !_isVisible) {
        final renderObject = context.findRenderObject();
        if (renderObject != null) {
          final box = renderObject as RenderBox;
          final position = box.localToGlobal(Offset.zero);
          final size = box.size;
          final screenSize = MediaQuery.of(context).size;

          // 检查是否在视口中
          if (position.dy < screenSize.height &&
              position.dy + size.height > 0) {
            setState(() {
              _isVisible = true;
            });
            _loadData();
          }
        }
      }
    });
  }

  Future<void> _loadData() async {
    if (_isLoading || _data != null) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await widget.loadData();
      if (mounted) {
        setState(() {
          _data = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isVisible || _isLoading) {
      return widget.loadingWidget ??
          const Center(
            child: CircularProgressIndicator(),
          );
    }

    if (_error != null) {
      return widget.errorWidget ??
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('加载失败: $_error'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _error = null;
                      _data = null;
                    });
                    _loadData();
                  },
                  child: const Text('重试'),
                ),
              ],
            ),
          );
    }

    if (_data == null) {
      return widget.loadingWidget ??
          const Center(
            child: CircularProgressIndicator(),
          );
    }

    return widget.builder(context, _data as T);
  }
}

