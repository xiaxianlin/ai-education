// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'submit_answer_params.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SubmitAnswerParams _$SubmitAnswerParamsFromJson(Map<String, dynamic> json) =>
    SubmitAnswerParams(
      sessionId: (json['session_id'] as num).toInt(),
      questionId: json['question_id'] as String,
      answer: json['answer'] as String,
      timeSpent: (json['time_spent'] as num).toInt(),
      isAudioAnswer: json['is_audio_answer'] as bool?,
      audioData: json['audio_data'] as String?,
      audioMatch: json['audio_match'] as bool?,
      audioAnalysis: json['audio_analysis'] as String?,
    );

Map<String, dynamic> _$SubmitAnswerParamsToJson(SubmitAnswerParams instance) =>
    <String, dynamic>{
      'session_id': instance.sessionId,
      'question_id': instance.questionId,
      'answer': instance.answer,
      'time_spent': instance.timeSpent,
      'is_audio_answer': instance.isAudioAnswer,
      'audio_data': instance.audioData,
      'audio_match': instance.audioMatch,
      'audio_analysis': instance.audioAnalysis,
    };
