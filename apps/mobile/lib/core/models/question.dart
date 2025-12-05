import 'package:json_annotation/json_annotation.dart';

part 'question.g.dart';

/// 题目信息模型
@JsonSerializable()
class Question {
  final int id;
  final String type; // 题目类型（主类型）
  final String? subtype; // 题目子类型
  final String subject; // 科目
  final int grade; // 年级
  final String content; // 题目内容
  final String? options; // 选项（多行文本）
  final String? answer; // 答案
  final String? resource; // 资源路径（图片/音频URL）
  final String? difficulty; // 难度
  @JsonKey(name: 'resource_type')
  final String? resourceType; // 资源类型: "image" | "audio" | null
  @JsonKey(name: 'resource_content')
  final String? resourceContent; // 资源内容（录音文本等）
  @JsonKey(name: 'textbook_id')
  final int textbookId;
  @JsonKey(name: 'unit_id')
  final int? unitId; // 单元ID
  final String? knowledge; // 知识点
  // 前端扩展字段
  @JsonKey(includeFromJson: false, includeToJson: false)
  final bool? isCorrect; // 是否答对（答题后）
  @JsonKey(includeFromJson: false, includeToJson: false)
  final int? order; // 题目顺序（练习会话中）

  const Question({
    required this.id,
    required this.type,
    this.subtype,
    required this.subject,
    required this.grade,
    required this.content,
    this.options,
    this.answer,
    this.resource,
    this.difficulty,
    this.resourceType,
    this.resourceContent,
    required this.textbookId,
    this.unitId,
    this.knowledge,
    this.isCorrect,
    this.order,
  });

  factory Question.fromJson(Map<String, dynamic> json) =>
      _$QuestionFromJson(json);

  Map<String, dynamic> toJson() => _$QuestionToJson(this);
}

