import 'package:flutter/material.dart';

/// 加载指示器尺寸
enum LoadingSize {
  small,
  medium,
  large,
}

/// 加载指示器组件
class LoadingIndicator extends StatelessWidget {
  final String? message;
  final LoadingSize size;
  final Color? color;

  const LoadingIndicator({
    super.key,
    this.message,
    this.size = LoadingSize.medium,
    this.color,
  });

  double get _indicatorSize {
    switch (size) {
      case LoadingSize.small:
        return 20;
      case LoadingSize.medium:
        return 40;
      case LoadingSize.large:
        return 60;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: _indicatorSize,
            height: _indicatorSize,
            child: CircularProgressIndicator(
              strokeWidth: size == LoadingSize.small ? 2 : 4,
              color: color ?? Theme.of(context).colorScheme.primary,
            ),
          ),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(
              message!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
          ],
        ],
      ),
    );
  }
}

