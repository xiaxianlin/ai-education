import 'package:flutter/material.dart';
import 'package:student_app/core/models/question.dart';

/// 文本输入组件（填空题）
class TextInputWidget extends StatelessWidget {
  final Question question;
  final String? value;
  final bool disabled;
  final ValueChanged<String> onChanged;

  const TextInputWidget({
    super.key,
    required this.question,
    this.value,
    this.disabled = false,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      enabled: !disabled,
      maxLines: null,
      minLines: 3,
      decoration: InputDecoration(
        labelText: '请输入答案',
        hintText: '在此输入您的答案',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: disabled ? Colors.grey.shade100 : Colors.white,
      ),
      controller: TextEditingController(text: value ?? '')
        ..selection = TextSelection.collapsed(
          offset: value?.length ?? 0,
        ),
      onChanged: onChanged,
    );
  }
}

