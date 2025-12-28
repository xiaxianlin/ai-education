import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:student_app/screens/practice/history/providers/history_provider.dart';
import 'package:student_app/core/constants/practice_constants.dart';
import 'package:student_app/core/api/endpoints/practice_endpoints.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/shared/widgets/paginated_list.dart';
import 'package:student_app/shared/widgets/empty_state.dart';
import 'package:student_app/screens/practice/history/presentation/widgets/history_card.dart';
import 'package:student_app/core/theme/app_colors.dart';

/// 练习历史页面
/// UI 对齐 student-web 设计
class PracticeHistoryPage extends ConsumerStatefulWidget {
  const PracticeHistoryPage({super.key});

  @override
  ConsumerState<PracticeHistoryPage> createState() => _PracticeHistoryPageState();
}

class _PracticeHistoryPageState extends ConsumerState<PracticeHistoryPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _tabs = [
    {'type': PracticeConstants.typeDailyPractice, 'name': '日常练习', 'icon': '📅'},
    {'type': PracticeConstants.typeUnitPractice, 'name': '单元练习', 'icon': '📚'},
    {'type': PracticeConstants.typeAssessment, 'name': '综合评估', 'icon': '🎯'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('练习记录'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          // 顶部介绍卡片
          Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white, width: 4),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                const Text(
                  '📊',
                  style: TextStyle(fontSize: 48),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '我的练习记录',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '查看你的成长历程，每一次练习都是进步！🚀',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          fontStyle: FontStyle.italic,
                          color: AppColors.textSecondary.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Tab 切换
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.1),
                width: 2,
              ),
            ),
            child: TabBar(
              controller: _tabController,
              onTap: (index) {
                ref.read(selectedHistoryTypeProvider).setType(_tabs[index]['type'] as String);
              },
              indicator: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              labelColor: Colors.white,
              unselectedLabelColor: AppColors.textSecondary,
              labelStyle: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
              tabs: _tabs.map((tab) => Tab(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(tab['icon'] as String, style: const TextStyle(fontSize: 16)),
                    const SizedBox(width: 6),
                    Text(tab['name'] as String),
                  ],
                ),
              )).toList(),
            ),
          ),

          const SizedBox(height: 16),

          // 历史记录列表
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: _tabs.map((tab) => _buildHistoryList(
                tab['type'] as String,
                tab['name'] as String,
                tab['icon'] as String,
              )).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryList(String type, String name, String icon) {
    return PaginatedList<PracticeSession>(
      loadData: (page, pageSize) async {
        final allData = await PracticeEndpoints.getHistory(
          type: type,
        );
        final startIndex = page * pageSize;
        if (startIndex >= allData.length) {
          return [];
        }
        return allData.sublist(
          startIndex,
          startIndex + pageSize > allData.length
              ? allData.length
              : startIndex + pageSize,
        );
      },
      itemBuilder: (context, session, index) {
        return HistoryCard(
          session: session,
          practiceName: name,
          practiceIcon: icon,
        );
      },
      pageSize: 20,
      emptyWidget: EmptyState(
        icon: Icons.history,
        message: '暂无$name记录',
        subMessage: '快去练习吧，这里会记录你的每一次努力！',
      ),
      errorWidget: (error, onRetry) => Center(
        child: Container(
          margin: const EdgeInsets.all(32),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: Colors.red.shade100,
              width: 2,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                '❌',
                style: TextStyle(fontSize: 48),
              ),
              const SizedBox(height: 16),
              const Text(
                '加载失败',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                error,
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: onRetry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('重试'),
              ),
            ],
          ),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
    );
  }
}
