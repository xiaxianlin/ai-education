/// API 相关常量
class ApiConstants {
  ApiConstants._();

  /// API 基础 URL
  /// 开发环境: http://127.0.0.1:7890
  /// 生产环境: 需要配置
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:7890',
  );

  /// API 路径前缀
  static const String apiPrefix = '/api/student';

  /// 完整的 API Base URL
  static String get apiBaseUrl => '$baseUrl$apiPrefix';

  /// 请求超时时间（10 分钟，用于练习会话）
  static const Duration timeout = Duration(minutes: 10);

  /// OSS 资源基础 URL
  static const String ossBaseUrl =
      'https://xxl-ai-education.oss-cn-hangzhou.aliyuncs.com';
}

