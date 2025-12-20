import 'dart:io';
import 'package:dio/dio.dart';
import 'package:student_app/core/api/api_client.dart';
import 'package:student_app/core/models/practice_session.dart';
import 'package:student_app/core/models/practice.dart';
import 'package:student_app/core/models/practice_answer.dart';
import 'package:student_app/core/models/practice_report.dart';
import 'package:student_app/core/models/submit_answer_params.dart';
import 'package:student_app/core/models/submit_answer_response.dart';
import 'package:student_app/core/models/upload_recording_result.dart';
import 'package:student_app/core/models/question.dart';

/// 练习相关 API 端点
class PracticeEndpoints {
  PracticeEndpoints._();

  static final _api = ApiClient.instance;

  /// 获取日常练习
  /// GET /api/student/practice/daily/{textbook_id}
  static Future<PracticeSession> getDailyPractice(int textbookId) async {
    final data = await _api.get<Map<String, dynamic>>('/practice/daily/$textbookId');
    return PracticeSession.fromJson(data);
  }

  /// 获取单元练习
  /// GET /api/student/practice/unit/{unit_id}
  static Future<PracticeSession> getUnitPractice(int unitId) async {
    final data = await _api.get<Map<String, dynamic>>('/practice/unit/$unitId');
    return PracticeSession.fromJson(data);
  }

  /// 获取能力评测
  /// GET /api/student/practice/assessment/{textbook_id}
  static Future<PracticeSession> getAssessment(int textbookId) async {
    final data = await _api.get<Map<String, dynamic>>('/practice/assessment/$textbookId');
    return PracticeSession.fromJson(data);
  }

  /// 获取可用的练习列表（系统+自定义）
  /// GET /api/student/practice/list
  static Future<List<Practice>> listPractices() async {
    final data = await _api.get<List<dynamic>>('/practice/list');
    return data.map((json) => Practice.fromJson(json)).toList();
  }

  /// 创建练习
  /// POST /api/student/practice/create
  /// @returns 任务ID (taskId)
  static Future<String> createPractice({
    String? type, // "daily_practice" | "unit_practice" | "assessment" (兼容旧逻辑)
    int? practiceId, // 练习ID（优先使用）
    required int textbookId,
    int? unitId,
  }) async {
    return await _api.post<String>(
      '/practice/create',
      data: {
        if (type != null) 'type': type,
        if (practiceId != null) 'practice_id': practiceId,
        'textbook_id': textbookId,
        if (unitId != null) 'unit_id': unitId,
      },
    );
  }

  /// 查询练习生成任务状态
  /// GET /api/student/practice/task/{task_id}/status
  static Future<String> getPracticeTaskStatus(String taskId) async {
    return await _api.get<String>('/practice/task/$taskId/status');
  }

  /// 开始练习
  /// POST /api/student/practice/{session_id}/begin
  static Future<void> beginPractice(int sessionId) async {
    await _api.post<void>('/practice/$sessionId/begin');
  }

  /// 提交答案
  /// POST /api/student/practice/answer
  static Future<PracticeAnswer> submitAnswer(
    SubmitAnswerParams params,
  ) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/practice/answer',
      data: params.toJson(),
    );
    return PracticeAnswer.fromJson(data);
  }

  /// 上传口语题录音并进行语音识别
  /// POST /api/student/practice/answer/audio/analyze
  static Future<UploadRecordingResult> audioAnswerAnalyze({
    required int sessionId,
    required String questionId,
    required File audioFile,
  }) async {
    final formData = FormData.fromMap({
      'session_id': sessionId,
      'question_id': questionId,
      'audio_type': 'webm',
      'audio_file': await MultipartFile.fromFile(
        audioFile.path,
        filename: 'audio.webm',
      ),
    });

    final data = await _api.postForm<Map<String, dynamic>>(
      '/practice/answer/audio/analyze',
      formData: formData,
    );
    return UploadRecordingResult.fromJson(data);
  }

  /// 完成练习
  /// POST /api/student/practice/{session_id}/complete
  /// @returns 报告 ID
  static Future<int> completePractice(int sessionId) async {
    return await _api.post<int>(
      '/practice/$sessionId/complete',
    );
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
  /// GET /api/student/practice/history/{type}
  static Future<List<PracticeSession>> getHistory({
    required String type,
  }) async {
    final data = await _api.get<List<dynamic>>(
      '/practice/history/$type',
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

