import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:student_app/core/models/question_v2.dart';
import 'package:student_app/core/utils/image_cache_config.dart';
import 'package:student_app/core/utils/resource.dart';
import 'package:student_app/screens/practice/session/providers/session_provider.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 题目卡片组件
class QuestionCard extends StatelessWidget {
  final QuestionV2 question;
  final int index;
  final AnswerStatus? answerStatus;

  const QuestionCard({
    super.key,
    required this.question,
    required this.index,
    this.answerStatus,
  });

  /// 获取题目类型显示名称
  String _getQuestionTypeName() {
    return interactionTypeLabels[question.questionTypeCode] ?? question.questionTypeCode;
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
            _buildContent(context),
            
            // 题目资源（图片/音频）
            _buildResources(context),
            
            // 选项（如果是选择题）
            _buildOptions(context),
            
            // 提示（V2）
            if (question.stem.hints != null)
              _buildHints(context, question.stem.hints!),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Text(
      question.stem.text,
      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            fontSize: 18,
            fontWeight: FontWeight.w500,
            height: 1.6,
            color: AppColors.textPrimary,
          ),
    );
  }

  Widget _buildResources(BuildContext context) {
    if (question.resources == null || question.resources!.isEmpty) return const SizedBox.shrink();
    
    return Column(
      children: question.resources!.map((r) => _buildV2Resource(context, r)).toList(),
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
                  _getQuestionTypeName(),
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          _buildTagsList(context),
        ],
      );
    }

    Widget _buildTagsList(BuildContext context) {
      final difficulty = difficultyLabels[question.difficulty] ?? question.difficulty;
      final knowledge = question.knowledgePoints?.isNotEmpty == true ? question.knowledgePoints!.first : null;

      if (knowledge == null) return const SizedBox.shrink();

      return Padding(
        padding: const EdgeInsets.only(top: 10),
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            if (difficulty != null)
              _buildTag(
                difficulty,
                AppColors.primary.withValues(alpha: 0.1),
                AppColors.primary,
              ),
            if (knowledge != null)
              _buildTag(
                knowledge,
                const Color(0xFFF59E0B).withValues(alpha: 0.1),
                const Color(0xFFD97706),
              ),
          ],
        ),
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

  Widget _buildOptions(BuildContext context) {
    final isChoice = question.questionTypeCode == 'single_choice' || question.questionTypeCode == 'multi_choice';
    if (!isChoice || question.options == null || question.options!.isEmpty) return const SizedBox.shrink();
    
    final options = question.options!.map((o) => o.text ?? '').toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
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

  Widget _buildV2Resource(BuildContext context, QuestionResourceV2 resource) {
    if (resource.type == 'image') {
      return Padding(
        padding: const EdgeInsets.only(top: 20),
        child: Container(
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
            imageUrl: resource.url,
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
        ),
      );
    } else if (resource.type == 'audio') {
      return Padding(
        padding: const EdgeInsets.only(top: 20),
        child: Container(
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
                    if (resource.transcript != null)
                      Text(
                        resource.transcript!,
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
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildHints(BuildContext context, List<String> hints) {
    if (hints.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.lightbulb_outline, color: AppColors.warning, size: 18),
              const SizedBox(width: 8),
              Text(
                '提示',
                style: TextStyle(
                  color: AppColors.warning.withValues(alpha: 0.8),
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...hints.map((hint) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  '• $hint',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                  ),
                ),
              ),),
        ],
      ),
    );
  }
}


