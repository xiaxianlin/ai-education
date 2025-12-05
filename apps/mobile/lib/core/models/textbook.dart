import 'package:json_annotation/json_annotation.dart';

part 'textbook.g.dart';

/// 教材信息模型
@JsonSerializable()
class Textbook {
  final int id;
  final String subject; // 科目：数学/英语
  final String version; // 版本：人教版等
  final int grade; // 年级：1-12
  final String semester; // 学期：上学期/下学期/整学期
  final String? file; // PDF文件路径
  @JsonKey(name: 'index_file_id')
  final String? indexFileId; // 索引文件ID
  @JsonKey(name: 'is_parsed')
  final int? isParsed; // 是否已解析：0-未解析, 1-已解析
  final int? active; // 是否激活（学生端）：1-激活, 0-未激活

  const Textbook({
    required this.id,
    required this.subject,
    required this.version,
    required this.grade,
    required this.semester,
    this.file,
    this.indexFileId,
    this.isParsed,
    this.active,
  });

  factory Textbook.fromJson(Map<String, dynamic> json) =>
      _$TextbookFromJson(json);

  Map<String, dynamic> toJson() => _$TextbookToJson(this);
}

