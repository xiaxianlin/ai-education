import 'package:json_annotation/json_annotation.dart';

part 'submit_answer_params.g.dart';

/// 提交答案请求参数
@JsonSerializable()
class SubmitAnswerParams {
  @JsonKey(name: 'session_id')
  final int sessionId;
  @JsonKey(name: 'question_id')
  final String questionId;
  final String answer;
  @JsonKey(name: 'time_spent')
  final int timeSpent; // 答题耗时（秒）
  @JsonKey(name: 'is_audio_answer')
  final bool? isAudioAnswer; // 是否为音频回答（口语题）
  @JsonKey(name: 'audio_data')
  final String? audioData; // 音频 OSS 存储路径
  @JsonKey(name: 'audio_match')
  final bool? audioMatch; // 音频理解结果：是否匹配题目要求（仅口语题）
  @JsonKey(name: 'audio_analysis')
  final String? audioAnalysis; // 音频理解结果：综合分析（仅口语题）

  const SubmitAnswerParams({
    required this.sessionId,
    required this.questionId,
    required this.answer,
    required this.timeSpent,
    this.isAudioAnswer,
    this.audioData,
    this.audioMatch,
    this.audioAnalysis,
  });

  factory SubmitAnswerParams.fromJson(Map<String, dynamic> json) =>
      _$SubmitAnswerParamsFromJson(json);

  Map<String, dynamic> toJson() => _$SubmitAnswerParamsToJson(this);
}

