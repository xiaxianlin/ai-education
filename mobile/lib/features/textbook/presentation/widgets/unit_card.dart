import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models/unit.dart';
import '../../providers/textbook_provider.dart';
import 'knowledge_item.dart';

/// 单元卡片组件
/// 支持展开/收起知识点
class UnitCard extends ConsumerStatefulWidget {
  final Unit unit;

  const UnitCard({
    super.key,
    required this.unit,
  });

  @override
  ConsumerState<UnitCard> createState() => _UnitCardState();
}

class _UnitCardState extends ConsumerState<UnitCard> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    final unitState = ref.watch(unitStateProvider(widget.unit.textbookId));
    final knowledges = unitState.knowledgesMap[widget.unit.id] ?? [];
    final isLoadingKnowledges =
        unitState.loadingKnowledges[widget.unit.id] ?? false;

    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ExpansionTile(
        title: Text(
          widget.unit.name,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        subtitle: widget.unit.content.isNotEmpty
            ? Text(
                widget.unit.content,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              )
            : null,
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 知识点数量提示
            if (knowledges.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${knowledges.length} 个知识点',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                      ),
                ),
              ),
            Icon(
              _isExpanded ? Icons.expand_less : Icons.expand_more,
            ),
          ],
        ),
        onExpansionChanged: (expanded) {
          setState(() {
            _isExpanded = expanded;
          });

          // 如果展开且还没有加载知识点，则加载
          if (expanded && knowledges.isEmpty && !isLoadingKnowledges) {
            ref.read(unitProvider(widget.unit.textbookId))
                .loadKnowledges(widget.unit.id);
          }
        },
        children: [
          // 知识点列表
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: isLoadingKnowledges
                ? const Padding(
                    key: ValueKey('loading'),
                    padding: EdgeInsets.all(16.0),
                    child: Center(
                      child: CircularProgressIndicator(),
                    ),
                  )
                : knowledges.isEmpty
                    ? Padding(
                        key: const ValueKey('empty'),
                        padding: const EdgeInsets.all(16.0),
                        child: Text(
                          '暂无知识点',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Theme.of(context)
                                    .colorScheme
                                    .onSurfaceVariant,
                              ),
                          textAlign: TextAlign.center,
                        ),
                      )
                    : Padding(
                        key: const ValueKey('list'),
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: Column(
                          children: knowledges
                              .map((knowledge) => KnowledgeItem(
                                    key: ValueKey(knowledge.id),
                                    knowledge: knowledge,
                                  ))
                              .toList(),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

