import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/history_provider.dart';
import '../../../../../../core/constants/practice_constants.dart';
import '../../../../../../core/api/endpoints/practice_endpoints.dart';
import '../../../../../../core/models/practice_session.dart';
import '../../../../../shared/widgets/paginated_list.dart';
import '../../../../../shared/widgets/empty_state.dart';
import '../widgets/history_card.dart';

/// 练习历史页面
class PracticeHistoryPage extends ConsumerStatefulWidget {
  const PracticeHistoryPage({super.key});

  @override
  ConsumerState<PracticeHistoryPage> createState() => _PracticeHistoryPageState();
}

class _PracticeHistoryPageState extends ConsumerState<PracticeHistoryPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('练习记录'),
        bottom: TabBar(
          controller: _tabController,
          onTap: (index) {
            final types = [
              PracticeConstants.typeDailyPractice,
              PracticeConstants.typeUnitPractice,
              PracticeConstants.typeAssessment,
            ];
            ref.read(selectedHistoryTypeProvider).setType(types[index]);
          },
          tabs: const [
            Tab(text: '每日练习'),
            Tab(text: '单元练习'),
            Tab(text: '能力评测'),
          ],
        ),
      ),
      body: Column(
        children: [
          // 顶部介绍卡片
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.blue.shade200),
            ),
            child: Column(
              children: [
                const Text(
                  '📚',
                  style: TextStyle(fontSize: 40),
                ),
                const SizedBox(height: 8),
                const Text(
                  '练习记录',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '查看你的所有练习历史记录，回顾学习历程',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          // 历史记录列表
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildHistoryList(PracticeConstants.typeDailyPractice),
                _buildHistoryList(PracticeConstants.typeUnitPractice),
                _buildHistoryList(PracticeConstants.typeAssessment),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryList(String type) {
    return PaginatedList<PracticeSession>(
      loadData: (page, pageSize) async {
        // 注意：API 只支持 limit，不支持 offset
        // 所以我们需要获取所有数据，然后在客户端分页
        // 或者使用累积 limit 的方式
        final limit = (page + 1) * pageSize;
        final allData = await PracticeEndpoints.getHistory(
          type: type,
          limit: limit,
        );
        // 返回当前页的数据
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
        return HistoryCard(session: session);
      },
      pageSize: 20,
      emptyWidget: const EmptyState(
        icon: Icons.history,
        message: '暂无练习记录',
      ),
      errorWidget: (error, onRetry) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              '❌',
              style: TextStyle(fontSize: 48),
            ),
            const SizedBox(height: 16),
            Text(
              '加载失败',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                error,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onRetry,
              child: const Text('重试'),
            ),
          ],
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
    );
  }
}

