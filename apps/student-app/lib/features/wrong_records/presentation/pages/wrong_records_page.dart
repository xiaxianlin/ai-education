import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/wrong_records_provider.dart';
import '../../../../core/api/endpoints/wrong_records_endpoints.dart';
import '../../../../core/models/wrong_question_summary.dart';
import '../../../../shared/widgets/paginated_list.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../widgets/wrong_question_card.dart';

/// 错题本页面
class WrongRecordsPage extends ConsumerStatefulWidget {
  const WrongRecordsPage({super.key});

  @override
  ConsumerState<WrongRecordsPage> createState() => _WrongRecordsPageState();
}

class _WrongRecordsPageState extends ConsumerState<WrongRecordsPage>
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
        title: const Text('错题本'),
        bottom: TabBar(
          controller: _tabController,
          onTap: (index) {
            final filters = [null, 0, 1]; // 全部、未掌握、已掌握
            ref.read(selectedFilterProvider).setFilter(filters[index]);
          },
          tabs: const [
            Tab(text: '全部'),
            Tab(text: '未掌握'),
            Tab(text: '已掌握'),
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
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.red.shade200),
            ),
            child: Column(
              children: [
                const Text(
                  '📚',
                  style: TextStyle(fontSize: 40),
                ),
                const SizedBox(height: 8),
                const Text(
                  '错题本',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '查看你的所有错题，巩固薄弱知识点',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          // 错题列表
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildWrongRecordsList(null),
                _buildWrongRecordsList(0),
                _buildWrongRecordsList(1),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWrongRecordsList(int? filter) {
    String emptyMessage;
    String emptySubMessage;
    IconData emptyIcon;

    if (filter == null) {
      emptyMessage = '暂无错题';
      emptySubMessage = '继续努力，保持全对！';
      emptyIcon = Icons.check_circle_outline;
    } else if (filter == 0) {
      emptyMessage = '暂无未掌握的错题';
      emptySubMessage = '所有错题都已掌握，太棒了！';
      emptyIcon = Icons.star_outline;
    } else {
      emptyMessage = '暂无已掌握的错题';
      emptySubMessage = '还没有标记为已掌握的错题';
      emptyIcon = Icons.book_outlined;
    }

    return PaginatedList<WrongQuestionSummary>(
      loadData: (page, pageSize) async {
        // 注意：API 只支持 limit，不支持 offset
        // 所以我们需要获取所有数据，然后在客户端分页
        final limit = (page + 1) * pageSize;
        final allData = await WrongRecordsEndpoints.getWrongRecords(
          mastered: filter,
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
      itemBuilder: (context, wrongQuestion, index) {
        return WrongQuestionCard(
          wrongQuestion: wrongQuestion,
        );
      },
      pageSize: 20,
      emptyWidget: EmptyState(
        icon: emptyIcon,
        message: emptyMessage,
        subMessage: emptySubMessage,
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

