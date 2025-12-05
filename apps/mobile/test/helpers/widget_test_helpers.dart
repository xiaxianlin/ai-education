import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Widget 测试辅助函数
class WidgetTestHelpers {
  WidgetTestHelpers._();

  /// 创建测试用的 MaterialApp
  /// 在 Riverpod 3.x 中，overrides 参数类型由 ProviderScope 自动推断
  static Widget createTestApp({
    required Widget child,
    overrides,
  }) {
    return ProviderScope(
      overrides: overrides,
      child: MaterialApp(
        home: Scaffold(
          body: child,
        ),
      ),
    );
  }

  /// 查找文本
  static Finder findText(String text) {
    return find.text(text);
  }

  /// 查找图标
  static Finder findIcon(IconData icon) {
    return find.byIcon(icon);
  }

  /// 查找按钮
  static Finder findButton(String text) {
    return find.widgetWithText(ElevatedButton, text);
  }

  /// 等待动画完成
  static Future<void> waitForAnimation() async {
    await Future.delayed(const Duration(milliseconds: 500));
  }
}

