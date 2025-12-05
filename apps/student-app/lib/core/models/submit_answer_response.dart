import 'package:json_annotation/json_annotation.dart';

part 'submit_answer_response.g.dart';

/// 提交答案响应
@JsonSerializable()
class SubmitAnswerResponse {
  @JsonKey(name: 'is_correct')
  final bool isCorrect;
  @JsonKey(name: 'correct_answer')
  final String correctAnswer;
  @JsonKey(name: 'user_answer')
  final String? userAnswer; // 用户答案（可能是ASR识别后的文本）
  final String? analysis; // 错题分析（答错时返回）
  @JsonKey(name: 'session_progress')
  final SessionProgress sessionProgress;

  const SubmitAnswerResponse({
    required this.isCorrect,
    required this.correctAnswer,
    this.userAnswer,
    this.analysis,
    required this.sessionProgress,
  });

  factory SubmitAnswerResponse.fromJson(Map<String, dynamic> json) =>
      _$SubmitAnswerResponseFromJson(json);

  Map<String, dynamic> toJson() => _$SubmitAnswerResponseToJson(this);
}

/// 会话进度
@JsonSerializable()
class SessionProgress {
  @JsonKey(name: 'answer_count')
  final int answerCount;
  @JsonKey(name: 'correct_count')
  final int correctCount;
  @JsonKey(name: 'total_count')
  final int totalCount; // 题目总数
  final int status;

  const SessionProgress({
    required this.answerCount,
    required this.correctCount,
    required this.totalCount,
    required this.status,
  });

  factory SessionProgress.fromJson(Map<String, dynamic> json) =>
      _$SessionProgressFromJson(json);

  Map<String, dynamic> toJson() => _$SessionProgressToJson(this);
}

