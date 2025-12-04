import 'package:go_router/go_router.dart';

/// 全局导航助手
/// 用于在拦截器等无法直接访问 BuildContext 的地方进行路由跳转
class NavigationHelper {
  NavigationHelper._();

  static GoRouter? _router;

  /// 设置全局 GoRouter 实例
  static void setRouter(GoRouter router) {
    _router = router;
  }

  /// 获取 GoRouter 实例
  static GoRouter? get router => _router;

  /// 跳转到登录页
  static void navigateToLogin() {
    if (_router != null) {
      // 使用 go 替换当前路由，避免返回时回到需要登录的页面
      _router!.go('/login');
    }
  }

  /// 跳转到首页
  static void navigateToHome() {
    if (_router != null) {
      _router!.go('/home');
    }
  }
}

