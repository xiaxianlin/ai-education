import 'package:json_annotation/json_annotation.dart';

part 'practice_report.g.dart';

/// 练习报告模型
@JsonSerializable()
class PracticeReport {
  final int id;
  @JsonKey(name: 'session_id')
  final int sessionId;
  @JsonKey(name: 'student_id')
  final String studentId;
  @JsonKey(name: 'total_questions')
  final int totalQuestions;
  @JsonKey(name: 'correct_questions')
  final int correctQuestions;
  @JsonKey(name: 'total_time')
  final int totalTime; // 总耗时（秒）
  @JsonKey(name: 'overall_score')
  final double overallScore; // 总得分
  @JsonKey(name: 'current_ability')
  final double? currentAbility; // 当前能力值（-3到+3，主要用于assessment）
  final double? confidence; // 置信度
  @JsonKey(name: 'ability_level')
  final String? abilityLevel; // 能力等级
  final double? percentile; // 百分位排名
  @JsonKey(name: 'knowledge_scores')
  final String? knowledgeScores; // 知识点掌握情况（JSON字符串）
  @JsonKey(name: 'question_distribution')
  final String? questionDistribution; // 题目来源分布（JSON字符串）
  @JsonKey(name: 'ability_breakdown')
  final String? abilityBreakdown; // 能力分解（JSON字符串）
  @JsonKey(name: 'learning_speed')
  final double? learningSpeed; // 学习速度
  final double? consistency; // 稳定性
  final String? strengths; // 优势（JSON数组字符串）
  final String? weaknesses; // 薄弱点（JSON数组字符串）
  final String? recommendations; // 学习建议（JSON数组字符串）
  @JsonKey(name: 'create_time')
  final int createTime;

  const PracticeReport({
    required this.id,
    required this.sessionId,
    required this.studentId,
    required this.totalQuestions,
    required this.correctQuestions,
    required this.totalTime,
    required this.overallScore,
    this.currentAbility,
    this.confidence,
    this.abilityLevel,
    this.percentile,
    this.knowledgeScores,
    this.questionDistribution,
    this.abilityBreakdown,
    this.learningSpeed,
    this.consistency,
    this.strengths,
    this.weaknesses,
    this.recommendations,
    required this.createTime,
  });

  factory PracticeReport.fromJson(Map<String, dynamic> json) =>
      _$PracticeReportFromJson(json);

  Map<String, dynamic> toJson() => _$PracticeReportToJson(this);
}

