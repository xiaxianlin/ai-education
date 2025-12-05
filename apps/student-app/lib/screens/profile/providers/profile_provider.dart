import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart' show StateNotifier;
import 'package:dio/dio.dart';
import 'package:student_app/core/api/endpoints/profile_endpoints.dart';
import 'package:student_app/core/models/profile_response.dart';
import 'package:student_app/core/models/student.dart';
import 'package:student_app/core/models/textbook.dart';
import 'package:student_app/core/utils/storage.dart';
import 'package:student_app/core/utils/error_handler.dart';

/// 个人中心状态
class ProfileState {
  final Student? student;
  final List<Textbook> textbooks;
  final List<Textbook> activeTextbooks;
  final List<String> subjects;
  final bool isLoading;
  final String? error;

  const ProfileState({
    this.student,
    this.textbooks = const [],
    this.activeTextbooks = const [],
    this.subjects = const [],
    this.isLoading = false,
    this.error,
  });

  ProfileState copyWith({
    Student? student,
    List<Textbook>? textbooks,
    List<Textbook>? activeTextbooks,
    List<String>? subjects,
    bool? isLoading,
    String? error,
  }) {
    return ProfileState(
      student: student ?? this.student,
      textbooks: textbooks ?? this.textbooks,
      activeTextbooks: activeTextbooks ?? this.activeTextbooks,
      subjects: subjects ?? this.subjects,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// 个人中心状态管理 Provider
class ProfileNotifier extends StateNotifier<ProfileState> {
  ProfileNotifier() : super(const ProfileState());

  /// 获取个人中心数据
  Future<void> getProfile() async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      // 调用API获取数据
      final response = await ProfileEndpoints.getProfile();

      // 计算激活的教材（当前年级的教材）
      final activeTextbooks = response.textbooks
          .where((book) => book.grade == response.student.grade)
          .toList()
        ..sort((a, b) {
          // 先按 subject 排序
          if (a.subject != b.subject) {
            return a.subject.compareTo(b.subject);
          }
          // subject 相同再按 semester 排序
          const semesterOrder = {'上学期': 0, '下学期': 1};
          final orderA = semesterOrder[a.semester] ?? 2;
          final orderB = semesterOrder[b.semester] ?? 2;
          return orderA.compareTo(orderB);
        });

      // 计算所有科目（去重）
      final subjects = response.textbooks
          .map((book) => book.subject)
          .toSet()
          .toList();

      // 保存用户信息到本地存储
      await Storage.saveUserInfo(response.student);

      // 更新状态
      state = state.copyWith(
        student: response.student,
        textbooks: response.textbooks,
        activeTextbooks: activeTextbooks,
        subjects: subjects,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      final errorMessage = ErrorHandler.getErrorMessage(e);
      state = state.copyWith(
        isLoading: false,
        error: errorMessage,
      );
      
      // 如果是认证错误（登录失效），不要 rethrow，避免未处理异常
      // ErrorInterceptor 已经处理了清除 token 和跳转登录的逻辑
      if (e is DioException) {
        final isAuthError = errorMessage.contains('登录失效') ||
            errorMessage.contains('登录已失效') ||
            errorMessage.contains('未授权') ||
            (e.response?.statusCode == 401 || e.response?.statusCode == 403);
        
        if (isAuthError) {
          // 认证错误已经由 ErrorInterceptor 处理，不需要继续传播
          return;
        }
      }
      
      // 其他错误继续传播
      rethrow;
    }
  }

  /// 刷新个人中心数据
  Future<void> refresh() async {
    await getProfile();
  }

  /// 获取当前状态（公共方法，用于 Provider 访问）
  ProfileState get currentState => state;
}

/// 个人中心状态 Provider (Riverpod 3.x compatible)
final profileProvider = Provider<ProfileNotifier>((ref) {
  return ProfileNotifier();
});

/// 个人中心状态 Provider (用于访问状态)
final profileStateProvider = Provider<ProfileState>((ref) {
  return ref.watch(profileProvider).currentState;
});

/// 个人中心数据 FutureProvider（用于自动加载）
final profileFutureProvider = FutureProvider<ProfileResponse>((ref) async {
  return await ProfileEndpoints.getProfile();
});

