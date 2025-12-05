import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:student_app/screens/practice/session/providers/session_provider.dart';

/// 结果展示面板
class ResultPanel extends ConsumerWidget {
  const ResultPanel({super.key});

  /// 格式化时间
  String _formatTime(int seconds) {
    if (seconds < 60) return '$seconds秒';
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return secs > 0 ? '$minutes分$secs秒' : '$minutes分钟';
  }

  /// 获取评价
  Map<String, dynamic> _getGrade(int accuracy) {
    if (accuracy >= 90) {
      return {
        'emoji': '🌟',
        'text': '太棒了！',
        'color': Colors.amber,
      };
    } else if (accuracy >= 70) {
      return {
        'emoji': '👍',
        'text': '做得不错！',
        'color': Colors.blue,
      };
    } else if (accuracy >= 50) {
      return {
        'emoji': '💪',
        'text': '继续加油！',
        'color': Colors.orange,
      };
    } else {
      return {
        'emoji': '🙌',
        'text': '再接再厉！',
        'color': Colors.grey,
      };
    }
  }

  /// 获取返回路径
  String _getBackPath(String? sessionType) {
    switch (sessionType) {
      case 'daily_practice':
        return '/home';
      case 'unit_practice':
        return '/practice/unit';
      case 'assessment':
        return '/home';
      default:
        return '/home';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionState = ref.watch(sessionStateProvider);
    final report = sessionState.report;
    final session = sessionState.session;

    if (report == null) {
      return const Center(child: Text('报告不存在'));
    }

    final totalQuestions = report.totalQuestions;
    final correctQuestions = report.correctQuestions;
    final score = report.overallScore;
    final totalTime = report.totalTime;
    final accuracy = totalQuestions > 0
        ? ((correctQuestions / totalQuestions) * 100).round()
        : 0;

    final grade = _getGrade(accuracy);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.blue.shade50,
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Card(
                elevation: 8,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                  side: BorderSide(
                    color: Theme.of(context).primaryColor,
                    width: 2,
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // 标题区
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Theme.of(context).primaryColor,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.emoji_events,
                              color: Colors.white,
                              size: 32,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '练习完成！',
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall
                                      ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${grade['emoji']} ${grade['text']}',
                                  style: TextStyle(
                                    color: grade['color'] as Color,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      // 核心数据 - 正确率
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.shade300),
                        ),
                        child: Column(
                          children: [
                            Text(
                              '$accuracy%',
                              style: Theme.of(context)
                                  .textTheme
                                  .displayMedium
                                  ?.copyWith(
                                    color: Theme.of(context).primaryColor,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '正确率',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Colors.grey.shade600,
                                  ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      // 统计信息
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 2.5,
                        children: [
                          _buildStatCard(
                            context,
                            icon: Icons.check_circle,
                            iconColor: Colors.green,
                            value: correctQuestions.toString(),
                            label: '正确',
                          ),
                          _buildStatCard(
                            context,
                            icon: Icons.cancel,
                            iconColor: Colors.red,
                            value: (totalQuestions - correctQuestions).toString(),
                            label: '错误',
                          ),
                          _buildStatCard(
                            context,
                            icon: Icons.star,
                            iconColor: Colors.amber,
                            value: score.toStringAsFixed(0),
                            label: '得分',
                          ),
                          _buildStatCard(
                            context,
                            icon: Icons.access_time,
                            iconColor: Colors.blue,
                            value: _formatTime(totalTime),
                            label: '用时',
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      // 操作按钮
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => context.go(_getBackPath(session?.sessionType)),
                              icon: const Icon(Icons.home),
                              label: const Text('返回'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 16),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => context.go('/practice/history'),
                              icon: const Icon(Icons.history),
                              label: const Text('历史记录'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Theme.of(context).primaryColor,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required IconData icon,
    required Color iconColor,
    required String value,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        children: [
          Icon(icon, color: iconColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey.shade600,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

