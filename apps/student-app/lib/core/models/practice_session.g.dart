// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'practice_session.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PracticeSession _$PracticeSessionFromJson(Map<String, dynamic> json) =>
    PracticeSession(
      id: (json['id'] as num).toInt(),
      studentId: json['student_id'] as String,
      sessionType: json['session_type'] as String,
      targetId: (json['target_id'] as num?)?.toInt(),
      textbookId: (json['textbook_id'] as num?)?.toInt(),
      questionCount: (json['question_count'] as num).toInt(),
      answerCount: (json['answer_count'] as num).toInt(),
      correctCount: (json['correct_count'] as num).toInt(),
      status: (json['status'] as num).toInt(),
      generateStatus: (json['generate_status'] as num).toInt(),
      startTime: (json['start_time'] as num).toInt(),
      endTime: (json['end_time'] as num?)?.toInt(),
      createTime: (json['create_time'] as num).toInt(),
      updateTime: (json['update_time'] as num?)?.toInt(),
      textbook: json['textbook'] == null
          ? null
          : Textbook.fromJson(json['textbook'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$PracticeSessionToJson(PracticeSession instance) =>
    <String, dynamic>{
      'id': instance.id,
      'student_id': instance.studentId,
      'session_type': instance.sessionType,
      'target_id': instance.targetId,
      'textbook_id': instance.textbookId,
      'question_count': instance.questionCount,
      'answer_count': instance.answerCount,
      'correct_count': instance.correctCount,
      'status': instance.status,
      'generate_status': instance.generateStatus,
      'start_time': instance.startTime,
      'end_time': instance.endTime,
      'create_time': instance.createTime,
      'update_time': instance.updateTime,
      'textbook': instance.textbook,
    };
