import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// 测试辅助函数
class TestHelpers {
  TestHelpers._();

  /// 创建测试用的 WidgetTester
  static WidgetTester createTester() {
    // 这个函数主要用于文档说明
    // 实际使用时直接使用 testWidgets 即可
    throw UnimplementedError('Use testWidgets instead');
  }

  /// 等待异步操作完成
  static Future<void> waitForAsync() async {
    await Future.delayed(const Duration(milliseconds: 100));
  }

  /// 等待多个异步操作完成
  static Future<void> waitForMultipleAsync(int count) async {
    for (int i = 0; i < count; i++) {
      await waitForAsync();
    }
  }
}

/// Provider 测试辅助
extension ProviderTestExtension on ProviderContainer {
  /// 等待 Provider 更新
  /// 在 Riverpod 3.x 中，使用 Provider 替代 ProviderBase
  Future<void> waitForProvider<T>(Provider<T> provider) async {
    read(provider);
    await TestHelpers.waitForAsync();
  }
}

