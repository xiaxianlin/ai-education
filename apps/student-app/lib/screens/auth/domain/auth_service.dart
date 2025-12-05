import 'package:student_app/core/api/endpoints/auth_endpoints.dart';
import 'package:student_app/core/utils/storage.dart';

/// 认证服务
/// 封装认证相关的业务逻辑
class AuthService {
  AuthService._();

  static final AuthService instance = AuthService._();

  /// 登录
  /// 返回token字符串
  Future<String> login(String phone, String password) async {
    try {
      final token = await AuthEndpoints.login(
        phone: phone,
        password: password,
      );

      // 保存token到本地存储
      await Storage.saveToken(token);

      return token;
    } catch (e) {
      // 重新抛出异常，让调用者处理
      rethrow;
    }
  }

  /// 检查登录状态
  /// 验证当前token是否有效
  Future<String> checkAuthStatus() async {
    try {
      final studentId = await AuthEndpoints.check();
      return studentId;
    } catch (e) {
      // Token无效，清除本地存储
      await Storage.removeToken();
      rethrow;
    }
  }

  /// 退出登录
  /// 清除本地存储的token和用户信息
  Future<void> logout() async {
    await Storage.removeToken();
    await Storage.clearAll();
  }

  /// 检查是否已登录（仅检查本地token，不验证服务器）
  bool isLoggedIn() {
    return Storage.getToken() != null;
  }
}

