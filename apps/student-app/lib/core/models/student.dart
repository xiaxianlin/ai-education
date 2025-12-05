import 'package:json_annotation/json_annotation.dart';

part 'student.g.dart';

/// 学生信息模型
@JsonSerializable()
class Student {
  final String id;
  final String name;
  final String phone;
  final int grade;
  final int status; // 0-正常, 1-禁用
  @JsonKey(name: 'create_time')
  final int createTime;
  @JsonKey(name: 'update_time')
  final int? updateTime;

  const Student({
    required this.id,
    required this.name,
    required this.phone,
    required this.grade,
    required this.status,
    required this.createTime,
    this.updateTime,
  });

  factory Student.fromJson(Map<String, dynamic> json) =>
      _$StudentFromJson(json);

  Map<String, dynamic> toJson() => _$StudentToJson(this);
}

