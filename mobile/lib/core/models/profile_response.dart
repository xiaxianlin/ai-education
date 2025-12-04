import 'package:json_annotation/json_annotation.dart';
import 'student.dart';
import 'textbook.dart';

part 'profile_response.g.dart';

/// 个人中心响应模型
@JsonSerializable()
class ProfileResponse {
  final Student student;
  final List<Textbook> textbooks;

  const ProfileResponse({
    required this.student,
    required this.textbooks,
  });

  factory ProfileResponse.fromJson(Map<String, dynamic> json) =>
      _$ProfileResponseFromJson(json);

  Map<String, dynamic> toJson() => _$ProfileResponseToJson(this);
}

