import 'package:dio/dio.dart';
import 'package:student_app/core/utils/storage.dart';
import 'package:student_app/core/utils/logger.dart';

/// 认证拦截器
/// 自动添加 JWT token 到请求 header
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = Storage.getToken();
    Logger.debug('x-access-token = $token', 'AuthInterceptor');
    if (token != null) {
      options.headers['x-access-token'] = token;
    }
    handler.next(options);
  }
}
