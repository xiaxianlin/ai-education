// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'question.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Question _$QuestionFromJson(Map<String, dynamic> json) => Question(
  id: (json['id'] as num).toInt(),
  type: json['type'] as String,
  subtype: json['subtype'] as String?,
  subject: json['subject'] as String,
  grade: (json['grade'] as num).toInt(),
  content: json['content'] as String,
  options: json['options'] as String?,
  answer: json['answer'] as String?,
  resource: json['resource'] as String?,
  difficulty: json['difficulty'] as String?,
  resourceType: json['resource_type'] as String?,
  resourceContent: json['resource_content'] as String?,
  textbookId: (json['textbook_id'] as num).toInt(),
  unitId: (json['unit_id'] as num?)?.toInt(),
  knowledge: json['knowledge'] as String?,
);

Map<String, dynamic> _$QuestionToJson(Question instance) => <String, dynamic>{
  'id': instance.id,
  'type': instance.type,
  'subtype': instance.subtype,
  'subject': instance.subject,
  'grade': instance.grade,
  'content': instance.content,
  'options': instance.options,
  'answer': instance.answer,
  'resource': instance.resource,
  'difficulty': instance.difficulty,
  'resource_type': instance.resourceType,
  'resource_content': instance.resourceContent,
  'textbook_id': instance.textbookId,
  'unit_id': instance.unitId,
  'knowledge': instance.knowledge,
};
