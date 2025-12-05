import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:student_app/shared/widgets/loading_indicator.dart';
import '../../helpers/widget_test_helpers.dart';

void main() {
  group('LoadingIndicator', () {
    testWidgets('应该显示加载指示器', (WidgetTester tester) async {
      await tester.pumpWidget(
        WidgetTestHelpers.createTestApp(
          child: const LoadingIndicator(),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('应该显示消息', (WidgetTester tester) async {
      const message = '加载中...';
      await tester.pumpWidget(
        WidgetTestHelpers.createTestApp(
          child: const LoadingIndicator(message: message),
        ),
      );

      expect(find.text(message), findsOneWidget);
    });

    testWidgets('应该支持不同尺寸', (WidgetTester tester) async {
      await tester.pumpWidget(
        WidgetTestHelpers.createTestApp(
          child: const LoadingIndicator(size: LoadingSize.small),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });
}

