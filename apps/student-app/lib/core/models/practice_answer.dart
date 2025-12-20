import 'package:json_annotation/json_annotation.dart';

part 'practice_answer.g.dart';

/// 答题记录模型
@JsonSerializable()
class PracticeAnswer {
  final int id;
  @JsonKey(name: 'session_id')
  final int sessionId;
  @JsonKey(name: 'question_id')
  final String questionId;
  @JsonKey(name: 'question_order')
  final int questionOrder; // 题目顺序
  @JsonKey(name: 'text_answer')
  final String? textAnswer; // 文本答案
  final int status; // 答题状态: 0-未答, 1-正确, 2-错误
  @JsonKey(name: 'time_spent')
  final int timeSpent; // 耗时（秒）
  @JsonKey(name: 'submit_time')
  final int? submitTime; // 提交时间
  @JsonKey(name: 'audio_answer')
  final String? audioAnswer; // 音频答案（OSS 存储路径）
  @JsonKey(name: 'correct_answer')
  final String? correctAnswer; // 正确答案 (错题时)
  final String? analysis; // 错题分析 (错题时)

  const PracticeAnswer({
    required this.id,
    required this.sessionId,
    required this.questionId,
    required this.questionOrder,
    this.textAnswer,
    required this.status,
    required this.timeSpent,
    this.submitTime,
    this.audioAnswer,
    this.correctAnswer,
    this.analysis,
  });

  factory PracticeAnswer.fromJson(Map<String, dynamic> json) =>
      _$PracticeAnswerFromJson(json);

  Map<String, dynamic> toJson() => _$PracticeAnswerToJson(this);
}

