import 'package:json_annotation/json_annotation.dart';

part 'practice_wrong_record.g.dart';

/// 错题记录模型
@JsonSerializable()
class PracticeWrongRecord {
  final int id;
  @JsonKey(name: 'student_id')
  final String studentId;
  @JsonKey(name: 'question_id')
  final int questionId;
  @JsonKey(name: 'session_id')
  final int sessionId;
  @JsonKey(name: 'unit_id')
  final int? unitId;
  final String? knowledge;
  @JsonKey(name: 'textbook_id')
  final int? textbookId;
  @JsonKey(name: 'user_answer')
  final String? userAnswer;
  @JsonKey(name: 'correct_answer')
  final String? correctAnswer;
  final String? analysis; // 错题分析
  @JsonKey(name: 'time_spent')
  final int? timeSpent;
  @JsonKey(name: 'is_corrected')
  final int isCorrected; // 是否已订正：0-未订正, 1-已订正
  @JsonKey(name: 'corrected_time')
  final int correctedTime;
  @JsonKey(name: 'create_time')
  final int createTime;
  @JsonKey(name: 'update_time')
  final int updateTime;

  const PracticeWrongRecord({
    required this.id,
    required this.studentId,
    required this.questionId,
    required this.sessionId,
    this.unitId,
    this.knowledge,
    this.textbookId,
    this.userAnswer,
    this.correctAnswer,
    this.analysis,
    this.timeSpent,
    required this.isCorrected,
    required this.correctedTime,
    required this.createTime,
    required this.updateTime,
  });

  factory PracticeWrongRecord.fromJson(Map<String, dynamic> json) =>
      _$PracticeWrongRecordFromJson(json);

  Map<String, dynamic> toJson() => _$PracticeWrongRecordToJson(this);
}

