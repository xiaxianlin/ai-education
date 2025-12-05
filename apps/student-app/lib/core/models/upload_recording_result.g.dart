// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'upload_recording_result.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UploadRecordingResult _$UploadRecordingResultFromJson(
        Map<String, dynamic> json) =>
    UploadRecordingResult(
      ossPath: json['oss_path'] as String,
      transcription: json['transcription'] as String,
      match: json['match'] as bool,
      reason: json['reason'] as String,
      suggestion: json['suggestion'] as String?,
    );

Map<String, dynamic> _$UploadRecordingResultToJson(
        UploadRecordingResult instance) =>
    <String, dynamic>{
      'oss_path': instance.ossPath,
      'transcription': instance.transcription,
      'match': instance.match,
      'reason': instance.reason,
      'suggestion': instance.suggestion,
    };
