// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'unit.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Unit _$UnitFromJson(Map<String, dynamic> json) => Unit(
      id: (json['id'] as num).toInt(),
      textbookId: (json['textbook_id'] as num).toInt(),
      name: json['name'] as String,
      content: json['content'] as String,
    );

Map<String, dynamic> _$UnitToJson(Unit instance) => <String, dynamic>{
      'id': instance.id,
      'textbook_id': instance.textbookId,
      'name': instance.name,
      'content': instance.content,
    };
