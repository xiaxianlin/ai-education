// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProfileResponse _$ProfileResponseFromJson(Map<String, dynamic> json) =>
    ProfileResponse(
      student: Student.fromJson(json['student'] as Map<String, dynamic>),
      textbooks: (json['textbooks'] as List<dynamic>)
          .map((e) => Textbook.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$ProfileResponseToJson(ProfileResponse instance) =>
    <String, dynamic>{
      'student': instance.student,
      'textbooks': instance.textbooks,
    };
