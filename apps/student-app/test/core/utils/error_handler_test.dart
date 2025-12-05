import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:student_app/core/utils/error_handler.dart';

void main() {
  group('ErrorHandler', () {
    test('应该正确处理 DioException', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/test'),
        type: DioExceptionType.connectionTimeout,
      );

      final message = ErrorHandler.getErrorMessage(error);
      expect(message, isNotEmpty);
      expect(message, contains('网络'));
    });

    test('应该正确处理 HTTP 状态码错误', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/test'),
        response: Response(
          requestOptions: RequestOptions(path: '/test'),
          statusCode: 500,
          data: {'message': '服务器错误'},
        ),
        type: DioExceptionType.badResponse,
      );

      final message = ErrorHandler.getErrorMessage(error);
      expect(message, contains('服务器'));
    });

    test('应该正确判断网络错误', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/test'),
        type: DioExceptionType.connectionTimeout,
      );

      expect(ErrorHandler.isNetworkError(error), isTrue);
    });

    test('应该正确判断服务器错误', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/test'),
        response: Response(
          requestOptions: RequestOptions(path: '/test'),
          statusCode: 500,
        ),
        type: DioExceptionType.badResponse,
      );

      expect(ErrorHandler.isServerError(error), isTrue);
    });
  });
}

