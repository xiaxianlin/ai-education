import 'package:student_app/core/constants/api_constants.dart';

/// 资源 URL 工具类
class Resource {
  Resource._();

  /// 获取完整的资源 URL
  /// [resourcePath] 资源路径（可能是相对路径或完整 URL）
  /// 返回完整的资源 URL，如果输入为 null 则返回 null
  static String? getResourceUrl(String? resourcePath) {
    if (resourcePath == null || resourcePath.isEmpty) {
      return null;
    }

    // 如果已经是完整的 URL，直接返回
    if (resourcePath.startsWith('http://') ||
        resourcePath.startsWith('https://')) {
      return resourcePath;
    }

    // 如果是相对路径，拼接 OSS base URL
    return '${ApiConstants.ossBaseUrl}/$resourcePath';
  }
}

