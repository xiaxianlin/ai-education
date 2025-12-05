import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/screens/home/presentation/widgets/welcome_card.dart';
import 'package:student_app/screens/home/presentation/widgets/practice_card.dart';
import 'package:student_app/screens/home/presentation/widgets/quick_actions.dart';
import 'package:student_app/core/theme/app_colors.dart';

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
              
              // 三个练习卡片（垂直排列，适合移动端）
              PracticeCard(
                title: '每日练习',
                description: '快来开始今天的练习吧！✨',
                icon: '📆',
                onTap: () => context.push('/practice/daily'),
              ),
              const SizedBox(height: 12),
              PracticeCard(
                title: '单元练习',
                description: '选择单元开始练习，巩固知识点！✨',
                icon: '📚',
                onTap: () => context.push('/practice/unit'),
              ),
              const SizedBox(height: 12),
              PracticeCard(
                title: '综合评估',
                description: '让AI帮你找到学习的方向！✨',
                icon: '🎯',
                onTap: () => context.push('/practice/assessment'),
              ),
              const SizedBox(height: 24),
              
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

