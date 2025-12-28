import 'package:flutter/material.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 填空题输入组件
/// 支持多个填空位置
class FillBlankInput extends StatefulWidget {
  final dynamic question;
  final List<String>? values;
  final int blanksCount;
  final bool disabled;
  final ValueChanged<List<String>> onChanged;

  const FillBlankInput({
    super.key,
    required this.question,
    this.values,
    this.blanksCount = 1,
    this.disabled = false,
    required this.onChanged,
  });

  @override
  State<FillBlankInput> createState() => _FillBlankInputState();
}

class _FillBlankInputState extends State<FillBlankInput> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _initControllers();
  }

  void _initControllers() {
    final initialValues = widget.values ?? List.filled(widget.blanksCount, '');
    _controllers = List.generate(
      widget.blanksCount,
      (i) => TextEditingController(text: i < initialValues.length ? initialValues[i] : ''),
    );
    _focusNodes = List.generate(widget.blanksCount, (_) => FocusNode());
  }

  @override
  void didUpdateWidget(FillBlankInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.blanksCount != widget.blanksCount) {
      _disposeControllers();
      _initControllers();
    } else if (widget.values != null) {
      for (var i = 0; i < widget.blanksCount; i++) {
        if (i < widget.values!.length && _controllers[i].text != widget.values![i]) {
          _controllers[i].text = widget.values![i];
        }
      }
    }
  }

  void _disposeControllers() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var focusNode in _focusNodes) {
      focusNode.dispose();
    }
  }

  @override
  void dispose() {
    _disposeControllers();
    super.dispose();
  }

  void _handleChange(int index, String value) {
    final values = _controllers.map((c) => c.text).toList();
    widget.onChanged(values);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: List.generate(widget.blanksCount, (index) {
        return Padding(
          padding: EdgeInsets.only(bottom: index < widget.blanksCount - 1 ? 16 : 0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // 空位标签
              Container(
                constraints: const BoxConstraints(minWidth: 64),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '第 ${index + 1} 空',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primary.withValues(alpha: 0.8),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // 输入框
              Expanded(
                child: TextField(
                  controller: _controllers[index],
                  focusNode: _focusNodes[index],
                  enabled: !widget.disabled,
                  decoration: InputDecoration(
                    hintText: '请填写答案',
                    hintStyle: TextStyle(
                      color: AppColors.textSecondary.withValues(alpha: 0.5),
                      fontSize: 14,
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: AppColors.border,
                        width: 1.5,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: AppColors.border,
                        width: 1.5,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: AppColors.primary,
                        width: 2,
                      ),
                    ),
                    disabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: AppColors.border.withValues(alpha: 0.5),
                        width: 1.5,
                      ),
                    ),
                    filled: true,
                    fillColor: widget.disabled
                        ? AppColors.muted.withValues(alpha: 0.5)
                        : Colors.white,
                  ),
                  style: TextStyle(
                    fontSize: 15,
                    color: widget.disabled
                        ? AppColors.textSecondary
                        : AppColors.textPrimary,
                  ),
                  onChanged: (value) => _handleChange(index, value),
                  textInputAction: index < widget.blanksCount - 1
                      ? TextInputAction.next
                      : TextInputAction.done,
                  onSubmitted: (_) {
                    if (index < widget.blanksCount - 1) {
                      _focusNodes[index + 1].requestFocus();
                    }
                  },
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
