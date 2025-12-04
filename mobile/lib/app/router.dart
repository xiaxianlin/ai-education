import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/utils/storage.dart';

/// 路由配置
class AppRouter {
  AppRouter._();

  /// 检查是否已登录
  static bool _isLoggedIn() {
    return Storage.getToken() != null;
  }

  /// 路由配置
  static final GoRouter router = GoRouter(
    initialLocation: '/login',
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
        builder: (context, state) {
          // TODO: 实现登录页面
          return const Scaffold(
            body: Center(child: Text('Login Page')),
          );
        },
      ),
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) {
          // TODO: 实现首页
          return const Scaffold(
            body: Center(child: Text('Home Page')),
          );
        },
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) {
          // TODO: 实现个人中心
          return const Scaffold(
            body: Center(child: Text('Profile Page')),
          );
        },
      ),
      GoRoute(
        path: '/practice/daily',
        name: 'daily-practice',
        builder: (context, state) {
          // TODO: 实现每日练习
          return const Scaffold(
            body: Center(child: Text('Daily Practice Page')),
          );
        },
      ),
      GoRoute(
        path: '/practice/unit',
        name: 'unit-practice',
        builder: (context, state) {
          // TODO: 实现单元练习
          return const Scaffold(
            body: Center(child: Text('Unit Practice Page')),
          );
        },
      ),
      GoRoute(
        path: '/practice/assessment',
        name: 'assessment',
        builder: (context, state) {
          // TODO: 实现能力评测
          return const Scaffold(
            body: Center(child: Text('Assessment Page')),
          );
        },
      ),
      GoRoute(
        path: '/practice/session/:id',
        name: 'practice-session',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          // TODO: 实现练习会话
          return Scaffold(
            body: Center(child: Text('Practice Session: $id')),
          );
        },
      ),
      GoRoute(
        path: '/practice/detail/:id',
        name: 'practice-detail',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          // TODO: 实现练习详情
          return Scaffold(
            body: Center(child: Text('Practice Detail: $id')),
          );
        },
      ),
      GoRoute(
        path: '/practice/report/:id',
        name: 'practice-report',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          // TODO: 实现练习报告
          return Scaffold(
            body: Center(child: Text('Practice Report: $id')),
          );
        },
      ),
      GoRoute(
        path: '/practice/history',
        name: 'practice-history',
        builder: (context, state) {
          // TODO: 实现练习历史
          return const Scaffold(
            body: Center(child: Text('Practice History Page')),
          );
        },
      ),
      GoRoute(
        path: '/wrong-records',
        name: 'wrong-records',
        builder: (context, state) {
          // TODO: 实现错题本
          return const Scaffold(
            body: Center(child: Text('Wrong Records Page')),
          );
        },
      ),
    ],
  );
}

