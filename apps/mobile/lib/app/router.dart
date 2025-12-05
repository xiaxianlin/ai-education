import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/utils/storage.dart';
import '../features/auth/presentation/pages/login_page.dart';
import '../features/home/presentation/pages/home_page.dart';
import '../features/profile/presentation/pages/profile_page.dart';
import '../features/textbook/presentation/pages/textbook_list_page.dart';
import '../features/textbook/presentation/pages/unit_list_page.dart';
import '../features/practice/daily/presentation/pages/daily_practice_page.dart';
import '../features/practice/unit/presentation/pages/unit_practice_page.dart';
import '../features/practice/assessment/presentation/pages/assessment_page.dart';
import '../features/practice/session/presentation/pages/practice_session_page.dart';
import '../features/practice/history/presentation/pages/practice_history_page.dart';
import '../features/practice/detail/presentation/pages/practice_detail_page.dart';
import '../features/practice/report/presentation/pages/practice_report_page.dart';
import '../features/wrong_records/presentation/pages/wrong_records_page.dart';
import '../shared/widgets/main_layout.dart';

/// 认证状态监听器
/// 用于路由守卫监听认证状态变化
class AuthStateNotifier extends ChangeNotifier {
  bool _isLoggedIn = false;

  AuthStateNotifier() {
    _checkAuthStatus();
  }

  bool get isLoggedIn => _isLoggedIn;

  void _checkAuthStatus() {
    final token = Storage.getToken();
    final newState = token != null;
    if (_isLoggedIn != newState) {
      _isLoggedIn = newState;
      notifyListeners();
    }
  }

  /// 更新认证状态（在登录/登出时调用）
  void updateAuthStatus() {
    _checkAuthStatus();
  }
}

/// 路由配置
class AppRouter {
  AppRouter._();

  static final AuthStateNotifier _authNotifier = AuthStateNotifier();

  /// 获取认证状态监听器
  static AuthStateNotifier get authNotifier => _authNotifier;

  /// 检查是否已登录
  static bool _isLoggedIn() {
    return Storage.getToken() != null;
  }

  /// 路由配置
  static final GoRouter router = GoRouter(
    initialLocation: '/login',
    refreshListenable: _authNotifier,
    redirect: (context, state) {
      final isLoggedIn = _isLoggedIn();
      final isLoginPage = state.matchedLocation == '/login';

      // 如果未登录且不在登录页，重定向到登录页
      if (!isLoggedIn && !isLoginPage) {
        return '/login';
      }

      // 如果已登录且在登录页，重定向到首页
      if (isLoggedIn && isLoginPage) {
        return '/home';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      // 使用 ShellRoute 包装需要底部导航的主要页面
      ShellRoute(
        builder: (context, state, child) => MainLayout(
          state: state,
          child: child,
        ),
        routes: [
          GoRoute(
            path: '/home',
            name: 'home',
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfilePage(),
          ),
          GoRoute(
            path: '/practice/daily',
            name: 'daily-practice',
            builder: (context, state) => const DailyPracticePage(),
          ),
          GoRoute(
            path: '/practice/unit',
            name: 'unit-practice',
            builder: (context, state) => const UnitPracticePage(),
          ),
          GoRoute(
            path: '/practice/assessment',
            name: 'assessment',
            builder: (context, state) => const AssessmentPage(),
          ),
          GoRoute(
            path: '/practice/history',
            name: 'practice-history',
            builder: (context, state) => const PracticeHistoryPage(),
          ),
          GoRoute(
            path: '/wrong-records',
            name: 'wrong-records',
            builder: (context, state) => const WrongRecordsPage(),
          ),
        ],
      ),
      // 不需要底部导航的页面（独立路由）
      GoRoute(
        path: '/textbooks',
        name: 'textbooks',
        builder: (context, state) => const TextbookListPage(),
      ),
      GoRoute(
        path: '/textbooks/:textbookId/units',
        name: 'textbook-units',
        builder: (context, state) {
          final textbookIdStr = state.pathParameters['textbookId'];
          final textbookId = textbookIdStr != null ? int.tryParse(textbookIdStr) : null;
          if (textbookId == null) {
            return const Scaffold(
              body: Center(child: Text('无效的教材ID')),
            );
          }
          return UnitListPage(textbookId: textbookId);
        },
      ),
      GoRoute(
        path: '/practice/session/:id',
        name: 'practice-session',
        builder: (context, state) {
          final id = state.pathParameters['id'];
          if (id == null || id.isEmpty) {
            return const Scaffold(
              body: Center(child: Text('无效的会话ID')),
            );
          }
          return PracticeSessionPage(sessionId: id);
        },
      ),
      GoRoute(
        path: '/practice/detail/:id',
        name: 'practice-detail',
        builder: (context, state) {
          final id = state.pathParameters['id'];
          if (id == null || id.isEmpty) {
            return const Scaffold(
              body: Center(child: Text('无效的练习ID')),
            );
          }
          final sessionId = int.tryParse(id);
          if (sessionId == null) {
            return const Scaffold(
              body: Center(child: Text('无效的练习ID')),
            );
          }
          return PracticeDetailPage(sessionId: sessionId);
        },
      ),
      GoRoute(
        path: '/practice/report/:id',
        name: 'practice-report',
        builder: (context, state) {
          final id = state.pathParameters['id'];
          if (id == null || id.isEmpty) {
            return const Scaffold(
              body: Center(child: Text('无效的报告ID')),
            );
          }
          // 注意：报告页面使用 sessionId 来获取报告数据
          // 这里 id 参数实际上是 sessionId
          final sessionId = int.tryParse(id);
          if (sessionId == null) {
            return const Scaffold(
              body: Center(child: Text('无效的会话ID')),
            );
          }
          return PracticeReportPage(
            reportId: sessionId, // 临时使用 sessionId 作为 reportId
            sessionId: sessionId,
          );
        },
      ),
    ],
  );
}

