import 'package:json_annotation/json_annotation.dart';

part 'knowledge.g.dart';

/// 知识点信息模型
@JsonSerializable()
class Knowledge {
  final int id;
  @JsonKey(name: 'textbook_id')
  final int textbookId;
  @JsonKey(name: 'unit_id')
  final int unitId;
  final String name;
  final String content;
  final String? difficulty; // 难度：简单/普通/困难
  final int? importance; // 重要性：1-10
  final int? order; // 排序值

  const Knowledge({
    required this.id,
    required this.textbookId,
    required this.unitId,
    required this.name,
    required this.content,
    this.difficulty,
    this.importance,
    this.order,
  });

  factory Knowledge.fromJson(Map<String, dynamic> json) =>
      _$KnowledgeFromJson(json);

  Map<String, dynamic> toJson() => _$KnowledgeToJson(this);
}

