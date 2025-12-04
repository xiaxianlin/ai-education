import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/textbook_provider.dart';
import '../../../../features/profile/providers/profile_provider.dart';

/// 教材筛选器组件
class TextbookFilter extends ConsumerWidget {
  const TextbookFilter({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileStateProvider);
    final filterState = ref.watch(textbookFilterStateProvider);
    final filterNotifier = ref.read(textbookFilterProvider);

    // 获取所有科目（去重）
    final subjects = profileState.subjects;

    // 获取所有年级（去重并排序）
    final grades = profileState.textbooks
        .map((book) => book.grade)
        .toSet()
        .toList()
      ..sort();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: Theme.of(context).colorScheme.outlineVariant,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // 科目筛选
          if (subjects.isNotEmpty) ...[
            Expanded(
              child: _buildSubjectFilter(
                context,
                subjects,
                filterState.selectedSubject,
                (subject) => filterNotifier.setSubject(subject),
              ),
            ),
            const SizedBox(width: 8),
          ],
          // 年级筛选
          if (grades.isNotEmpty) ...[
            Expanded(
              child: _buildGradeFilter(
                context,
                grades,
                filterState.selectedGrade,
                (grade) => filterNotifier.setGrade(grade),
              ),
            ),
            const SizedBox(width: 8),
          ],
          // 重置按钮
          if (filterState.selectedSubject != null ||
              filterState.selectedGrade != null)
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: IconButton(
                key: const ValueKey('reset'),
                icon: const Icon(Icons.clear),
                onPressed: () => filterNotifier.reset(),
                tooltip: '重置筛选',
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSubjectFilter(
    BuildContext context,
    List<String> subjects,
    String? selectedSubject,
    ValueChanged<String?> onChanged,
  ) {
    return DropdownButtonFormField<String>(
      initialValue: selectedSubject,
      decoration: InputDecoration(
        labelText: '科目',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: [
        const DropdownMenuItem<String>(
          value: null,
          child: Text('全部科目'),
        ),
        ...subjects.map((subject) => DropdownMenuItem<String>(
              value: subject,
              child: Text(subject),
            ),),
      ],
      onChanged: onChanged,
    );
  }

  Widget _buildGradeFilter(
    BuildContext context,
    List<int> grades,
    int? selectedGrade,
    ValueChanged<int?> onChanged,
  ) {
    return DropdownButtonFormField<int>(
      initialValue: selectedGrade,
      decoration: InputDecoration(
        labelText: '年级',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      items: [
        const DropdownMenuItem<int>(
          value: null,
          child: Text('全部年级'),
        ),
        ...grades.map((grade) => DropdownMenuItem<int>(
              value: grade,
              child: Text('$grade 年级'),
            ),),
      ],
      onChanged: onChanged,
    );
  }
}

