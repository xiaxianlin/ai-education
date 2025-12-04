import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/utils/storage.dart';

void main() {
  group('Storage', () {
    setUp(() async {
      await Storage.init();
    });

    tearDown(() async {
      await Storage.clearAll();
    });

    test('应该能够存储和读取 Token', () async {
      const token = 'test_token_123';
      await Storage.saveToken(token);
      final retrievedToken = Storage.getToken();
      expect(retrievedToken, equals(token));
    });

    test('应该能够删除 Token', () async {
      const token = 'test_token_123';
      await Storage.saveToken(token);
      await Storage.removeToken();
      final retrievedToken = Storage.getToken();
      expect(retrievedToken, isNull);
    });

    test('应该能够清除所有数据', () async {
      const token = 'test_token_123';
      await Storage.saveToken(token);
      await Storage.clearAll();
      final retrievedToken = Storage.getToken();
      expect(retrievedToken, isNull);
    });
  });
}

