// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'knowledge.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Knowledge _$KnowledgeFromJson(Map<String, dynamic> json) => Knowledge(
  id: (json['id'] as num).toInt(),
  textbookId: (json['textbook_id'] as num).toInt(),
  unitId: (json['unit_id'] as num).toInt(),
  name: json['name'] as String,
  content: json['content'] as String,
  difficulty: json['difficulty'] as String?,
  importance: (json['importance'] as num?)?.toInt(),
  order: (json['order'] as num?)?.toInt(),
);

Map<String, dynamic> _$KnowledgeToJson(Knowledge instance) => <String, dynamic>{
  'id': instance.id,
  'textbook_id': instance.textbookId,
  'unit_id': instance.unitId,
  'name': instance.name,
  'content': instance.content,
  'difficulty': instance.difficulty,
  'importance': instance.importance,
  'order': instance.order,
};
