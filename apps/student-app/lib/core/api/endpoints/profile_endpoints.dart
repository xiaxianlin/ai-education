import '../api_client.dart';
import '../../models/profile_response.dart';

/// 个人中心相关 API 端点
class ProfileEndpoints {
  ProfileEndpoints._();

  static final _api = ApiClient.instance;

  /// 获取个人信息和教材列表
  /// GET /api/student/profile
  /// Response: { student: Student, textbooks: Textbook[] }
  static Future<ProfileResponse> getProfile() async {
    return await _api.get<ProfileResponse>(
      '/profile',
      fromJsonT: (json) => ProfileResponse.fromJson(json as Map<String, dynamic>),
    );
  }
}

