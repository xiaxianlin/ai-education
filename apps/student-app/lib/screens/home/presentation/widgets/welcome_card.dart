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
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(
          color: AppColors.primary.withValues(alpha: 0.2),
          width: 2,
        ),
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: AppColors.card,
        ),
        child: Row(
          children: [
            // Emoji区域
            AnimatedBuilder(
              animation: _animationController,
              builder: (context, child) {
                return Transform.translate(
                  offset: Offset(0, -8 * _animationController.value),
                  child: Text(
                    _randomEmoji,
                    style: const TextStyle(fontSize: 56),
                  ),
                );
              },
            ),
            const SizedBox(width: 16),
            // 文字区域
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 渐变标题
                  ShaderMask(
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [
                        AppColors.primary,
                        AppColors.success,
                        AppColors.primaryLight,
                      ],
                    ).createShader(bounds),
                    child: const Text(
                      '你好呀！',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '今天也要加油学习哦~ 💪',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

