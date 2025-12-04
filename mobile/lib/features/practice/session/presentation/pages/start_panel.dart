import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/session_provider.dart';
import '../../../../../core/utils/error_handler.dart';
import '../../../../profile/providers/profile_provider.dart';

/// 开始练习面板
class StartPanel extends ConsumerWidget {
  const StartPanel({super.key});

  /// 获取练习类型名称
  String _getPracticeTypeName(String? sessionType) {
    switch (sessionType) {
      case 'daily_practice':
        return '每日练习';
      case 'unit_practice':
        return '单元练习';
      case 'assessment':
        return '能力评测';
      default:
        return '练习';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionState = ref.watch(sessionStateProvider);
    final profileState = ref.watch(profileStateProvider);
    final sessionNotifier = ref.read(sessionProvider);

    final session = sessionState.session;
    if (session == null) {
      return const Center(child: Text('会话不存在'));
    }

    final practiceType = _getPracticeTypeName(session.sessionType);
    final totalQuestions = session.questionCount;
    final estimateMinutes = (totalQuestions * 0.5).ceil().clamp(5, double.infinity).toInt();

    // 判断是否为低年级（≤2年级）
    final grade = profileState.student?.grade ?? 3;
    final isLowerGrade = grade <= 2;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.blue.shade50,
              Colors.white,
              Colors.amber.shade50,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                // 顶部：返回按钮
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back),
                      onPressed: () => context.pop(),
                    ),
                    const Spacer(),
                  ],
                ),
                const SizedBox(height: 16),
                // 根据年级显示不同风格
                Expanded(
                  child: isLowerGrade
                      ? _LowerGradePanel(
                          practiceType: practiceType,
                          totalQuestions: totalQuestions,
                          estimateMinutes: estimateMinutes,
                          onBegin: () async {
                            try {
                              await sessionNotifier.beginPractice();
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('练习已开始！')),
                                );
                              }
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('开始练习失败: ${ErrorHandler.getErrorMessage(e)}'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                        )
                      : _UpperGradePanel(
                          practiceType: practiceType,
                          totalQuestions: totalQuestions,
                          estimateMinutes: estimateMinutes,
                          onBegin: () async {
                            try {
                              await sessionNotifier.beginPractice();
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('练习已开始！')),
                                );
                              }
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('开始练习失败: ${ErrorHandler.getErrorMessage(e)}'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                          onBack: () => context.pop(),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// 低年级面板（≤2年级）
class _LowerGradePanel extends StatelessWidget {
  final String practiceType;
  final int totalQuestions;
  final int estimateMinutes;
  final VoidCallback onBegin;

  const _LowerGradePanel({
    required this.practiceType,
    required this.totalQuestions,
    required this.estimateMinutes,
    required this.onBegin,
  });

  @override
 Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // 卡片
        Card(
          elevation: 8,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: BorderSide(color: Colors.blue.shade200, width: 2),
          ),
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  '🐻',
                  style: TextStyle(fontSize: 64),
                ),
                const SizedBox(height: 16),
                Text(
                  '$practiceType 要开始啦！',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Text(
                  '一共有 $totalQuestions 道小题，大约 $estimateMinutes 分钟就能做完。',
                  style: Theme.of(context).textTheme.bodyLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  '坐好身体，准备好小脑瓜，我们一起慢慢做，不着急～',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    Chip(
                      label: const Text('✅ 做完会有小表扬'),
                      backgroundColor: Colors.green.shade100,
                      labelStyle: TextStyle(color: Colors.green.shade700),
                    ),
                    Chip(
                      label: const Text('🐻 小熊老师陪你'),
                      backgroundColor: Colors.blue.shade100,
                      labelStyle: TextStyle(color: Colors.blue.shade700),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        // 开始按钮
        SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            onPressed: onBegin,
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).primaryColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
            ),
            child: const Text(
              '开始练习 🚀',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }
}

/// 高年级面板（>2年级）
class _UpperGradePanel extends StatelessWidget {
  final String practiceType;
  final int totalQuestions;
  final int estimateMinutes;
  final VoidCallback onBegin;
  final VoidCallback onBack;

  const _UpperGradePanel({
    required this.practiceType,
    required this.totalQuestions,
    required this.estimateMinutes,
    required this.onBegin,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // 卡片
        Card(
          elevation: 8,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: BorderSide(color: Colors.blue.shade200, width: 2),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Row(
              children: [
                // 左侧信息
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade100,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('🎯', style: TextStyle(fontSize: 16)),
                            const SizedBox(width: 4),
                            Text(
                              '巩固练习',
                              style: TextStyle(
                                color: Colors.blue.shade700,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '$practiceType 即将开始',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '本次练习共有 $totalQuestions 题，预计用时 $estimateMinutes 分钟。建议一次做完，如果中途有事也可以下次继续。',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          Chip(
                            label: const Text('✅ 做完可以查看知识点掌握情况'),
                            backgroundColor: Colors.green.shade100,
                            labelStyle: TextStyle(
                              color: Colors.green.shade700,
                              fontSize: 12,
                            ),
                          ),
                          Chip(
                            label: const Text('⭐ 错题会进入错题本'),
                            backgroundColor: Colors.amber.shade100,
                            labelStyle: TextStyle(
                              color: Colors.amber.shade700,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                // 右侧插画
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.blue.shade100,
                        Colors.amber.shade100,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('🧠', style: TextStyle(fontSize: 48)),
                      const SizedBox(height: 8),
                      Text(
                        '动动大脑，检查看看学得怎么样',
                        style: TextStyle(
                          color: Colors.blue.shade800,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        // 按钮组
        Row(
          children: [
            Expanded(
              child: SizedBox(
                height: 56,
                child: ElevatedButton(
                  onPressed: onBegin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                  ),
                  child: const Text(
                    '开始练习 🚀',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              width: 120,
              height: 56,
              child: OutlinedButton(
                onPressed: onBack,
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text('我想再看看'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

