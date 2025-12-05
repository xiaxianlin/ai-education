import 'dart:math';
import 'package:dio/dio.dart';

/// 重试配置
class RetryConfig {
  /// 最大重试次数
  final int maxRetries;
  
  /// 重试延迟（毫秒）
  final int retryDelay;
  
  /// 是否使用指数退避
  final bool exponentialBackoff;
  
  /// 需要重试的错误类型
  final List<DioExceptionType> retryableErrors;
  
  /// 需要重试的 HTTP 状态码
  final List<int> retryableStatusCodes;

  const RetryConfig({
    this.maxRetries = 3,
    this.retryDelay = 1000,
    this.exponentialBackoff = true,
    this.retryableErrors = const [
      DioExceptionType.connectionTimeout,
      DioExceptionType.sendTimeout,
      DioExceptionType.receiveTimeout,
      DioExceptionType.connectionError,
    ],
    this.retryableStatusCodes = const [
      500,
      502,
      503,
      504,
    ],
  });
}

/// 重试拦截器
/// 实现网络请求自动重试，支持指数退避策略
class RetryInterceptor extends Interceptor {
  final RetryConfig config;
  final Dio _dio;

  RetryInterceptor({
    RetryConfig? config,
    Dio? dio,
  })  : config = config ?? const RetryConfig(),
        _dio = dio ?? Dio();

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // 检查是否应该重试
    if (!_shouldRetry(err)) {
      return handler.next(err);
    }

    // 获取重试次数
    final retryCount = err.requestOptions.extra['retryCount'] as int? ?? 0;
    
    if (retryCount >= config.maxRetries) {
      // 超过最大重试次数，不再重试
      return handler.next(err);
    }

    // 计算延迟时间
    final delay = _calculateDelay(retryCount);
    
    // 等待延迟时间
    await Future.delayed(Duration(milliseconds: delay));

    // 更新重试次数
    final newExtra = Map<String, dynamic>.from(err.requestOptions.extra);
    newExtra['retryCount'] = retryCount + 1;

    // 创建新的请求选项
    final newRequestOptions = err.requestOptions.copyWith(
      extra: newExtra,
    );

    // 重试请求
    try {
      final response = await _dio.fetch(newRequestOptions);
      return handler.resolve(response);
    } catch (e) {
      // 重试失败，继续错误处理流程
      if (e is DioException) {
        return onError(e, handler);
      }
      return handler.next(err);
    }
  }

  /// 检查是否应该重试
  bool _shouldRetry(DioException error) {
    // 检查错误类型
    if (config.retryableErrors.contains(error.type)) {
      return true;
    }

    // 检查 HTTP 状态码
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      if (statusCode != null && config.retryableStatusCodes.contains(statusCode)) {
        return true;
      }
    }

    return false;
  }

  /// 计算延迟时间（指数退避）
  int _calculateDelay(int retryCount) {
    if (!config.exponentialBackoff) {
      return config.retryDelay;
    }

    // 指数退避：delay * 2^retryCount
    final exponentialDelay = config.retryDelay * pow(2, retryCount).toInt();
    
    // 添加随机抖动，避免雷群效应
    final jitter = Random().nextInt(500);
    
    return exponentialDelay + jitter;
  }

}

