import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:record/record.dart' as record;
import 'package:permission_handler/permission_handler.dart';
import '../../data/practice_repository.dart';
import '../../../../../core/models/upload_recording_result.dart';
import '../../../../../core/utils/error_handler.dart';

/// 录音完成回调
typedef RecordingCompleteCallback = void Function(
  String audioPath,
  UploadRecordingResult? result,
);

/// 音频录制组件
class AudioRecorderWidget extends StatefulWidget {
  final int questionId;
  final int sessionId;
  final bool disabled;
  final RecordingCompleteCallback onRecordingComplete;

  const AudioRecorderWidget({
    super.key,
    required this.questionId,
    required this.sessionId,
    required this.disabled,
    required this.onRecordingComplete,
  });

  @override
  State<AudioRecorderWidget> createState() => _AudioRecorderWidgetState();
}

class _AudioRecorderWidgetState extends State<AudioRecorderWidget> {
  final record.AudioRecorder _audioRecorder = record.AudioRecorder();
  bool _isRecording = false;
  Duration _duration = Duration.zero;
  Timer? _timer;
  bool _isUploading = false;
  double _uploadProgress = 0.0;

  @override
  void dispose() {
    _timer?.cancel();
    _audioRecorder.dispose();
    super.dispose();
  }

  /// 请求麦克风权限
  Future<bool> _requestPermission() async {
    final status = await Permission.microphone.request();
    return status.isGranted;
  }

  /// 开始录音
  Future<void> _startRecording() async {
    if (widget.disabled) return;

    // 请求权限
    final hasPermission = await _requestPermission();
    if (!hasPermission) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('需要麦克风权限才能录音'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    try {
      // 获取临时文件路径
      final directory = Directory.systemTemp;
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final path = '${directory.path}/recording_$timestamp.m4a';

      // 开始录音
      await _audioRecorder.start(
        const record.RecordConfig(
          encoder: record.AudioEncoder.aacLc,
          bitRate: 128000,
          sampleRate: 44100,
        ),
        path: path,
      );

      setState(() {
        _isRecording = true;
        _duration = Duration.zero;
      });

      // 启动计时器
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (mounted) {
          setState(() {
            _duration = Duration(seconds: _duration.inSeconds + 1);
          });
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('开始录音失败: ${ErrorHandler.getErrorMessage(e)}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// 停止录音
  Future<void> _stopRecording() async {
    try {
      final path = await _audioRecorder.stop();
      _timer?.cancel();

      setState(() {
        _isRecording = false;
      });

      if (path != null && mounted) {
        // 自动上传
        await _uploadRecording(path);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('停止录音失败: ${ErrorHandler.getErrorMessage(e)}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// 取消录音
  Future<void> _cancelRecording() async {
    try {
      await _audioRecorder.stop();
      _timer?.cancel();

      setState(() {
        _isRecording = false;
        _duration = Duration.zero;
      });
    } catch (e) {
      // 忽略错误
    }
  }

  /// 上传录音
  Future<void> _uploadRecording(String audioPath) async {
    setState(() {
      _isUploading = true;
      _uploadProgress = 0.0;
    });

    try {
      final result = await PracticeRepository.instance.uploadRecording(
        sessionId: widget.sessionId,
        questionId: widget.questionId,
        audioFilePath: audioPath,
      );

      if (mounted) {
        widget.onRecordingComplete(audioPath, result);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('录音上传成功'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('上传录音失败: ${ErrorHandler.getErrorMessage(e)}'),
            backgroundColor: Colors.red,
          ),
        );
        // 即使上传失败，也通知外部录音已完成
        widget.onRecordingComplete(audioPath, null);
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
          _uploadProgress = 0.0;
        });
      }
    }
  }

  /// 格式化时长
  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 标题
          Row(
            children: [
              Icon(Icons.mic, color: Colors.blue.shade700),
              const SizedBox(width: 8),
              Text(
                '语音答题',
                style: TextStyle(
                  color: Colors.blue.shade700,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // 录音状态
          if (_isRecording || _isUploading) ...[
            Row(
              children: [
                if (_isRecording) ...[
                  Container(
                    width: 12,
                    height: 12,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '录音中... ${_formatDuration(_duration)}',
                    style: TextStyle(
                      color: Colors.red.shade700,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ] else if (_isUploading) ...[
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.blue.shade700),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '上传中... ${(_uploadProgress * 100).toInt()}%',
                    style: TextStyle(
                      color: Colors.blue.shade700,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 16),
          ],
          // 按钮组
          Row(
            children: [
              if (!_isRecording && !_isUploading) ...[
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: (widget.disabled || _isUploading) ? null : _startRecording,
                    icon: const Icon(Icons.mic),
                    label: const Text('开始录音'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              ] else if (_isRecording) ...[
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _stopRecording,
                    icon: const Icon(Icons.stop),
                    label: const Text('停止录音'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton.icon(
                  onPressed: _cancelRecording,
                  icon: const Icon(Icons.cancel),
                  label: const Text('取消'),
                ),
              ] else if (_isUploading) ...[
                const Expanded(
                  child: OutlinedButton(
                    onPressed: null,
                    child: Text('上传中...'),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

