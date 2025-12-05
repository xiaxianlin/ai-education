// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'practice_wrong_record.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PracticeWrongRecord _$PracticeWrongRecordFromJson(Map<String, dynamic> json) =>
    PracticeWrongRecord(
      id: (json['id'] as num).toInt(),
      studentId: json['student_id'] as String,
      questionId: (json['question_id'] as num).toInt(),
      sessionId: (json['session_id'] as num).toInt(),
      unitId: (json['unit_id'] as num?)?.toInt(),
      knowledge: json['knowledge'] as String?,
      textbookId: (json['textbook_id'] as num?)?.toInt(),
      userAnswer: json['user_answer'] as String?,
      correctAnswer: json['correct_answer'] as String?,
      analysis: json['analysis'] as String?,
      timeSpent: (json['time_spent'] as num?)?.toInt(),
      isCorrected: (json['is_corrected'] as num).toInt(),
      correctedTime: (json['corrected_time'] as num).toInt(),
      createTime: (json['create_time'] as num).toInt(),
      updateTime: (json['update_time'] as num).toInt(),
    );

Map<String, dynamic> _$PracticeWrongRecordToJson(
  PracticeWrongRecord instance,
) => <String, dynamic>{
  'id': instance.id,
  'student_id': instance.studentId,
  'question_id': instance.questionId,
  'session_id': instance.sessionId,
  'unit_id': instance.unitId,
  'knowledge': instance.knowledge,
  'textbook_id': instance.textbookId,
  'user_answer': instance.userAnswer,
  'correct_answer': instance.correctAnswer,
  'analysis': instance.analysis,
  'time_spent': instance.timeSpent,
  'is_corrected': instance.isCorrected,
  'corrected_time': instance.correctedTime,
  'create_time': instance.createTime,
  'update_time': instance.updateTime,
};
