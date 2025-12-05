import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:student_app/core/models/question.dart';
import 'package:student_app/core/utils/image_cache_config.dart';
import 'package:student_app/core/utils/resource.dart';
import 'package:student_app/screens/practice/session/providers/session_provider.dart';

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

  /// 获取答题状态颜色
  Color? _getStatusColor(AnswerStatus? status) {
    if (status == null) return null;
    switch (status) {
      case AnswerStatus.correct:
        return Colors.green;
      case AnswerStatus.wrong:
        return Colors.red;
      case AnswerStatus.unanswered:
        return null;
    }
  }

  /// 获取答题状态文本
  String? _getStatusText(AnswerStatus? status) {
    if (status == null) return null;
    switch (status) {
      case AnswerStatus.correct:
        return '✓ 回答正确';
      case AnswerStatus.wrong:
        return '✗ 回答错误';
      case AnswerStatus.unanswered:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: answerStatus != null
            ? BorderSide(
                color: _getStatusColor(answerStatus) ?? Colors.transparent,
                width: 2,
              )
            : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 题目序号和类型
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '第 ${index + 1} 题',
                    style: TextStyle(
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    _getQuestionTypeName(question.type),
                    style: TextStyle(
                      color: Colors.grey.shade700,
                      fontSize: 12,
                    ),
                  ),
                ),
                const Spacer(),
                // 答题状态
                if (answerStatus != null && answerStatus != AnswerStatus.unanswered)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(answerStatus)?.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      _getStatusText(answerStatus) ?? '',
                      style: TextStyle(
                        color: _getStatusColor(answerStatus),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            // 题目内容
            Text(
              question.content,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    fontSize: 16,
                    height: 1.5,
                  ),
            ),
            // 题目资源（图片/音频）
            if (question.resource != null && question.resource!.isNotEmpty) ...[
              const SizedBox(height: 16),
              _buildResource(context),
            ],
            // 选项（如果是选择题）
            if (question.type == 'choice' &&
                question.options != null &&
                question.options!.isNotEmpty) ...[
              const SizedBox(height: 16),
              _buildOptions(context),
            ],
          ],
        ),
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

      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: CachedNetworkImage(
          imageUrl: imageUrl,
          cacheManager: ImageCacheConfig.defaultCacheManager,
          placeholder: (context, url) => ImageCacheConfig.getPlaceholder(
            height: 200,
            fit: BoxFit.contain,
          ),
          errorWidget: (context, url, error) => ImageCacheConfig.getErrorWidget(
            height: 200,
            onRetry: () {
              // 重新加载图片
              // CachedNetworkImage 会自动重试
            },
          ),
          fit: BoxFit.contain,
          fadeInDuration: const Duration(milliseconds: 300),
          fadeOutDuration: const Duration(milliseconds: 100),
        ),
      );
    } else if (question.resourceType == 'audio') {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.blue.shade50,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(Icons.audiotrack, color: Colors.blue.shade700),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '音频资源',
                    style: TextStyle(
                      color: Colors.blue.shade700,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (question.resourceContent != null)
                    Text(
                      question.resourceContent!,
                      style: TextStyle(
                        color: Colors.blue.shade600,
                        fontSize: 12,
                      ),
                    ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.play_circle_outline),
              onPressed: () {
                // TODO: 实现音频播放
              },
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
        Text(
          '选项：',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 8),
        ...options.map((option) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Text(
                  option.trim(),
                  style: const TextStyle(fontSize: 14),
                ),
              ),
            ),),
      ],
    );
  }
}

