import 'package:dio/dio.dart';
import '../../utils/storage.dart';

/// 认证拦截器
/// 自动添加 JWT token 到请求 header
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = Storage.getToken();
    if (token != null) {
      options.headers['x-access-token'] = token;
    }
    handler.next(options);
  }
}

