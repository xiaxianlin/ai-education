// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'student.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Student _$StudentFromJson(Map<String, dynamic> json) => Student(
      id: json['id'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String,
      grade: (json['grade'] as num).toInt(),
      status: (json['status'] as num).toInt(),
      createTime: (json['create_time'] as num).toInt(),
      updateTime: (json['update_time'] as num?)?.toInt(),
    );

Map<String, dynamic> _$StudentToJson(Student instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'phone': instance.phone,
      'grade': instance.grade,
      'status': instance.status,
      'create_time': instance.createTime,
      'update_time': instance.updateTime,
    };
