// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wrong_question_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WrongQuestionSummary _$WrongQuestionSummaryFromJson(
        Map<String, dynamic> json) =>
    WrongQuestionSummary(
      id: (json['id'] as num).toInt(),
      questionId: (json['question_id'] as num).toInt(),
      studentId: json['student_id'] as String?,
      wrongCount: (json['wrong_count'] as num).toInt(),
      lastWrongTime: (json['last_wrong_time'] as num).toInt(),
      isMastered: (json['is_mastered'] as num).toInt(),
      masteredTime: (json['mastered_time'] as num).toInt(),
      questionContent: json['question_content'] as String?,
      knowledge: json['knowledge'] as String?,
      createTime: (json['create_time'] as num?)?.toInt(),
      updateTime: (json['update_time'] as num?)?.toInt(),
    );

Map<String, dynamic> _$WrongQuestionSummaryToJson(
        WrongQuestionSummary instance) =>
    <String, dynamic>{
      'id': instance.id,
      'question_id': instance.questionId,
      'student_id': instance.studentId,
      'wrong_count': instance.wrongCount,
      'last_wrong_time': instance.lastWrongTime,
      'is_mastered': instance.isMastered,
      'mastered_time': instance.masteredTime,
      'question_content': instance.questionContent,
      'knowledge': instance.knowledge,
      'create_time': instance.createTime,
      'update_time': instance.updateTime,
    };
