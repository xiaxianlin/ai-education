import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// 错误边界组件
/// 提供友好的错误展示和恢复机制
/// 注意：Flutter 没有像 React 那样的错误边界机制
/// 这个组件主要用于包装可能出错的 Widget，并提供统一的错误展示
class ErrorBoundary extends ConsumerStatefulWidget {
  final Widget child;
  final Widget Function(BuildContext context, Object error, StackTrace stackTrace)? errorBuilder;
  final VoidCallback? onError;

  const ErrorBoundary({
    super.key,
    required this.child,
    this.errorBuilder,
    this.onError,
  });

  @override
  ConsumerState<ErrorBoundary> createState() => _ErrorBoundaryState();
}

class _ErrorBoundaryState extends ConsumerState<ErrorBoundary> {
  Object? _error;
  StackTrace? _stackTrace;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    // 捕获 Flutter 错误
    FlutterError.onError = (FlutterErrorDetails details) {
      if (mounted) {
        _handleError(details.exception, details.stack ?? StackTrace.current);
      }
    };
  }

  void _handleError(Object error, StackTrace stackTrace) {
    widget.onError?.call();
    setState(() {
      _error = error;
      _stackTrace = stackTrace;
      _hasError = true;
    });
  }

  void _reset() {
    setState(() {
      _error = null;
      _stackTrace = null;
      _hasError = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError && _error != null) {
      if (widget.errorBuilder != null) {
        return widget.errorBuilder!(context, _error!, _stackTrace ?? StackTrace.current);
      }

      return _DefaultErrorWidget(
        error: _error!,
        stackTrace: _stackTrace,
        onReset: _reset,
      );
    }

    return widget.child;
  }
}

/// 默认错误展示组件
class _DefaultErrorWidget extends StatelessWidget {
  final Object error;
  final StackTrace? stackTrace;
  final VoidCallback onReset;

  const _DefaultErrorWidget({
    required this.error,
    this.stackTrace,
    required this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Theme.of(context).colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                '出现错误',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: Theme.of(context).colorScheme.error,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onReset,
                icon: const Icon(Icons.refresh),
                label: const Text('重试'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
