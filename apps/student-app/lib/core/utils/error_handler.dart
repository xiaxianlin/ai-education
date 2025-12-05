import 'package:dio/dio.dart';

/// 统一的错误处理工具
/// 提供用户友好的错误消息转换
class ErrorHandler {
  ErrorHandler._();

  /// 从异常中提取用户友好的错误消息
  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      return _handleDioException(error);
    } else if (error is Exception) {
      return _handleGenericException(error);
    } else if (error is String) {
      return _parseErrorMessage(error);
    } else {
      return _parseErrorMessage(error.toString());
    }
  }

  /// 处理 DioException
  static String _handleDioException(DioException error) {
    // 优先使用 error.error（字符串消息）
    if (error.error is String) {
      return _parseErrorMessage(error.error as String);
    }

    // 处理响应错误
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final data = error.response!.data;

      // 从响应数据中提取消息
      String? message;
      if (data is Map<String, dynamic>) {
        message = data['message'] as String?;
      }

      // 根据状态码返回友好消息
      switch (statusCode) {
        case 400:
          return message ?? '请求参数错误，请检查输入';
        case 401:
          return message ?? '登录已失效，请重新登录';
        case 403:
          return message ?? '没有权限访问此资源';
        case 404:
          return message ?? '请求的资源不存在';
        case 405:
          return message ?? '未设置当前学习教材';
        case 500:
        case 502:
        case 503:
          return message ?? '服务器错误，请稍后重试';
        default:
          return message ?? '网络请求失败，请稍后重试';
      }
    }

    // 处理网络错误
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return '网络连接超时，请检查网络设置';
      case DioExceptionType.badCertificate:
        return '证书验证失败';
      case DioExceptionType.connectionError:
        return '网络连接失败，请检查网络设置';
      case DioExceptionType.cancel:
        return '请求已取消';
      default:
        return '网络异常，请稍后重试';
    }
  }

  /// 处理通用异常
  static String _handleGenericException(Exception error) {
    final errorStr = error.toString().toLowerCase();

    if (errorStr.contains('phone') && errorStr.contains('password')) {
      return '手机号或密码错误';
    } else if (errorStr.contains('禁用') || errorStr.contains('disabled')) {
      return '账号被禁用，请联系管理员';
    } else if (errorStr.contains('网络') ||
        errorStr.contains('network') ||
        errorStr.contains('连接') ||
        errorStr.contains('timeout')) {
      return '网络连接失败，请检查网络设置';
    } else if (errorStr.contains('401') || errorStr.contains('unauthorized')) {
      return '认证失败，请重新登录';
    } else if (errorStr.contains('500') || errorStr.contains('server')) {
      return '服务器错误，请稍后重试';
    }

    return _parseErrorMessage(error.toString());
  }

  /// 解析错误消息字符串
  static String _parseErrorMessage(String error) {
    final errorLower = error.toLowerCase();

    // 常见错误消息映射
    if (errorLower.contains('手机号或密码错误') ||
        (errorLower.contains('phone') && errorLower.contains('password'))) {
      return '手机号或密码错误';
    } else if (errorLower.contains('账号被禁用') ||
        errorLower.contains('禁用') ||
        errorLower.contains('disabled')) {
      return '账号被禁用，请联系管理员';
    } else if (errorLower.contains('网络') ||
        errorLower.contains('network') ||
        errorLower.contains('连接') ||
        errorLower.contains('timeout') ||
        errorLower.contains('connection')) {
      return '网络连接失败，请检查网络设置';
    } else if (errorLower.contains('401') ||
        errorLower.contains('unauthorized')) {
      return '认证失败，请重新登录';
    } else if (errorLower.contains('403') || errorLower.contains('forbidden')) {
      return '没有权限访问此资源';
    } else if (errorLower.contains('404') || errorLower.contains('not found')) {
      return '请求的资源不存在';
    } else if (errorLower.contains('500') ||
        errorLower.contains('502') ||
        errorLower.contains('503') ||
        errorLower.contains('504') ||
        errorLower.contains('server')) {
      return '服务器错误，请稍后重试';
    } else if (errorLower.contains('请先') || errorLower.contains('请')) {
      // 保留包含"请"的提示信息（通常是友好的中文提示）
      return error;
    } else if (errorLower.contains('未设置') || errorLower.contains('未选择')) {
      return error;
    }

    // 默认返回原始错误，但去除技术细节
    if (error.contains('Exception:') || error.contains('Error:')) {
      final parts = error.split(':');
      if (parts.length > 1) {
        return parts.sublist(1).join(':').trim();
      }
    }

    return error.isNotEmpty ? error : '操作失败，请稍后重试';
  }

  /// 判断错误类型
  static bool isNetworkError(dynamic error) {
    if (error is DioException) {
      return error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.sendTimeout ||
          error.type == DioExceptionType.receiveTimeout ||
          error.type == DioExceptionType.connectionError;
    }
    final errorStr = error.toString().toLowerCase();
    return errorStr.contains('network') ||
        errorStr.contains('连接') ||
        errorStr.contains('timeout') ||
        errorStr.contains('connection');
  }

  /// 判断是否为服务器错误
  static bool isServerError(dynamic error) {
    if (error is DioException) {
      final statusCode = error.response?.statusCode;
      return statusCode != null && statusCode >= 500 && statusCode < 600;
    }
    final errorStr = error.toString().toLowerCase();
    return errorStr.contains('500') ||
        errorStr.contains('502') ||
        errorStr.contains('503') ||
        errorStr.contains('504') ||
        errorStr.contains('server');
  }
}

