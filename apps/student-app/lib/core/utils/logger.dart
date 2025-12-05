import 'package:logger/logger.dart' as logger_package show Logger, Level, PrettyPrinter, DateTimeFormat;

/// 日志级别（保持向后兼容）
enum LogLevel {
  debug,
  info,
  warning,
  error,
}

/// 日志工具类
/// 提供统一的日志记录功能，基于 logger 包实现
class Logger {
  Logger._();

  /// 内部 Logger 实例
  static logger_package.Logger? _loggerInstance;

  /// 是否启用日志（生产环境可以关闭）
  static bool enabled = true;

  /// 设置日志级别（只记录该级别及以上的日志）
  static LogLevel level = LogLevel.debug;

  /// 获取或创建 Logger 实例
  static logger_package.Logger get _logger {
    _loggerInstance ??= logger_package.Logger(
      printer: logger_package.PrettyPrinter(
        methodCount: 0, // 不显示调用栈
        errorMethodCount: 5, // 错误时显示 5 层调用栈
        lineLength: 120,
        colors: true,
        printEmojis: false,
        dateTimeFormat: logger_package.DateTimeFormat.onlyTimeAndSinceStart,
      ),
      level: _convertLogLevel(level),
    );
    return _loggerInstance!;
  }

  /// 转换 LogLevel 到 logger 包的 Level
  static logger_package.Level _convertLogLevel(LogLevel logLevel) {
    switch (logLevel) {
      case LogLevel.debug:
        return logger_package.Level.debug;
      case LogLevel.info:
        return logger_package.Level.info;
      case LogLevel.warning:
        return logger_package.Level.warning;
      case LogLevel.error:
        return logger_package.Level.error;
    }
  }

  /// 更新日志级别
  static void setLevel(LogLevel newLevel) {
    level = newLevel;
    // 重新创建 logger 实例以应用新的级别
    _loggerInstance = logger_package.Logger(
      printer: logger_package.PrettyPrinter(
        methodCount: 0,
        errorMethodCount: 5,
        lineLength: 120,
        colors: true,
        printEmojis: false,
        dateTimeFormat: logger_package.DateTimeFormat.onlyTimeAndSinceStart,
      ),
      level: _convertLogLevel(newLevel),
    );
  }

  /// Debug 日志
  static void debug(String message, [String? tag]) {
    if (!enabled) return;
    if (tag != null) {
      _logger.d('[$tag] $message');
    } else {
      _logger.d(message);
    }
  }

  /// Info 日志
  static void info(String message, [String? tag]) {
    if (!enabled) return;
    if (tag != null) {
      _logger.i('[$tag] $message');
    } else {
      _logger.i(message);
    }
  }

  /// Warning 日志
  static void warning(String message, [String? tag]) {
    if (!enabled) return;
    if (tag != null) {
      _logger.w('[$tag] $message');
    } else {
      _logger.w(message);
    }
  }

  /// Error 日志
  static void error(
    String message, [
    Object? error,
    StackTrace? stackTrace,
    String? tag,
  ]) {
    if (!enabled) return;
    final prefix = tag != null ? '[$tag] ' : '';
    if (error != null || stackTrace != null) {
      _logger.e(
        '$prefix$message',
        error: error,
        stackTrace: stackTrace,
      );
    } else {
      _logger.e('$prefix$message');
    }
  }

  /// 记录 API 请求
  static void logApiRequest(String method, String url, [Map<String, dynamic>? data]) {
    if (!enabled) return;
    final dataStr = data != null ? ' | Data: $data' : '';
    _logger.d('API_REQUEST: $method $url$dataStr');
  }

  /// 记录 API 响应
  static void logApiResponse(String method, String url, int? statusCode, [dynamic data]) {
    if (!enabled) return;
    final dataStr = data != null ? ' | Response: $data' : '';
    _logger.d('API_RESPONSE: $method $url | Status: $statusCode$dataStr');
  }

  /// 记录 API 错误
  static void logApiError(String method, String url, Object error, [StackTrace? stackTrace]) {
    if (!enabled) return;
    _logger.e(
      'API_ERROR: $method $url | Error: $error',
      error: error,
      stackTrace: stackTrace,
    );
  }
}

