import 'package:student_app/core/models/question_v2.dart';
import 'package:student_app/core/api/api_client.dart';

/// V2 练习 API 服务
class PracticeV2Service {
  final ApiClient _api = ApiClient.instance;

  /// 获取 V2 题目详情
  Future<QuestionV2Response> getQuestionV2(String questionId) async {
    final response = await _api.get('/practice/v2/question/$questionId');
    return QuestionV2Response.fromJson(response);
  }

  /// 提交 V2 答案
  Future<AnswerResultV2> submitAnswerV2({
    required int sessionId,
    required String questionId,
    required dynamic answer,
    List<SubAnswerV2>? subAnswers,
    int? timeSpent,
  }) async {
    final body = <String, dynamic>{
      'session_id': sessionId,
      'question_id': questionId,
      'answer': answer,
    };

    if (subAnswers != null && subAnswers.isNotEmpty) {
      body['sub_answers'] = subAnswers.map((e) => e.toJson()).toList();
    }

    if (timeSpent != null) {
      body['time_spent'] = timeSpent;
    }

    final response = await _api.post('/practice/v2/answer', data: body);
    return AnswerResultV2.fromJson(response);
  }
}

/// V2 题目响应（不含答案，用于学生答题）
class QuestionV2Response {
  final String id;
  final int questionTypeId;
  final String questionTypeCode;
  final String subject;
  final int grade;
  final String stage;
  final StemV2 stem;
  final List<QuestionOptionV2>? options;
  final List<Map<String, dynamic>>? blanks;
  final List<QuestionResourceV2>? resources;
  final String difficulty;
  final String? cognitiveLevel;

  const QuestionV2Response({
    required this.id,
    required this.questionTypeId,
    required this.questionTypeCode,
    required this.subject,
    required this.grade,
    required this.stage,
    required this.stem,
    this.options,
    this.blanks,
    this.resources,
    required this.difficulty,
    this.cognitiveLevel,
  });

  factory QuestionV2Response.fromJson(Map<String, dynamic> json) {
    return QuestionV2Response(
      id: json['id'] as String,
      questionTypeId: json['questionTypeId'] as int,
      questionTypeCode: json['questionTypeCode'] as String,
      subject: json['subject'] as String,
      grade: json['grade'] as int,
      stage: json['stage'] as String,
      stem: StemV2.fromJson(json['stem'] as Map<String, dynamic>),
      options: (json['options'] as List<dynamic>?)
          ?.map((e) => QuestionOptionV2.fromJson(e as Map<String, dynamic>))
          .toList(),
      blanks: (json['blanks'] as List<dynamic>?)
          ?.map((e) => e as Map<String, dynamic>)
          .toList(),
      resources: (json['resources'] as List<dynamic>?)
          ?.map((e) => QuestionResourceV2.fromJson(e as Map<String, dynamic>))
          .toList(),
      difficulty: json['difficulty'] as String,
      cognitiveLevel: json['cognitiveLevel'] as String?,
    );
  }

  /// 判断是否为复合题
  bool get isComposite => (stem.subQuestions?.length ?? 0) > 0;
}

/// 子题答案
class SubAnswerV2 {
  final String subQuestionId;
  final dynamic answer;
  final int? timeSpent;

  const SubAnswerV2({
    required this.subQuestionId,
    required this.answer,
    this.timeSpent,
  });

  Map<String, dynamic> toJson() => {
        'sub_question_id': subQuestionId,
        'answer': answer,
        if (timeSpent != null) 'time_spent': timeSpent,
      };
}

/// V2 答案评判结果
class AnswerResultV2 {
  final bool isCorrect;
  final double score;
  final double fullScore;
  final String? feedback;
  final dynamic correctAnswer;
  final List<SubResultV2>? subResults;

  const AnswerResultV2({
    required this.isCorrect,
    required this.score,
    required this.fullScore,
    this.feedback,
    this.correctAnswer,
    this.subResults,
  });

  factory AnswerResultV2.fromJson(Map<String, dynamic> json) {
    return AnswerResultV2(
      isCorrect: json['is_correct'] as bool,
      score: (json['score'] as num).toDouble(),
      fullScore: (json['full_score'] as num).toDouble(),
      feedback: json['feedback'] as String?,
      correctAnswer: json['correct_answer'],
      subResults: (json['sub_results'] as List<dynamic>?)
          ?.map((e) => SubResultV2.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  /// 得分率
  double get scoreRate => fullScore > 0 ? score / fullScore : 0;
}

/// 子题评判结果
class SubResultV2 {
  final String subQuestionId;
  final bool isCorrect;
  final double score;
  final double fullScore;

  const SubResultV2({
    required this.subQuestionId,
    required this.isCorrect,
    required this.score,
    required this.fullScore,
  });

  factory SubResultV2.fromJson(Map<String, dynamic> json) {
    return SubResultV2(
      subQuestionId: json['sub_question_id'] as String,
      isCorrect: json['is_correct'] as bool,
      score: (json['score'] as num).toDouble(),
      fullScore: (json['full_score'] as num).toDouble(),
    );
  }
}

