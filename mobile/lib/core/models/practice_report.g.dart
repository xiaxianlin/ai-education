// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'practice_report.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PracticeReport _$PracticeReportFromJson(Map<String, dynamic> json) =>
    PracticeReport(
      id: (json['id'] as num).toInt(),
      sessionId: (json['session_id'] as num).toInt(),
      studentId: json['student_id'] as String,
      totalQuestions: (json['total_questions'] as num).toInt(),
      correctQuestions: (json['correct_questions'] as num).toInt(),
      totalTime: (json['total_time'] as num).toInt(),
      overallScore: (json['overall_score'] as num).toDouble(),
      currentAbility: (json['current_ability'] as num?)?.toDouble(),
      confidence: (json['confidence'] as num?)?.toDouble(),
      abilityLevel: json['ability_level'] as String?,
      percentile: (json['percentile'] as num?)?.toDouble(),
      knowledgeScores: json['knowledge_scores'] as String?,
      questionDistribution: json['question_distribution'] as String?,
      abilityBreakdown: json['ability_breakdown'] as String?,
      learningSpeed: (json['learning_speed'] as num?)?.toDouble(),
      consistency: (json['consistency'] as num?)?.toDouble(),
      strengths: json['strengths'] as String?,
      weaknesses: json['weaknesses'] as String?,
      recommendations: json['recommendations'] as String?,
      createTime: (json['create_time'] as num).toInt(),
    );

Map<String, dynamic> _$PracticeReportToJson(PracticeReport instance) =>
    <String, dynamic>{
      'id': instance.id,
      'session_id': instance.sessionId,
      'student_id': instance.studentId,
      'total_questions': instance.totalQuestions,
      'correct_questions': instance.correctQuestions,
      'total_time': instance.totalTime,
      'overall_score': instance.overallScore,
      'current_ability': instance.currentAbility,
      'confidence': instance.confidence,
      'ability_level': instance.abilityLevel,
      'percentile': instance.percentile,
      'knowledge_scores': instance.knowledgeScores,
      'question_distribution': instance.questionDistribution,
      'ability_breakdown': instance.abilityBreakdown,
      'learning_speed': instance.learningSpeed,
      'consistency': instance.consistency,
      'strengths': instance.strengths,
      'weaknesses': instance.weaknesses,
      'recommendations': instance.recommendations,
      'create_time': instance.createTime,
    };
