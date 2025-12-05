import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/screens/practice/unit/providers/unit_practice_provider.dart';
import 'package:student_app/screens/profile/providers/profile_provider.dart';
import 'package:student_app/screens/practice/unit/presentation/widgets/textbook_tabs.dart';
import 'package:student_app/screens/practice/unit/presentation/widgets/unit_list.dart';

/// 单元练习页面
class UnitPracticePage extends ConsumerStatefulWidget {
  const UnitPracticePage({super.key});

  @override
  ConsumerState<UnitPracticePage> createState() => _UnitPracticePageState();
}

class _UnitPracticePageState extends ConsumerState<UnitPracticePage> {
  @override
  void initState() {
    super.initState();
    // 确保个人中心数据已加载
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profileState = ref.read(profileStateProvider);
      if (profileState.student == null) {
        ref.read(profileProvider).getProfile();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileStateProvider);
    final activeTextbooks = profileState.activeTextbooks;

    return Scaffold(
      appBar: AppBar(
        title: const Text('单元练习'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.wait<void>([
            ref.read(profileProvider).refresh(),
            ref.read(unitPracticeProvider).fetchUnitPractice(),
          ]);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 顶部 Header
              _buildHeader(context),
              const SizedBox(height: 16),

              // 未选择教材的空状态提示
              if (activeTextbooks.isEmpty) ...[
                _buildEmptyState(context),
              ] else ...[
                // 主体：教材 Tab 切换和单元列表
                SizedBox(
                  height: MediaQuery.of(context).size.height * 0.7,
                  child: TextbookTabs(
                    builder: (textbook) => UnitList(textbook: textbook),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  /// 顶部 Header
  Widget _buildHeader(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(
          color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
          width: 2,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  '📚',
                  style: TextStyle(fontSize: 32),
                ),
                const SizedBox(width: 8),
                Text(
                  '单元练习',
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '选择单元进行专项练习，巩固知识点，提升学习效果。',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                  ),
            ),
          ],
        ),
      ),
    );
  }

  /// 空状态提示
  Widget _buildEmptyState(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(
          color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.3),
          width: 2,
        ),
      ),
      color: Theme.of(context).colorScheme.secondaryContainer.withValues(alpha: 0.3),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
        child: Column(
          children: [
            const Text(
              '📖',
              style: TextStyle(fontSize: 48),
            ),
            const SizedBox(height: 16),
            Text(
              '还没有选教材呢',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              '去设置里选择你的学习教材，系统就能为你生成单元练习啦～',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

