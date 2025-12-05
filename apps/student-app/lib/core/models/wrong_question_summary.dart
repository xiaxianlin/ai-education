import 'package:json_annotation/json_annotation.dart';

part 'wrong_question_summary.g.dart';

/// 错题汇总模型（按 question_id 聚合后的数据）
@JsonSerializable()
class WrongQuestionSummary {
  final int id; // question_id
  @JsonKey(name: 'question_id')
  final int questionId;
  @JsonKey(name: 'student_id')
  final String? studentId;
  @JsonKey(name: 'wrong_count')
  final int wrongCount;
  @JsonKey(name: 'last_wrong_time')
  final int lastWrongTime;
  @JsonKey(name: 'is_mastered')
  final int isMastered; // 0-未掌握, 1-已掌握
  @JsonKey(name: 'mastered_time')
  final int masteredTime;
  @JsonKey(name: 'question_content')
  final String? questionContent;
  final String? knowledge;
  @JsonKey(name: 'create_time')
  final int? createTime;
  @JsonKey(name: 'update_time')
  final int? updateTime;

  const WrongQuestionSummary({
    required this.id,
    required this.questionId,
    this.studentId,
    required this.wrongCount,
    required this.lastWrongTime,
    required this.isMastered,
    required this.masteredTime,
    this.questionContent,
    this.knowledge,
    this.createTime,
    this.updateTime,
  });

  factory WrongQuestionSummary.fromJson(Map<String, dynamic> json) =>
      _$WrongQuestionSummaryFromJson(json);

  Map<String, dynamic> toJson() => _$WrongQuestionSummaryToJson(this);

  /// 是否已掌握
  bool get mastered => isMastered == 1;
}

