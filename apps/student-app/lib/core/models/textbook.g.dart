// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'textbook.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Textbook _$TextbookFromJson(Map<String, dynamic> json) => Textbook(
  id: (json['id'] as num).toInt(),
  subject: json['subject'] as String,
  version: json['version'] as String,
  grade: (json['grade'] as num).toInt(),
  semester: json['semester'] as String,
  file: json['file'] as String?,
  indexFileId: json['index_file_id'] as String?,
  isParsed: (json['is_parsed'] as num?)?.toInt(),
  active: (json['active'] as num?)?.toInt(),
);

Map<String, dynamic> _$TextbookToJson(Textbook instance) => <String, dynamic>{
  'id': instance.id,
  'subject': instance.subject,
  'version': instance.version,
  'grade': instance.grade,
  'semester': instance.semester,
  'file': instance.file,
  'index_file_id': instance.indexFileId,
  'is_parsed': instance.isParsed,
  'active': instance.active,
};
