import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:student_app/core/models/question.dart';
import 'package:student_app/core/utils/image_cache_config.dart';
import 'package:student_app/core/utils/resource.dart';
import 'package:student_app/screens/practice/session/providers/session_provider.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 题目卡片组件
class QuestionCard extends StatelessWidget {
  final Question question;
  final int index;
  final AnswerStatus? answerStatus;

  const QuestionCard({
    super.key,
    required this.question,
    required this.index,
    this.answerStatus,
  });

  /// 获取题目类型显示名称
  String _getQuestionTypeName(String type) {
    switch (type) {
      case 'choice':
        return '选择题';
      case 'judge':
        return '判断题';
      case 'fill':
        return '填空题';
      case 'oral':
        return '口语题';
      default:
        return type;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shadowColor: Colors.black.withValues(alpha: 0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: answerStatus != null
            ? BorderSide(
                color: answerStatus == AnswerStatus.correct
                    ? AppColors.success.withValues(alpha: 0.5)
                    : AppColors.error.withValues(alpha: 0.5),
                width: 2,
              )
            : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 顶部栏：题目序号、类型、难度、知识点
            _buildHeader(context),
            const SizedBox(height: 16),
            
            // 答题结果徽章 (Premium)
            if (answerStatus != null && answerStatus != AnswerStatus.unanswered)
              _buildResultBadge(context),
            
            const SizedBox(height: 16),
            
            // 题目内容
            Text(
              question.content,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    height: 1.6,
                    color: AppColors.textPrimary,
                  ),
            ),
            
            // 题目资源（图片/音频）
            if (question.resource != null && question.resource!.isNotEmpty) ...[
              const SizedBox(height: 20),
              _buildResource(context),
            ],
            
            // 选项（如果是选择题）
            if (question.type == 'choice' &&
                question.options != null &&
                question.options!.isNotEmpty) ...[
              const SizedBox(height: 20),
              _buildOptions(context),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '第 ${index + 1} 题',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.muted,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                _getQuestionTypeName(question.type),
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        if (question.difficulty != null || question.knowledge != null) ...[
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (question.difficulty != null)
                _buildTag(
                  question.difficulty!,
                  AppColors.primary.withValues(alpha: 0.1),
                  AppColors.primary,
                ),
              if (question.knowledge != null)
                _buildTag(
                  question.knowledge!,
                  const Color(0xFFF59E0B).withValues(alpha: 0.1),
                  const Color(0xFFD97706),
                ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildTag(String label, Color bgColor, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: textColor.withValues(alpha: 0.2)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildResultBadge(BuildContext context) {
    final isCorrect = answerStatus == AnswerStatus.correct;
    final bgColor = isCorrect 
        ? AppColors.success.withValues(alpha: 0.1) 
        : AppColors.error.withValues(alpha: 0.1);
    final iconColor = isCorrect ? AppColors.success : AppColors.error;
    final emoji = isCorrect ? '😊✨' : '💪💖';
    final text = isCorrect ? '回答正确' : '回答错误';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: iconColor.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 10),
          Text(
            text,
            style: TextStyle(
              color: iconColor,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  /// 构建资源显示（图片/音频）
  Widget _buildResource(BuildContext context) {
    if (question.resourceType == 'image') {
      final imageUrl = Resource.getResourceUrl(question.resource);
      if (imageUrl == null) {
        return const SizedBox.shrink();
      }

      return Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: CachedNetworkImage(
          imageUrl: imageUrl,
          cacheManager: ImageCacheConfig.defaultCacheManager,
          placeholder: (context, url) => ImageCacheConfig.getPlaceholder(
            height: 250,
            fit: BoxFit.contain,
          ),
          errorWidget: (context, url, error) => ImageCacheConfig.getErrorWidget(
            height: 250,
            onRetry: () {},
          ),
          fit: BoxFit.contain,
          fadeInDuration: const Duration(milliseconds: 300),
        ),
      );
    } else if (question.resourceType == 'audio') {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.1)),
        ),
        child: Row(
          children: [
            const CircleAvatar(
              backgroundColor: AppColors.primary,
              child: Icon(Icons.audiotrack, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '音频资源',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (question.resourceContent != null)
                    Text(
                      question.resourceContent!,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.play_circle_filled, color: AppColors.primary, size: 36),
              onPressed: () {},
            ),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }

  /// 构建选项（选择题）
  Widget _buildOptions(BuildContext context) {
    final options = question.options!.split('\n').where((o) => o.isNotEmpty).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '选项：',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        ...options.map((option) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: AppColors.muted.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(
                  option.trim(),
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ),),
      ],
    );
  }
}


