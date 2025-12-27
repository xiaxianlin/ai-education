import 'package:flutter/material.dart';
import 'package:student_app/core/models/question_v2.dart';
import 'package:student_app/core/theme/app_colors.dart';

class SortOrderWidget extends StatefulWidget {
  final QuestionV2 question;
  final dynamic value; // Format: List<String> optionIds in order
  final bool disabled;
  final ValueChanged<List<String>> onChanged;

  const SortOrderWidget({
    super.key,
    required this.question,
    this.value,
    this.disabled = false,
    required this.onChanged,
  });

  @override
  State<SortOrderWidget> createState() => _SortOrderWidgetState();
}

class _SortOrderWidgetState extends State<SortOrderWidget> {
  late List<String> _internalOrder;

  @override
  void initState() {
    super.initState();
    _internalOrder = widget.value != null ? List<String>.from(widget.value) : [];
  }

  @override
  void didUpdateWidget(SortOrderWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      _internalOrder = widget.value != null ? List<String>.from(widget.value) : [];
    }
  }

  @override
  Widget build(BuildContext context) {
    final options = widget.question.options ?? [];
    final availableOptions = options.where((o) => !_internalOrder.contains(o.id)).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Result Area (Sequence)
        const Text(
          '当前序列：',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.muted.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border, style: BorderStyle.solid),
          ),
          child: _internalOrder.isEmpty
              ? const Center(
                  child: Text(
                    '点击下方选项进行排序',
                    style: TextStyle(color: AppColors.textSecondary, fontStyle: FontStyle.italic),
                  ),
                )
              : ReorderableListView(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  onReorder: widget.disabled ? (_, __) => {} : (oldIndex, newIndex) {
                    setState(() {
                      if (newIndex > oldIndex) newIndex -= 1;
                      final item = _internalOrder.removeAt(oldIndex);
                      _internalOrder.insert(newIndex, item);
                    });
                    widget.onChanged(_internalOrder);
                  },
                  children: _internalOrder.map((id) {
                    final option = options.firstWhere((o) => o.id == id, orElse: () => const QuestionOptionV2(id: ''));
                    final index = _internalOrder.indexOf(id);

                    return Container(
                      key: ValueKey(id),
                      margin: const EdgeInsets.only(bottom: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: ListTile(
                        leading: CircleAvatar(
                          radius: 12,
                          backgroundColor: AppColors.primary,
                          child: Text(
                            '${index + 1}',
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                        title: Text(option.text ?? id),
                        trailing: widget.disabled ? null : Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline, color: AppColors.error),
                              onPressed: () {
                                setState(() {
                                  _internalOrder.remove(id);
                                });
                                widget.onChanged(_internalOrder);
                              },
                            ),
                            const Icon(Icons.drag_indicator, color: AppColors.textSecondary),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
        ),
        
        const SizedBox(height: 24),
        
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
            return GestureDetector(
              onTap: widget.disabled ? null : () {
                setState(() {
                  _internalOrder.add(option.id);
                });
                widget.onChanged(_internalOrder);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(option.text ?? ''),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
