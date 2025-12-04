import 'dart:io';
import 'package:dio/dio.dart';
import '../api_client.dart';
import '../../models/practice_session.dart';
import '../../models/practice_answer.dart';
import '../../models/practice_report.dart';
import '../../models/submit_answer_params.dart';
import '../../models/submit_answer_response.dart';
import '../../models/upload_recording_result.dart';
import '../../models/question.dart';

/// 练习相关 API 端点
class PracticeEndpoints {
  PracticeEndpoints._();

  static final _api = ApiClient.instance;

  /// 获取每日练习
  /// GET /api/student/practice/daily
  static Future<List<PracticeSession>> getDailyPractice() async {
    final data = await _api.get<List<dynamic>>('/practice/daily');
    return data.map((json) => PracticeSession.fromJson(json)).toList();
  }

  /// 获取单元练习
  /// GET /api/student/practice/unit
  static Future<List<PracticeSession>> getUnitPractice() async {
    final data = await _api.get<List<dynamic>>('/practice/unit');
    return data.map((json) => PracticeSession.fromJson(json)).toList();
  }

  /// 获取能力评测
  /// GET /api/student/practice/assessment
  static Future<List<PracticeSession>> getAssessment() async {
    final data = await _api.get<List<dynamic>>('/practice/assessment');
    return data.map((json) => PracticeSession.fromJson(json)).toList();
  }

  /// 创建练习
  /// POST /api/student/practice/create
  static Future<int> createPractice({
    required String type, // "daily_practice" | "unit_practice" | "assessment"
    required int textbookId,
    int? unitId,
  }) async {
    return await _api.post<int>(
      '/practice/create',
      data: {
        'type': type,
        'textbook_id': textbookId,
        if (unitId != null) 'unit_id': unitId,
      },
    );
  }

  /// 开始练习
  /// POST /api/student/practice/{session_id}/begin
  static Future<void> beginPractice(int sessionId) async {
    await _api.post<void>('/practice/$sessionId/begin');
  }

  /// 提交答案
  /// POST /api/student/practice/answer
  static Future<SubmitAnswerResponse> submitAnswer(
    SubmitAnswerParams params,
  ) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/practice/answer',
      data: params.toJson(),
    );
    return SubmitAnswerResponse.fromJson(data);
  }

  /// 上传录音
  /// POST /api/student/practice/answer/{session_id}/{question_id}/upload
  static Future<UploadRecordingResult> uploadRecording({
    required int sessionId,
    required int questionId,
    required File audioFile,
  }) async {
    final formData = FormData.fromMap({
      'audio_file': await MultipartFile.fromFile(
        audioFile.path,
        filename: 'audio.webm',
      ),
    });

    final data = await _api.postForm<Map<String, dynamic>>(
      '/practice/answer/$sessionId/$questionId/upload',
      formData: formData,
    );
    return UploadRecordingResult.fromJson(data);
  }

  /// 完成练习
  /// POST /api/student/practice/{session_id}/complete
  static Future<int> completePractice(int sessionId) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/practice/$sessionId/complete',
    );
    return data['report_id'] as int;
  }

  /// 获取练习详情
  /// GET /api/student/practice/detail/{session_id}
  static Future<PracticeSessionDetail> getSessionDetail(int sessionId) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/practice/detail/$sessionId',
    );
    return PracticeSessionDetail.fromJson(data);
  }

  /// 获取练习历史
  /// GET /api/student/practice/history/{type}?limit=20
  static Future<List<PracticeSession>> getHistory({
    required String type,
    int? limit,
  }) async {
    final data = await _api.get<List<dynamic>>(
      '/practice/history/$type',
      queryParameters: limit != null ? {'limit': limit} : null,
    );
    return data.map((json) => PracticeSession.fromJson(json)).toList();
  }
}

/// 练习会话详情
class PracticeSessionDetail {
  final PracticeSession session;
  final List<Question> questions;
  final List<PracticeAnswer> answers;
  final PracticeReport? report;

  PracticeSessionDetail({
    required this.session,
    required this.questions,
    required this.answers,
    this.report,
  });

  factory PracticeSessionDetail.fromJson(Map<String, dynamic> json) {
    return PracticeSessionDetail(
      session: PracticeSession.fromJson(json['session']),
      questions: (json['questions'] as List)
          .map((q) => Question.fromJson(q))
          .toList(),
      answers: (json['answers'] as List)
          .map((a) => PracticeAnswer.fromJson(a))
          .toList(),
      report: json['report'] != null
          ? PracticeReport.fromJson(json['report'])
          : null,
    );
  }
}

