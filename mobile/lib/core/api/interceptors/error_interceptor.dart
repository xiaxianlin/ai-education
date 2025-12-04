import 'package:dio/dio.dart';
import '../../utils/storage.dart';
import '../../utils/navigation_helper.dart';
import '../../../app/router.dart';

/// 错误拦截器
/// 统一处理 HTTP 错误和业务错误
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
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
          Storage.removeToken();
          Storage.clearAll();
          
          // 通知路由守卫认证状态已更新
          AppRouter.authNotifier.updateAuthStatus();
          
          // 自动跳转到登录页
          NavigationHelper.navigateToLogin();
          
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
    handler.reject(err);
  }

  /// 从响应数据中提取错误消息
  String? _extractMessage(dynamic data) {
    if (data is Map<String, dynamic>) {
      return data['message'] as String?;
    }
    return null;
  }
}

