/// 验证工具类
class Validators {
  Validators._();

  /// 验证手机号
  /// 支持中国大陆手机号格式
  static bool isValidPhone(String? phone) {
    if (phone == null || phone.isEmpty) return false;
    final regex = RegExp(r'^1[3-9]\d{9}$');
    return regex.hasMatch(phone);
  }

  /// 验证密码
  /// [password] 密码
  /// [minLength] 最小长度，默认 6
  /// [maxLength] 最大长度，默认 20
  static bool isValidPassword(
    String? password, {
    int minLength = 6,
    int maxLength = 20,
  }) {
    if (password == null || password.isEmpty) return false;
    return password.length >= minLength && password.length <= maxLength;
  }

  /// 验证是否为空
  static bool isNotEmpty(String? value) {
    return value != null && value.trim().isNotEmpty;
  }

  /// 验证邮箱（可选）
  static bool isValidEmail(String? email) {
    if (email == null || email.isEmpty) return false;
    final regex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return regex.hasMatch(email);
  }
}

