import 'package:flutter/material.dart';

/// 错误类型
enum ErrorType {
  network,
  server,
  client,
  unknown,
}

/// 统一错误提示组件
class ErrorSnackbar {
  ErrorSnackbar._();

  /// 显示错误提示
  static void show(
    BuildContext context,
    String message, {
    ErrorType type = ErrorType.unknown,
    Duration duration = const Duration(seconds: 3),
    VoidCallback? onRetry,
  }) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    Color backgroundColor;
    IconData icon;

    switch (type) {
      case ErrorType.network:
        backgroundColor = Colors.orange;
        icon = Icons.wifi_off;
        break;
      case ErrorType.server:
        backgroundColor = Colors.red;
        icon = Icons.error_outline;
        break;
      case ErrorType.client:
        backgroundColor = Colors.amber;
        icon = Icons.warning_amber;
        break;
      case ErrorType.unknown:
        backgroundColor = colorScheme.error;
        icon = Icons.error_outline;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
            if (onRetry != null) ...[
              const SizedBox(width: 8),
              TextButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).hideCurrentSnackBar();
                  onRetry();
                },
                child: const Text(
                  '重试',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ],
        ),
        backgroundColor: backgroundColor,
        duration: duration,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  /// 显示网络错误
  static void showNetworkError(
    BuildContext context, {
    String? message,
    VoidCallback? onRetry,
  }) {
    show(
      context,
      message ?? '网络连接失败，请检查网络设置',
      type: ErrorType.network,
      onRetry: onRetry,
    );
  }

  /// 显示服务器错误
  static void showServerError(
    BuildContext context, {
    String? message,
    VoidCallback? onRetry,
  }) {
    show(
      context,
      message ?? '服务器错误，请稍后重试',
      type: ErrorType.server,
      onRetry: onRetry,
    );
  }

  /// 显示客户端错误
  static void showClientError(
    BuildContext context,
    String message,
  ) {
    show(
      context,
      message,
      type: ErrorType.client,
    );
  }
}

