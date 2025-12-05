import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/core/api/api_client.dart';
import 'package:student_app/core/utils/storage.dart';
import 'package:student_app/core/utils/navigation_helper.dart';
import 'package:student_app/core/theme/app_theme.dart';
import 'package:student_app/app/router.dart';
import 'package:student_app/screens/auth/providers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 初始化本地存储
  await Storage.init();

  // 初始化 API 客户端
  ApiClient.instance.init();

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

/// 应用初始化组件
/// 在应用启动时检查认证状态
class AppInitializer extends ConsumerStatefulWidget {
  final Widget child;

  const AppInitializer({super.key, required this.child});

  @override
  ConsumerState<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends ConsumerState<AppInitializer> {
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    // 在下一帧检查认证状态
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAuthStatus();
    });
  }

  Future<void> _checkAuthStatus() async {
    if (!mounted) return;

    try {
      // 检查认证状态（AuthProvider构造函数会自动检查）
      await ref.read(authProvider).checkAuthStatus();
    } catch (e) {
      // 认证失败，忽略错误（路由守卫会处理）
    } finally {
      if (mounted) {
        setState(() {
          _initialized = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialized) {
      // 显示加载指示器
      return MaterialApp(
        home: Scaffold(
          body: Center(
            child: CircularProgressIndicator(
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
      );
    }

    return widget.child;
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // 设置全局 GoRouter 实例
    NavigationHelper.setRouter(AppRouter.router);

    return AppInitializer(
      child: MaterialApp.router(
        title: 'AI Education',
        theme: AppTheme.lightTheme,
        routerConfig: AppRouter.router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

