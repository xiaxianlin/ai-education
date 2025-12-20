import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/screens/home/presentation/widgets/welcome_card.dart';
import 'package:student_app/screens/home/presentation/widgets/practice_card.dart';
import 'package:student_app/screens/home/presentation/widgets/quick_actions.dart';
import 'package:student_app/screens/home/providers/practice_list_provider.dart';
import 'package:student_app/core/theme/app_colors.dart';

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
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 欢迎卡片
              const WelcomeCard(),
              const SizedBox(height: 24),
              
              // 开始练习标题
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Text(
                  '🚀 开始练习',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // 练习卡片列表（动态加载）
              ref.watch(practiceListProvider).when(
                data: (practices) {
                  // 如果没有练习数据，使用默认的3个系统练习（兼容旧逻辑）
                  final displayPractices = practices.isNotEmpty 
                      ? practices 
                      : null;

                  if (displayPractices == null) {
                    // 使用默认练习列表
                    return Column(
                      children: [
                        for (var i = 0; i < _defaultPractices.length; i++) ...[
                          if (i > 0) const SizedBox(height: 12),
                          PracticeCard(
                            title: _defaultPractices[i]['name'] as String,
                            description: _defaultPractices[i]['description'] as String,
                            icon: _defaultIcons[_defaultPractices[i]['practice_type'] as String] ?? '📝',
                            onTap: () => context.push(_practiceTypePathMap[_defaultPractices[i]['practice_type'] as String] ?? '/practice/daily'),
                          ),
                        ],
                        const SizedBox(height: 24),
                      ],
                    );
                  }

                  return Column(
                    children: [
                      for (var i = 0; i < displayPractices.length; i++) ...[
                        if (i > 0) const SizedBox(height: 12),
                        Builder(
                          builder: (context) {
                            final practice = displayPractices[i];
                            final practiceType = practice.practiceType ?? '';
                            final path = _practiceTypePathMap[practiceType] ?? '/practice/${practice.slug}';
                            
                            return PracticeCard(
                              title: practice.name,
                              description: practice.description ?? '开始练习，提升你的学习能力！✨',
                              icon: practice.icon ?? _defaultIcons[practiceType] ?? '📝',
                              onTap: () => context.push(path),
                            );
                          },
                        ),
                      ],
                      const SizedBox(height: 24),
                    ],
                  );
                },
                loading: () => const Column(
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 24),
                  ],
                ),
                error: (error, stack) => Column(
                  children: [
                    Text('加载练习列表失败: $error'),
                    const SizedBox(height: 24),
                    // 降级到默认练习列表
                    for (var i = 0; i < _defaultPractices.length; i++) ...[
                      if (i > 0) const SizedBox(height: 12),
                      PracticeCard(
                        title: _defaultPractices[i]['name'] as String,
                        description: _defaultPractices[i]['description'] as String,
                        icon: _defaultIcons[_defaultPractices[i]['practice_type'] as String] ?? '📝',
                        onTap: () => context.push(_practiceTypePathMap[_defaultPractices[i]['practice_type'] as String] ?? '/practice/daily'),
                      ),
                    ],
                    const SizedBox(height: 24),
                  ],
                ),
              ),
              
              // 快速操作
              const QuickActions(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

