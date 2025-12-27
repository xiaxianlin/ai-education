// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'practice.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Practice _$PracticeFromJson(Map<String, dynamic> json) => Practice(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  slug: json['slug'] as String,
  icon: json['icon'] as String?,
  description: json['description'] as String?,
  type: json['type'] as String,
  practiceType: json['practice_type'] as String?,
  config: json['config'] as Map<String, dynamic>?,
  createTime: (json['create_time'] as num).toInt(),
  updateTime: (json['update_time'] as num).toInt(),
);

Map<String, dynamic> _$PracticeToJson(Practice instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
  'icon': instance.icon,
  'description': instance.description,
  'type': instance.type,
  'practice_type': instance.practiceType,
  'config': instance.config,
  'create_time': instance.createTime,
  'update_time': instance.updateTime,
};
