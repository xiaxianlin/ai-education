import 'package:json_annotation/json_annotation.dart';

part 'unit.g.dart';

/// 单元信息模型
@JsonSerializable()
class Unit {
  final int id;
  @JsonKey(name: 'textbook_id')
  final int textbookId;
  final String name;
  final String content;

  const Unit({
    required this.id,
    required this.textbookId,
    required this.name,
    required this.content,
  });

  factory Unit.fromJson(Map<String, dynamic> json) => _$UnitFromJson(json);

  Map<String, dynamic> toJson() => _$UnitToJson(this);
}

