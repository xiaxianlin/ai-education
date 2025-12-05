import 'package:flutter/material.dart';
import 'package:student_app/core/models/question.dart';

/// 判断题输入组件
class JudgeInputWidget extends StatelessWidget {
  final Question question;
  final String? value;
  final bool disabled;
  final bool hasAnswered;
  final bool? isCorrect;
  final ValueChanged<String> onChanged;

  const JudgeInputWidget({
    super.key,
    required this.question,
    this.value,
    this.disabled = false,
    this.hasAnswered = false,
    this.isCorrect,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isTrue = value == '对' || value == '正确' || value == 'true' || value == '1';
    final isFalse = value == '错' || value == '错误' || value == 'false' || value == '0';

    return Row(
      children: [
        Expanded(
          child: _buildButton(
            context,
            label: '对',
            icon: Icons.check_circle,
            isSelected: isTrue,
            onTap: () => onChanged('对'),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildButton(
            context,
            label: '错',
            icon: Icons.cancel,
            isSelected: isFalse,
            onTap: () => onChanged('错'),
          ),
        ),
      ],
    );
  }

  Widget _buildButton(
    BuildContext context, {
    required String label,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    Color? borderColor;
    Color? backgroundColor;
    Color? textColor;

    if (hasAnswered) {
      if (isSelected) {
        borderColor = isCorrect == true ? Colors.green : Colors.red;
        backgroundColor = isCorrect == true
            ? Colors.green.shade50
            : Colors.red.shade50;
        textColor = isCorrect == true ? Colors.green.shade700 : Colors.red.shade700;
      } else {
        borderColor = Colors.grey.shade300;
        backgroundColor = Colors.grey.shade100;
        textColor = Colors.grey.shade600;
      }
    } else {
      if (isSelected) {
        borderColor = Theme.of(context).primaryColor;
        backgroundColor = Theme.of(context).primaryColor.withValues(alpha: 0.1);
        textColor = Theme.of(context).primaryColor;
      } else {
        borderColor = Colors.grey.shade300;
        backgroundColor = Colors.white;
        textColor = Colors.black87;
      }
    }

    return GestureDetector(
      onTap: disabled || hasAnswered ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        decoration: BoxDecoration(
          color: backgroundColor,
          border: Border.all(
            color: borderColor,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 48,
              color: textColor,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: textColor,
                fontSize: 18,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            if (isSelected && hasAnswered)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Icon(
                  isCorrect == true ? Icons.check_circle : Icons.cancel,
                  color: isCorrect == true ? Colors.green : Colors.red,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

