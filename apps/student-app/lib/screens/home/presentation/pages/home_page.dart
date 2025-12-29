import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/screens/home/presentation/widgets/welcome_card.dart';
import 'package:student_app/screens/home/presentation/widgets/practice_card.dart';
import 'package:student_app/screens/home/presentation/widgets/quick_actions.dart';
import 'package:student_app/screens/home/providers/practice_list_provider.dart';
import 'package:student_app/core/theme/app_colors.dart';
import 'package:student_app/shared/widgets/responsive_layout.dart';

// 练习类型到路径的映射
const _practiceTypePathMap = {
  'daily_practice': '/practice/daily',
  'unit_practice': '/practice/unit',
  'assessment': '/practice/assessment',
};

// 默认图标映射
const _defaultIcons = {
  'daily_practice': '📆',
  'unit_practice': '📚',
  'assessment': '🎯',
};

// 默认练习列表（兼容旧逻辑）
const _defaultPractices = [
  {'name': '日常练习', 'practice_type': 'daily_practice', 'description': '快来开始今天的练习吧！✨'},
  {'name': '单元练习', 'practice_type': 'unit_practice', 'description': '选择单元开始练习，巩固知识点！✨'},
  {'name': '综合评估', 'practice_type': 'assessment', 'description': '让AI帮你找到学习的方向！✨'},
];

/// 首页主组件
class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: MaxWidthContainer(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: CustomScrollView(
            slivers: [
              // 欢迎卡片
              const SliverToBoxAdapter(
                child: WelcomeCard(),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 32)),
              
              // 开始练习标题
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4),
                  child: Row(
                    children: [
                      Text(
                        '🚀',
                        style: TextStyle(fontSize: 24),
                      ),
                      SizedBox(width: 8),
                      Text(
                        '发现新挑战',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 20)),
              
              // 练习卡片列表
              ref.watch(practiceListProvider).when(
                data: (practices) {
                  final displayPractices = practices.isNotEmpty ? practices : null;
                  
                  if (displayPractices == null) {
                    return _buildPracticeGrid(context, _defaultPractices.map((p) => _PracticeAdapter(
                      title: p['name'] as String,
                      description: p['description'] as String,
                      icon: _defaultIcons[p['practice_type']] ?? '📝',
                      path: _practiceTypePathMap[p['practice_type']] ?? '/practice/daily',
                    )).toList());
                  }

                  return _buildPracticeGrid(context, displayPractices.map((p) => _PracticeAdapter(
                    title: p.name,
                    description: p.description ?? '开始练习，提升你的学习能力！✨',
                    icon: p.icon ?? _defaultIcons[p.practiceType] ?? '📝',
                    path: _practiceTypePathMap[p.practiceType] ?? '/practice/${p.slug}',
                  )).toList());
                },
                loading: () => const SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(40),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                ),
                error: (error, stack) => _buildPracticeGrid(context, _defaultPractices.map((p) => _PracticeAdapter(
                  title: p['name'] as String,
                  description: p['description'] as String,
                  icon: _defaultIcons[p['practice_type']] ?? '📝',
                  path: _practiceTypePathMap[p['practice_type']] ?? '/practice/daily',
                )).toList()),
              ),
              
              const SliverToBoxAdapter(child: SizedBox(height: 32)),
              
              // 快速操作
              const SliverToBoxAdapter(
                child: QuickActions(),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPracticeGrid(BuildContext context, List<_PracticeAdapter> practices) {
    return SliverLayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.crossAxisExtent > 600 ? 2 : 1;
        
        return SliverGrid(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            mainAxisExtent: 180, // 固定高度
          ),
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final practice = practices[index];
              return PracticeCard(
                title: practice.title,
                description: practice.description,
                icon: practice.icon,
                onTap: () => context.push(practice.path),
              );
            },
            childCount: practices.length,
          ),
        );
      },
    );
  }
}

class _PracticeAdapter {
  final String title;
  final String description;
  final String icon;
  final String path;

  _PracticeAdapter({
    required this.title,
    required this.description,
    required this.icon,
    required this.path,
  });
}

