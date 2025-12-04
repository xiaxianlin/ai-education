import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/shared/widgets/empty_state.dart';
import '../../helpers/widget_test_helpers.dart';

void main() {
  group('EmptyState', () {
    testWidgets('应该显示空状态', (WidgetTester tester) async {
      await tester.pumpWidget(
        WidgetTestHelpers.createTestApp(
          child: const EmptyState(
            icon: Icons.inbox,
            message: '暂无数据',
          ),
        ),
      );

      expect(find.byIcon(Icons.inbox), findsOneWidget);
      expect(find.text('暂无数据'), findsOneWidget);
    });

    testWidgets('应该显示操作按钮', (WidgetTester tester) async {
      bool actionCalled = false;

      await tester.pumpWidget(
        WidgetTestHelpers.createTestApp(
          child: EmptyState(
            icon: Icons.inbox,
            message: '暂无数据',
            actionLabel: '刷新',
            onAction: () {
              actionCalled = true;
            },
          ),
        ),
      );

      final button = find.text('刷新');
      expect(button, findsOneWidget);

      await tester.tap(button);
      await tester.pump();

      expect(actionCalled, isTrue);
    });
  });
}

