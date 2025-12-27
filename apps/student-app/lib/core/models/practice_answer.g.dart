// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'practice_answer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PracticeAnswer _$PracticeAnswerFromJson(Map<String, dynamic> json) =>
    PracticeAnswer(
      id: (json['id'] as num).toInt(),
      sessionId: (json['session_id'] as num).toInt(),
      questionId: json['question_id'] as String,
      questionOrder: (json['question_order'] as num).toInt(),
      textAnswer: json['text_answer'] as String?,
      status: (json['status'] as num).toInt(),
      timeSpent: (json['time_spent'] as num).toInt(),
      submitTime: (json['submit_time'] as num?)?.toInt(),
      audioAnswer: json['audio_answer'] as String?,
      correctAnswer: json['correct_answer'] as String?,
      analysis: json['analysis'] as String?,
    );

Map<String, dynamic> _$PracticeAnswerToJson(PracticeAnswer instance) =>
    <String, dynamic>{
      'id': instance.id,
      'session_id': instance.sessionId,
      'question_id': instance.questionId,
      'question_order': instance.questionOrder,
      'text_answer': instance.textAnswer,
      'status': instance.status,
      'time_spent': instance.timeSpent,
      'submit_time': instance.submitTime,
      'audio_answer': instance.audioAnswer,
      'correct_answer': instance.correctAnswer,
      'analysis': instance.analysis,
    };
