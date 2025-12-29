import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/shared/widgets/responsive_layout.dart';

/// 主布局组件
/// 包含底部导航栏，用于主要页面
class MainLayout extends StatelessWidget {
  final Widget child;
  final GoRouterState state;

  const MainLayout({
    super.key,
    required this.child,
    required this.state,
  });

  /// 根据路由路径获取导航索引
  static int _getSelectedIndex(String location) {
    if (location == '/home') {
      return 0;
    } else if (location.startsWith('/practice')) {
      return 1;
    } else if (location == '/wrong-records') {
      return 2;
    } else if (location == '/profile') {
      return 3;
    }
    return 0; // 默认选中首页
  }

  /// 根据索引获取路由路径
  static String _getRouteForIndex(int index) {
    switch (index) {
      case 0:
        return '/home';
      case 1:
        return '/practice/daily';
      case 2:
        return '/wrong-records';
      case 3:
        return '/profile';
      default:
        return '/home';
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentLocation = state.matchedLocation;
    final selectedIndex = _getSelectedIndex(currentLocation);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MaxWidthContainer(
                maxWidth: 600, // 限制底部栏最大宽度，防止平板上图标飞得太远
                child: BottomNavigationBar(
                  currentIndex: selectedIndex,
                  onTap: (index) {
                    final route = _getRouteForIndex(index);
                    if (currentLocation != route) {
                      context.go(route);
                    }
                  },
                  type: BottomNavigationBarType.fixed,
                  selectedItemColor: AppColors.primary,
                  unselectedItemColor: AppColors.textMuted,
                  selectedFontSize: 12,
                  unselectedFontSize: 12,
                  iconSize: 24,
                  elevation: 0,
                  backgroundColor: Colors.transparent,
                  selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
                  items: const [
                    BottomNavigationBarItem(
                      icon: Icon(Icons.home_outlined),
                      activeIcon: Icon(Icons.home_rounded),
                      label: '首页',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.auto_stories_outlined),
                      activeIcon: Icon(Icons.auto_stories_rounded),
                      label: '练习',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.edit_note_outlined),
                      activeIcon: Icon(Icons.edit_note_rounded),
                      label: '错题本',
                    ),
                    BottomNavigationBarItem(
                      icon: Icon(Icons.face_outlined),
                      activeIcon: Icon(Icons.face_rounded),
                      label: '我的',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

