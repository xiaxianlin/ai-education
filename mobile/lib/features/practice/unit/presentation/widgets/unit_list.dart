import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/models/textbook.dart';
import '../../../../../core/models/unit.dart';
import '../../../../../core/models/practice_session.dart';
import '../../providers/unit_practice_provider.dart';
import 'unit_practice_card.dart';

/// 显示某个教材下的所有单元
class UnitList extends ConsumerStatefulWidget {
  final Textbook textbook;

  const UnitList({
    super.key,
    required this.textbook,
  });

  @override
  ConsumerState<UnitList> createState() => _UnitListState();
}

class _UnitListState extends ConsumerState<UnitList> {
  @override
  void initState() {
    super.initState();
    // 加载单元列表
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(unitPracticeProvider).fetchUnits(widget.textbook.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    final unitPracticeState = ref.watch(unitPracticeStateProvider);
    final units = unitPracticeState.unitsCache[widget.textbook.id] ?? [];
    final isLoading = unitPracticeState.unitsLoading[widget.textbook.id] ?? false;
    final practices = unitPracticeState.practices;

    if (isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (units.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Text(
            '该教材暂无单元',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                ),
          ),
        ),
      );
    }

    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.75,
      ),
      itemCount: units.length,
      itemBuilder: (context, index) {
        final unit = units[index];
        // 查找该单元的练习会话
        final practice = practices.firstWhere(
          (p) => p.targetId == unit.id && p.textbookId == widget.textbook.id,
          orElse: () => _createEmptyPractice(widget.textbook.id, unit.id),
        );

        return UnitPracticeCard(
          unit: unit,
          textbook: widget.textbook,
          practice: practice.id == 0 ? null : practice,
        );
      },
    );
  }

  /// 创建空的练习对象（用于占位）
  PracticeSession _createEmptyPractice(int textbookId, int unitId) {
    return PracticeSession(
      id: 0,
      studentId: '',
      sessionType: 'unit_practice',
      targetId: unitId,
      textbookId: textbookId,
      questionCount: 0,
      answerCount: 0,
      correctCount: 0,
      status: 0,
      generateStatus: 0,
      startTime: 0,
      createTime: 0,
    );
  }
}

