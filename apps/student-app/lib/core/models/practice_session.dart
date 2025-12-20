import 'package:json_annotation/json_annotation.dart';
import 'textbook.dart';

part 'practice_session.g.dart';

/// 练习会话模型
@JsonSerializable()
class PracticeSession {
  final int id;
  @JsonKey(name: 'student_id')
  final String studentId;
  @JsonKey(name: 'session_type')
  final String sessionType; // "daily_practice" | "unit_practice" | "assessment"
  @JsonKey(name: 'practice_id')
  final int? practiceId; // 练习ID
  @JsonKey(name: 'target_id')
  final int? targetId; // 单元ID或日期（如 20241123）
  @JsonKey(name: 'textbook_id')
  final int? textbookId; // 教材ID
  @JsonKey(name: 'question_count')
  final int questionCount; // 题目总数
  @JsonKey(name: 'answer_count')
  final int answerCount; // 已答题数
  @JsonKey(name: 'correct_count')
  final int correctCount; // 正确数
  final int status; // 会话状态：0-未开始, 1-进行中, 2-已完成
  @JsonKey(name: 'generate_status')
  final int generateStatus; // 生成状态：-1-生成失败, 0-生成中, 1-生成成功
  @JsonKey(name: 'start_time')
  final int startTime; // 开始时间（Unix时间戳，秒）
  @JsonKey(name: 'end_time')
  final int? endTime; // 结束时间（Unix时间戳，秒）
  @JsonKey(name: 'create_time')
  final int createTime; // 创建时间（Unix时间戳，秒）
  @JsonKey(name: 'update_time')
  final int? updateTime; // 更新时间（Unix时间戳，秒）
  final Textbook? textbook; // 教材信息（可选）

  const PracticeSession({
    required this.id,
    required this.studentId,
    required this.sessionType,
    this.practiceId,
    this.targetId,
    this.textbookId,
    required this.questionCount,
    required this.answerCount,
    required this.correctCount,
    required this.status,
    required this.generateStatus,
    required this.startTime,
    this.endTime,
    required this.createTime,
    this.updateTime,
    this.textbook,
  });

  factory PracticeSession.fromJson(Map<String, dynamic> json) =>
      _$PracticeSessionFromJson(json);

  Map<String, dynamic> toJson() => _$PracticeSessionToJson(this);
}

