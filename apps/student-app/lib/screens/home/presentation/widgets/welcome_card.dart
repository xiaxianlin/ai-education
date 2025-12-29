import 'package:flutter/material.dart';
import 'dart:math';
import 'package:student_app/core/theme/app_colors.dart';

/// 欢迎卡片组件
/// 显示问候语和随机emoji
class WelcomeCard extends StatefulWidget {
  const WelcomeCard({super.key});

  @override
  State<WelcomeCard> createState() => _WelcomeCardState();
}

class _WelcomeCardState extends State<WelcomeCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _animationController;
  final List<String> _greetingEmojis = ['👋', '😊', '🎈', '🌈', '🎨'];
  late String _randomEmoji;

  @override
  void initState() {
    super.initState();
    // 随机选择一个emoji
    _randomEmoji = _greetingEmojis[Random().nextInt(_greetingEmojis.length)];
    
    // 创建动画控制器，用于emoji的弹跳效果
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.2),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
        gradient: const LinearGradient(
          colors: [
            AppColors.primary,
            AppColors.primaryLight,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          // Emoji区域
          AnimatedBuilder(
            animation: _animationController,
            builder: (context, child) {
              return Transform.scale(
                scale: 1.0 + (0.1 * _animationController.value),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    _randomEmoji,
                    style: const TextStyle(fontSize: 48),
                  ),
                ),
              );
            },
          ),
          const SizedBox(width: 24),
          // 文字区域
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '你好呀！',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '今天也要加油学习哦~ 💪',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withValues(alpha: 0.9),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

