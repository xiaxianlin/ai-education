import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';

/// 图片缓存配置
/// 配置 CachedNetworkImage 的缓存策略
class ImageCacheConfig {
  ImageCacheConfig._();

  /// 默认缓存管理器
  /// 设置最大缓存大小和过期时间
  static final CacheManager defaultCacheManager = CacheManager(
    Config(
      'imageCache',
      stalePeriod: const Duration(days: 7), // 缓存过期时间：7天
      maxNrOfCacheObjects: 200, // 最大缓存对象数
      repo: JsonCacheInfoRepository(databaseName: 'imageCache.db'),
      fileService: HttpFileService(),
    ),
  );

  /// 获取优化的图片占位符
  static Widget getPlaceholder({
    double? width,
    double? height,
    BoxFit fit = BoxFit.cover,
  }) {
    return Container(
      width: width,
      height: height,
      color: Colors.grey.shade200,
      child: Center(
        child: SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: Colors.grey.shade400,
          ),
        ),
      ),
    );
  }

  /// 获取优化的错误占位符
  static Widget getErrorWidget({
    double? width,
    double? height,
    VoidCallback? onRetry,
  }) {
    return Container(
      width: width,
      height: height,
      color: Colors.grey.shade100,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.broken_image,
            size: 32,
            color: Colors.grey.shade400,
          ),
          if (onRetry != null) ...[
            const SizedBox(height: 8),
            TextButton(
              onPressed: onRetry,
              child: const Text('重试'),
            ),
          ],
        ],
      ),
    );
  }

  /// 预加载图片
  static Future<void> precacheImageUrl(
    String imageUrl,
    BuildContext context,
  ) async {
    try {
      // 先缓存文件
      await defaultCacheManager.getSingleFile(imageUrl);
      // 再预加载到内存
      final imageProvider = CachedNetworkImageProvider(
        imageUrl,
        cacheManager: defaultCacheManager,
      );
      await precacheImage(imageProvider, context);
    } catch (e) {
      // 预加载失败，忽略错误
    }
  }

  /// 预加载图片（使用 ImageProvider）
  static Future<void> precacheImageProvider(
    ImageProvider provider,
    BuildContext context,
  ) async {
    try {
      await precacheImage(provider, context);
    } catch (e) {
      // 预加载失败，忽略错误
    }
  }

  /// 预加载多张图片
  static Future<void> precacheImages(
    List<String> imageUrls,
    BuildContext context,
  ) async {
    await Future.wait(
      imageUrls.map((url) => precacheImageUrl(url, context)),
      eagerError: false,
    );
  }

  /// 清除图片缓存
  static Future<void> clearCache() async {
    await defaultCacheManager.emptyCache();
  }

  /// 获取缓存大小（MB）
  static Future<double> getCacheSize() async {
    try {
      // 注意：flutter_cache_manager 不直接提供获取缓存大小的方法
      // 这里返回 0，实际大小可以通过文件系统 API 获取
      return 0;
    } catch (e) {
      return 0;
    }
  }
}
