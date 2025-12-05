import 'package:student_app/core/api/api_client.dart';

/// 认证相关 API 端点
class AuthEndpoints {
  AuthEndpoints._();

  static final _api = ApiClient.instance;

  /// 登录
  /// POST /api/student/login
  /// Body: { phone: string, password: string }
  /// Response: string (token)
  static Future<String> login({
    required String phone,
    required String password,
  }) async {
    return await _api.post<String>(
      '/login',
      data: {
        'phone': phone,
        'password': password,
      },
    );
  }

  /// 检查登录状态
  /// GET /api/student/check
  /// Response: string (student_id)
  static Future<String> check() async {
    return await _api.get<String>('/check');
  }
}

