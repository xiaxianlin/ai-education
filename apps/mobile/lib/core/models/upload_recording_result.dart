import 'package:json_annotation/json_annotation.dart';

part 'upload_recording_result.g.dart';

/// 上传录音结果
@JsonSerializable()
class UploadRecordingResult {
  @JsonKey(name: 'oss_path')
  final String ossPath; // OSS 存储路径
  final String transcription; // ASR 识别文本
  final bool match; // 是否匹配题目要求
  final String reason; // 匹配/不匹配的原因说明
  final String? suggestion; // 改进建议（可选）

  const UploadRecordingResult({
    required this.ossPath,
    required this.transcription,
    required this.match,
    required this.reason,
    this.suggestion,
  });

  factory UploadRecordingResult.fromJson(Map<String, dynamic> json) =>
      _$UploadRecordingResultFromJson(json);

  Map<String, dynamic> toJson() => _$UploadRecordingResultToJson(this);
}

