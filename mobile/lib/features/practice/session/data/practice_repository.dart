import 'dart:io';
import '../../../../core/api/endpoints/practice_endpoints.dart';
import '../../../../core/models/submit_answer_params.dart';
import '../../../../core/models/submit_answer_response.dart';
import '../../../../core/models/upload_recording_result.dart';

/// 练习数据仓库
class PracticeRepository {
  PracticeRepository._();
  static final PracticeRepository instance = PracticeRepository._();

  /// 获取练习会话详情
  Future<PracticeSessionDetail> getSessionDetail(int sessionId) async {
    return await PracticeEndpoints.getSessionDetail(sessionId);
  }

  /// 开始练习
  Future<void> beginPractice(int sessionId) async {
    await PracticeEndpoints.beginPractice(sessionId);
  }

  /// 提交答案
  Future<SubmitAnswerResponse> submitAnswer(
    SubmitAnswerParams params,
  ) async {
    return await PracticeEndpoints.submitAnswer(params);
  }

  /// 上传录音
  Future<UploadRecordingResult> uploadRecording({
    required int sessionId,
    required int questionId,
    required String audioFilePath,
  }) async {
    final file = File(audioFilePath);
    return await PracticeEndpoints.uploadRecording(
      sessionId: sessionId,
      questionId: questionId,
      audioFile: file,
    );
  }

  /// 完成练习
  Future<int> completePractice(int sessionId) async {
    return await PracticeEndpoints.completePractice(sessionId);
  }
}

