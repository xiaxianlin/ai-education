import 'package:flutter/material.dart';

/// 导航按钮组件
class NavigationButtons extends StatelessWidget {
  final bool canGoPrevious;
  final bool hasAnswered;
  final bool hasAnswer;
  final bool submitting;
  final bool isLastQuestion;
  final VoidCallback onPrevious;
  final VoidCallback onNext;
  final VoidCallback onSubmit;
  final VoidCallback onComplete;

  const NavigationButtons({
    super.key,
    required this.canGoPrevious,
    required this.hasAnswered,
    required this.hasAnswer,
    required this.submitting,
    required this.isLastQuestion,
    required this.onPrevious,
    required this.onNext,
    required this.onSubmit,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // 上一题按钮
        if (canGoPrevious)
          Expanded(
            child: OutlinedButton.icon(
              onPressed: hasAnswered ? onPrevious : null,
              icon: const Icon(Icons.arrow_back),
              label: const Text('上一题'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        if (canGoPrevious) const SizedBox(width: 12),
        // 下一题/提交/完成按钮
        Expanded(
          flex: canGoPrevious ? 1 : 2,
          child: _buildActionButton(context),
        ),
      ],
    );
  }

  Widget _buildActionButton(BuildContext context) {
    if (submitting) {
      return ElevatedButton(
        onPressed: null,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        child: const SizedBox(
          height: 20,
          width: 20,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      );
    }

    if (!hasAnswered && hasAnswer) {
      // 提交答案按钮
      return ElevatedButton.icon(
        onPressed: onSubmit,
        icon: const Icon(Icons.check),
        label: const Text('提交答案'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      );
    }

    if (isLastQuestion) {
      // 完成练习按钮
      return ElevatedButton.icon(
        onPressed: hasAnswered ? onComplete : null,
        icon: const Icon(Icons.done_all),
        label: const Text('完成练习'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.green,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      );
    }

    // 下一题按钮
    return ElevatedButton.icon(
      onPressed: hasAnswered ? onNext : null,
      icon: const Icon(Icons.arrow_forward),
      label: const Text('下一题'),
      style: ElevatedButton.styleFrom(
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
      ),
    );
  }
}

