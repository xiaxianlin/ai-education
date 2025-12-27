import 'package:flutter/material.dart';
import 'package:student_app/core/models/question_v2.dart';

/// 选择题输入组件
class ChoiceInputWidget extends StatelessWidget {
  final QuestionV2 question;
  final String? value;
  final bool disabled;
  final bool hasAnswered;
  final bool? isCorrect;
  final ValueChanged<String> onChanged;

  const ChoiceInputWidget({
    super.key,
    required this.question,
    this.value,
    this.disabled = false,
    this.hasAnswered = false,
    this.isCorrect,
    required this.onChanged,
  });

  /// 解析选项
  List<Map<String, String>> _parseOptions() {
    if (question.options == null) return [];
    return question.options!.asMap().entries.map((entry) {
      final index = entry.key;
      final option = entry.value;
      final label = String.fromCharCode(65 + index);
      return {
        'label': label,
        'text': option.text ?? '',
        'id': option.id,
      };
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final options = _parseOptions();
    if (options.isEmpty) {
      return const Text('暂无选项');
    }

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: options.map((option) {
        final optionLabel = option['label']!;
        final optionText = option['text']!;
        // For V1, value is label. For V2, value is currently also label (letter) or could be ID.
        // Let's stick to label for consistent UI mapping if possible, or use ID.
        // The backend expects ID for V2 single_choice.
        final identifyValue = (question is QuestionV2) ? option['id']! : optionLabel;
        final isSelected = value == identifyValue;

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
          onTap: disabled || hasAnswered ? null : () => onChanged(identifyValue),
          child: Container(
            width: (MediaQuery.of(context).size.width - 48) / 2,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: backgroundColor,
              border: Border.all(
                color: borderColor,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isSelected
                        ? (hasAnswered
                            ? (isCorrect == true ? Colors.green : Colors.red)
                            : Theme.of(context).primaryColor)
                        : Colors.transparent,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected
                          ? (hasAnswered
                              ? (isCorrect == true ? Colors.green : Colors.red)
                              : Theme.of(context).primaryColor)
                          : Colors.grey.shade400,
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      optionLabel,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.grey.shade700,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    optionText,
                    style: TextStyle(
                      color: textColor,
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w500 : FontWeight.normal,
                    ),
                  ),
                ),
                if (isSelected && hasAnswered)
                  Icon(
                    isCorrect == true ? Icons.check_circle : Icons.cancel,
                    color: isCorrect == true ? Colors.green : Colors.red,
                  ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

