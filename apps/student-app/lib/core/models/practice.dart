import 'package:json_annotation/json_annotation.dart';

part 'practice.g.dart';

/// 练习模型
@JsonSerializable()
class Practice {
  final int id;
  final String name;
  final String slug;
  final String? icon;
  final String? description;
  @JsonKey(name: 'specialty_type')
  final String? specialtyType;
  @JsonKey(name: 'parameter_config')
  final Map<String, dynamic>? parameterConfig;
  @JsonKey(name: 'create_time')
  final int createTime;
  @JsonKey(name: 'update_time')
  final int updateTime;

  const Practice({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
    this.description,
    this.specialtyType,
    this.parameterConfig,
    required this.createTime,
    required this.updateTime,
  });

  factory Practice.fromJson(Map<String, dynamic> json) =>
      _$PracticeFromJson(json);

  Map<String, dynamic> toJson() => _$PracticeToJson(this);
}

