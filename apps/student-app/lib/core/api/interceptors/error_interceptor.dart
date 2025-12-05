import 'package:dio/dio.dart';
import 'package:student_app/core/utils/storage.dart';
import 'package:student_app/core/utils/navigation_helper.dart';
import 'package:student_app/core/utils/logger.dart';
import 'package:student_app/app/router.dart';

/// 错误拦截器
/// 统一处理 HTTP 错误和业务错误
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // 检查是否是登录失效错误（即使没有 response，也要检查 error 消息）
    final errorMessage = _getErrorMessage(err);
    if (_isAuthError(errorMessage)) {
      // 记录认证错误
      Logger.debug(
        'Authentication error: ${errorMessage ?? '登录失效'} | URL: ${err.requestOptions.path}',
        'ErrorInterceptor',
      );

      // 处理认证错误：清除 token 并跳转登录
      _handleAuthError();

      // 创建一个新的异常，但不再继续传播（避免未处理异常）
      handler.reject(
        DioException(
          requestOptions: err.requestOptions,
          response: err.response,
          type: DioExceptionType.badResponse,
          error: errorMessage ?? '登录失效',
        ),
      );
      return;
    }

    if (err.response != null) {
      final statusCode = err.response!.statusCode;
      final data = err.response!.data;

      // 处理 HTTP 错误
      switch (statusCode) {
        case 400:
          // 请求参数错误
          handler.reject(
            DioException(
              requestOptions: err.requestOptions,
              response: err.response,
              type: DioExceptionType.badResponse,
              error: _extractMessage(data) ?? '请求参数错误',
            ),
          );
          return;

        case 401:
        case 403:
          // 未授权或禁止访问，清除 token
          Logger.warning(
            'HTTP $statusCode error: ${_extractMessage(data) ?? '登录失效'} | URL: ${err.requestOptions.path}',
            'ErrorInterceptor',
          );
          _handleAuthError();

          handler.reject(
            DioException(
              requestOptions: err.requestOptions,
              response: err.response,
              type: DioExceptionType.badResponse,
              error: _extractMessage(data) ?? '登录失效',
            ),
          );
          return;

        case 405:
          // 未设置当前学习教材
          // 注意：路由跳转需要在调用方处理
          handler.reject(
            DioException(
              requestOptions: err.requestOptions,
              response: err.response,
              type: DioExceptionType.badResponse,
              error: _extractMessage(data) ?? '未设置当前学习教材',
            ),
          );
          return;

        default:
          handler.reject(
            DioException(
              requestOptions: err.requestOptions,
              response: err.response,
              type: DioExceptionType.badResponse,
              error: _extractMessage(data) ?? '网络异常',
            ),
          );
          return;
      }
    }

    // 处理网络错误等其他错误
    Logger.error(
      'Network error: ${err.type} | ${err.message ?? err.toString()} | URL: ${err.requestOptions.path}',
      err.error,
      err.stackTrace,
      'ErrorInterceptor',
    );
    handler.reject(err);
  }

  /// 处理认证错误：清除 token 并跳转登录
  void _handleAuthError() {
    Storage.removeToken();
    Storage.clearAll();

    // 通知路由守卫认证状态已更新
    AppRouter.authNotifier.updateAuthStatus();

    // 自动跳转到登录页
    NavigationHelper.navigateToLogin();
  }

  /// 检查是否是认证错误
  bool _isAuthError(String? message) {
    if (message == null) return false;
    final lowerMessage = message.toLowerCase();
    return lowerMessage.contains('登录失效') ||
        lowerMessage.contains('登录已失效') ||
        lowerMessage.contains('未授权') ||
        lowerMessage.contains('unauthorized') ||
        (lowerMessage.contains('token') &&
            (lowerMessage.contains('无效') || lowerMessage.contains('过期')));
  }

  /// 从异常中提取错误消息
  String? _getErrorMessage(DioException err) {
    // 优先使用 error.error（字符串消息）
    if (err.error is String) {
      return err.error as String;
    }

    // 从响应数据中提取
    if (err.response != null) {
      return _extractMessage(err.response!.data);
    }

    return null;
  }

  /// 从响应数据中提取错误消息
  String? _extractMessage(dynamic data) {
    if (data is Map<String, dynamic>) {
      return data['message'] as String?;
    }
    if (data is String) {
      return data;
    }
    return null;
  }
}
