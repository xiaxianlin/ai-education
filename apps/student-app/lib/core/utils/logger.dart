import 'dart:developer' as developer;

/// 日志级别
enum LogLevel {
  debug,
  info,
  warning,
  error,
}

/// 日志工具类
/// 提供统一的日志记录功能
class Logger {
  Logger._();

  /// 是否启用日志（生产环境可以关闭）
  static bool enabled = true;

  /// 设置日志级别（只记录该级别及以上的日志）
  static LogLevel level = LogLevel.debug;

  /// Debug 日志
  static void debug(String message, [String? tag]) {
    if (enabled && level.index <= LogLevel.debug.index) {
      developer.log(
        message,
        name: tag ?? 'DEBUG',
        level: 0,
      );
    }
  }

  /// Info 日志
  static void info(String message, [String? tag]) {
    if (enabled && level.index <= LogLevel.info.index) {
      developer.log(
        message,
        name: tag ?? 'INFO',
        level: 100,
      );
    }
  }

  /// Warning 日志
  static void warning(String message, [String? tag]) {
    if (enabled && level.index <= LogLevel.warning.index) {
      developer.log(
        message,
        name: tag ?? 'WARNING',
        level: 900,
      );
    }
  }

  /// Error 日志
  static void error(
    String message, [
    Object? error,
    StackTrace? stackTrace,
    String? tag,
  ]) {
    if (enabled && level.index <= LogLevel.error.index) {
      developer.log(
        message,
        name: tag ?? 'ERROR',
        error: error,
        stackTrace: stackTrace,
        level: 1000,
      );
    }
  }

  /// 记录 API 请求
  static void logApiRequest(String method, String url, [Map<String, dynamic>? data]) {
    if (enabled && level.index <= LogLevel.debug.index) {
      final dataStr = data != null ? ' | Data: $data' : '';
      developer.log(
        '$method $url$dataStr',
        name: 'API_REQUEST',
        level: 0,
      );
    }
  }

  /// 记录 API 响应
  static void logApiResponse(String method, String url, int? statusCode, [dynamic data]) {
    if (enabled && level.index <= LogLevel.debug.index) {
      final dataStr = data != null ? ' | Response: $data' : '';
      developer.log(
        '$method $url | Status: $statusCode$dataStr',
        name: 'API_RESPONSE',
        level: 0,
      );
    }
  }

  /// 记录 API 错误
  static void logApiError(String method, String url, Object error, [StackTrace? stackTrace]) {
    if (enabled) {
      developer.log(
        '$method $url | Error: $error',
        name: 'API_ERROR',
        error: error,
        stackTrace: stackTrace,
        level: 1000,
      );
    }
  }
}

