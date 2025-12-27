import 'package:flutter/material.dart';
import 'package:student_app/core/models/question_v2.dart';
import 'package:student_app/core/theme/app_colors.dart';

class DragDropWidget extends StatefulWidget {
  final QuestionV2 question;
  final dynamic value; // Format: Map<String, String> targetId -> optionId
  final bool disabled;
  final ValueChanged<Map<String, String>> onChanged;

  const DragDropWidget({
    super.key,
    required this.question,
    this.value,
    this.disabled = false,
    required this.onChanged,
  });

  @override
  State<DragDropWidget> createState() => _DragDropWidgetState();
}

class _DragDropWidgetState extends State<DragDropWidget> {
  String? _selectedOptionId;
  late Map<String, String> _internalValue;

  @override
  void initState() {
    super.initState();
    _internalValue = widget.value != null ? Map<String, String>.from(widget.value) : {};
  }

  @override
  void didUpdateWidget(DragDropWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      _internalValue = widget.value != null ? Map<String, String>.from(widget.value) : {};
    }
  }

  List<String> get _targets {
    final config = widget.question.stem.interactionConfig;
    if (config != null && config['targets'] != null) {
      return List<String>.from(config['targets'].map((t) => t['id'].toString()));
    }
    return [];
  }

  String _getTargetLabel(String id) {
    final config = widget.question.stem.interactionConfig;
    if (config != null && config['targets'] != null) {
      final target = config['targets'].firstWhere((t) => t['id'].toString() == id, orElse: () => null);
      return target != null ? target['label'].toString() : id;
    }
    return id;
  }

  @override
  Widget build(BuildContext context) {
    final options = widget.question.options ?? [];
    final usedOptionIds = _internalValue.values.toSet();
    final availableOptions = options.where((o) => !usedOptionIds.contains(o.id)).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Target Areas
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: _targets.map((targetId) {
            final assignedOptionId = _internalValue[targetId];
            final assignedOption = options.firstWhere((o) => o.id == assignedOptionId, orElse: () => const QuestionOptionV2(id: ''));

            return GestureDetector(
              onTap: widget.disabled ? null : () => _handleTargetTap(targetId),
              child: Container(
                width: (MediaQuery.of(context).size.width - 64) / 2,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _internalValue.containsKey(targetId) 
                      ? AppColors.primary.withValues(alpha: 0.1) 
                      : AppColors.muted.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: _internalValue.containsKey(targetId) 
                        ? AppColors.primary 
                        : AppColors.border,
                    width: 2,
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      _getTargetLabel(targetId),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 60,
                      alignment: Alignment.center,
                      child: assignedOption.id.isNotEmpty
                          ? Text(
                              assignedOption.text ?? '',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            )
                          : const Icon(Icons.add, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
        
        const SizedBox(height: 24),
        const Divider(),
        const SizedBox(height: 16),
        
        // Option Pool
        const Text(
          '待选项：',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: availableOptions.map((option) {
            final isSelected = _selectedOptionId == option.id;
            return GestureDetector(
              onTap: widget.disabled ? null : () => _handleOptionTap(option.id),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.border,
                  ),
                  boxShadow: isSelected ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    )
                  ] : null,
                ),
                child: Text(
                  option.text ?? '',
                  style: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        
        if (!widget.disabled && _internalValue.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 16),
            child: TextButton.icon(
              onPressed: () {
                setState(() {
                  _internalValue.clear();
                  _selectedOptionId = null;
                });
                widget.onChanged(_internalValue);
              },
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text('重置选择'),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.textSecondary,
              ),
            ),
          ),
      ],
    );
  }

  void _handleOptionTap(String optionId) {
    setState(() {
      if (_selectedOptionId == optionId) {
        _selectedOptionId = null;
      } else {
        _selectedOptionId = optionId;
      }
    });
  }

  void _handleTargetTap(String targetId) {
    setState(() {
      if (_selectedOptionId != null) {
        // Place selected option in target
        _internalValue[targetId] = _selectedOptionId!;
        _selectedOptionId = null;
        widget.onChanged(_internalValue);
      } else if (_internalValue.containsKey(targetId)) {
        // Remove option from target
        _internalValue.remove(targetId);
        widget.onChanged(_internalValue);
      }
    });
  }
}
