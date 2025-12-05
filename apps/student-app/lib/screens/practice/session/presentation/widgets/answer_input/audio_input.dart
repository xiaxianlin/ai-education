import 'package:flutter/material.dart';
import 'package:student_app/core/models/question.dart';
import 'package:student_app/screens/practice/session/presentation/widgets/audio_recorder.dart';

/// 语音输入组件（口语题）
class AudioInputWidget extends StatelessWidget {
  final Question question;
  final int sessionId;
  final String? audioPath;
  final String? transcription;
  final bool? match;
  final String? analysis;
  final bool disabled;
  final ValueChanged<String> onAudioRecorded;
  final ValueChanged<Map<String, dynamic>> onAnalysisReceived;

  const AudioInputWidget({
    super.key,
    required this.question,
    required this.sessionId,
    this.audioPath,
    this.transcription,
    this.match,
    this.analysis,
    this.disabled = false,
    required this.onAudioRecorded,
    required this.onAnalysisReceived,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 录音组件
        AudioRecorderWidget(
          questionId: question.id,
          sessionId: sessionId,
          disabled: disabled,
          onRecordingComplete: (audioPath, result) {
            onAudioRecorded(audioPath);
            if (result != null) {
              onAnalysisReceived({
                'transcription': result.transcription,
                'match': result.match,
                'reason': result.reason,
                'suggestion': result.suggestion,
              });
            }
          },
        ),
        // 识别结果
        if (transcription != null && transcription!.isNotEmpty) ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '识别结果：',
                  style: TextStyle(
                    color: Colors.blue.shade700,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  transcription!,
                  style: TextStyle(color: Colors.blue.shade900),
                ),
              ],
            ),
          ),
        ],
        // 匹配结果
        if (match != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: match == true ? Colors.green.shade50 : Colors.orange.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  match == true ? Icons.check_circle : Icons.info,
                  color: match == true ? Colors.green : Colors.orange,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    match == true ? '匹配题目要求' : '不完全匹配题目要求',
                    style: TextStyle(
                      color: match == true ? Colors.green.shade700 : Colors.orange.shade700,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
        // 分析说明
        if (analysis != null && analysis!.isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '分析说明：',
                  style: TextStyle(
                    color: Colors.grey.shade700,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  analysis!,
                  style: TextStyle(color: Colors.grey.shade900),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

