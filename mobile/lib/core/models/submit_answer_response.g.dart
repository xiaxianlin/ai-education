// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'submit_answer_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SubmitAnswerResponse _$SubmitAnswerResponseFromJson(
        Map<String, dynamic> json) =>
    SubmitAnswerResponse(
      isCorrect: json['is_correct'] as bool,
      correctAnswer: json['correct_answer'] as String,
      userAnswer: json['user_answer'] as String?,
      analysis: json['analysis'] as String?,
      sessionProgress: SessionProgress.fromJson(
          json['session_progress'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$SubmitAnswerResponseToJson(
        SubmitAnswerResponse instance) =>
    <String, dynamic>{
      'is_correct': instance.isCorrect,
      'correct_answer': instance.correctAnswer,
      'user_answer': instance.userAnswer,
      'analysis': instance.analysis,
      'session_progress': instance.sessionProgress,
    };

SessionProgress _$SessionProgressFromJson(Map<String, dynamic> json) =>
    SessionProgress(
      answerCount: (json['answer_count'] as num).toInt(),
      correctCount: (json['correct_count'] as num).toInt(),
      totalCount: (json['total_count'] as num).toInt(),
      status: (json['status'] as num).toInt(),
    );

Map<String, dynamic> _$SessionProgressToJson(SessionProgress instance) =>
    <String, dynamic>{
      'answer_count': instance.answerCount,
      'correct_count': instance.correctCount,
      'total_count': instance.totalCount,
      'status': instance.status,
    };
