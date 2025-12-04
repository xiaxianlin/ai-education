import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/error_interceptor.dart';

/// API 响应格式
class ApiResponse<T> {
  final T? data;
  final String? message;
  final int? status;

  ApiResponse({
    this.data,
    this.message,
    this.status,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse<T>(
      data: json['data'] != null
          ? (fromJsonT != null ? fromJsonT(json['data']) : json['data'] as T)
          : null,
      message: json['message'] as String?,
      status: json['status'] as int?,
    );
  }
}

/// API 客户端
class ApiClient {
  ApiClient._();

  static final ApiClient _instance = ApiClient._();
  static ApiClient get instance => _instance;

  late final Dio _dio;

  /// 初始化 Dio 客户端
  void init() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.apiBaseUrl,
        connectTimeout: ApiConstants.timeout,
        receiveTimeout: ApiConstants.timeout,
        sendTimeout: ApiConstants.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      ),
    );

    // 添加拦截器
    _dio.interceptors.add(AuthInterceptor());
    _dio.interceptors.add(ErrorInterceptor());
    _dio.interceptors.add(
      InterceptorsWrapper(
        onResponse: (response, handler) {
          // 统一解析响应格式
          final data = response.data;
          if (data is Map<String, dynamic>) {
            final apiResponse = ApiResponse.fromJson(data, null);
            // 如果 status 不为 0，说明有业务错误
            if (apiResponse.status != null && apiResponse.status != 0) {
              return handler.reject(
                DioException(
                  requestOptions: response.requestOptions,
                  response: response,
                  type: DioExceptionType.badResponse,
                  error: apiResponse.message ?? '请求失败',
                ),
              );
            }
            // 提取 data 字段
            response.data = apiResponse.data;
          }
          return handler.next(response);
        },
      ),
    );
  }

  /// GET 请求
  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? fromJsonT,
  }) async {
    final response = await _dio.get<dynamic>(
      path,
      queryParameters: queryParameters,
      options: options,
    );
    if (fromJsonT != null && response.data != null) {
      return fromJsonT(response.data);
    }
    return response.data as T;
  }

  /// POST 请求
  Future<T> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? fromJsonT,
  }) async {
    final response = await _dio.post<dynamic>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
    if (fromJsonT != null && response.data != null) {
      return fromJsonT(response.data);
    }
    return response.data as T;
  }

  /// POST FormData 请求（用于文件上传）
  Future<T> postForm<T>(
    String path, {
    required FormData formData,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? fromJsonT,
    ProgressCallback? onSendProgress,
  }) async {
    final response = await _dio.post<dynamic>(
      path,
      data: formData,
      queryParameters: queryParameters,
      options: options ?? Options(contentType: 'multipart/form-data'),
      onSendProgress: onSendProgress,
    );
    if (fromJsonT != null && response.data != null) {
      return fromJsonT(response.data);
    }
    return response.data as T;
  }

  /// PUT 请求
  Future<T> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? fromJsonT,
  }) async {
    final response = await _dio.put<dynamic>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
    if (fromJsonT != null && response.data != null) {
      return fromJsonT(response.data);
    }
    return response.data as T;
  }

  /// DELETE 请求
  Future<T> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? fromJsonT,
  }) async {
    final response = await _dio.delete<dynamic>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
    if (fromJsonT != null && response.data != null) {
      return fromJsonT(response.data);
    }
    return response.data as T;
  }
}

