import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:state_notifier/state_notifier.dart' show StateNotifier;
import 'package:student_app/core/api/endpoints/auth_endpoints.dart';
import 'package:student_app/core/utils/storage.dart';
import 'package:student_app/core/utils/error_handler.dart';
import 'package:student_app/app/router.dart';

/// 认证状态
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// 认证状态管理 Provider
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    // 初始化时检查是否有token
    _checkAuthStatus();
  }

  /// 检查认证状态
  Future<void> _checkAuthStatus() async {
    final token = Storage.getToken();
    if (token == null) {
      state = const AuthState(isAuthenticated: false);
      return;
    }

    // 如果有token，验证其有效性
    try {
      state = state.copyWith(isLoading: true);
      await AuthEndpoints.check();
      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      // Token无效，清除本地存储
      await Storage.removeToken();
      await Storage.clearAll();
      state = state.copyWith(
        isAuthenticated: false,
        isLoading: false,
        error: null,
      );
    }
  }

  /// 登录
  Future<void> login(String phone, String password) async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      // 调用登录API
      final token = await AuthEndpoints.login(phone: phone, password: password);

      // 保存token
      await Storage.saveToken(token);

      // 更新状态
      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        error: null,
      );
      
      // 通知路由守卫认证状态已更新
      AppRouter.authNotifier.updateAuthStatus();
    } catch (e) {
      // 处理错误
      state = state.copyWith(
        isAuthenticated: false,
        isLoading: false,
        error: ErrorHandler.getErrorMessage(e),
      );
      rethrow;
    }
  }

  /// 退出登录
  Future<void> logout() async {
    // 清除本地存储
    await Storage.removeToken();
    await Storage.clearAll();

    // 更新状态
    state = const AuthState(isAuthenticated: false);
    
    // 通知路由守卫认证状态已更新
    AppRouter.authNotifier.updateAuthStatus();
  }

  /// 检查认证状态（公开方法，用于手动刷新）
  Future<void> checkAuthStatus() async {
    await _checkAuthStatus();
  }

  /// 获取当前状态（公共方法，用于 Provider 访问）
  AuthState get currentState => state;
}

/// 认证状态 Provider (Riverpod 3.x compatible)
/// 使用 Provider 包装 StateNotifier，并提供状态访问
final authProvider = Provider<AuthNotifier>((ref) {
  return AuthNotifier();
});

/// 认证状态 Provider (用于访问状态)
/// 通过 notifier 的公共方法访问 state
final authStateProvider = Provider<AuthState>((ref) {
  final notifier = ref.watch(authProvider);
  return notifier.currentState;
});

