/// Auto-generated Dart models from TypeScript types.
/// Generated on: 2025-12-04T11:07:34.370Z

import 'package:json_annotation/json_annotation.dart';
import 'enums.dart';

@JsonSerializable()
class ApiResponse {
  final int code;
  final String message;
  final T? data;

  const ApiResponse({
    required this.code,
    required this.message,
    this.data,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json) => _$ApiResponseFromJson(json);

  Map<String, dynamic> toJson() => _$ApiResponseToJson(this);
}

@JsonSerializable()
class PaginatedResponse {
  final List<T> items;
  final int total;
  final int page;
  final int pageSize;

  const PaginatedResponse({
    required this.items,
    required this.total,
    required this.page,
    required this.pageSize,
  });

  factory PaginatedResponse.fromJson(Map<String, dynamic> json) => _$PaginatedResponseFromJson(json);

  Map<String, dynamic> toJson() => _$PaginatedResponseToJson(this);
}

@JsonSerializable()
class SearchParams {
  final int? page;
  final int? pageSize;
  final String? keywords;
  final String? sort;
  final dynamic? order;

  const SearchParams({
    this.page,
    this.pageSize,
    this.keywords,
    this.sort,
    this.order,
  });

  factory SearchParams.fromJson(Map<String, dynamic> json) => _$SearchParamsFromJson(json);

  Map<String, dynamic> toJson() => _$SearchParamsToJson(this);
}

@JsonSerializable()
class SearchResult {
  final int total;
  final List<T> data;

  const SearchResult({
    required this.total,
    required this.data,
  });

  factory SearchResult.fromJson(Map<String, dynamic> json) => _$SearchResultFromJson(json);

  Map<String, dynamic> toJson() => _$SearchResultToJson(this);
}

@JsonSerializable()
class BaseEntity {
  @JsonKey(name: 'create_time')
  final int createTime;
  @JsonKey(name: 'update_time')
  final int? updateTime;

  const BaseEntity({
    required this.createTime,
    this.updateTime,
  });

  factory BaseEntity.fromJson(Map<String, dynamic> json) => _$BaseEntityFromJson(json);

  Map<String, dynamic> toJson() => _$BaseEntityToJson(this);
}

@JsonSerializable()
class Textbook extends BaseEntity {
  final int id;
  final Subject subject;
  final String version;
  final Grade grade;
  final Semester semester;
  final String? title;
  final String? file;
  @JsonKey(name: 'index_file_id')
  final String? indexFileId;
  @JsonKey(name: 'is_parsed')
  final bool isParsed;
  @JsonKey(name: 'cover_image')
  final String? coverImage;
  final String? description;
  final String? publisher;
  @JsonKey(name: 'publish_year')
  final int? publishYear;
  final bool? active;

  const Textbook({
    required this.id,
    required this.subject,
    required this.version,
    required this.grade,
    required this.semester,
    this.title,
    this.file,
    this.indexFileId,
    required this.isParsed,
    this.coverImage,
    this.description,
    this.publisher,
    this.publishYear,
    this.active,
  });

  factory Textbook.fromJson(Map<String, dynamic> json) => _$TextbookFromJson(json);

  Map<String, dynamic> toJson() => _$TextbookToJson(this);
}

@JsonSerializable()
class Unit extends BaseEntity {
  final int id;
  @JsonKey(name: 'textbook_id')
  final int textbookId;
  final String name;
  final String content;
  final int order;
  final Textbook? textbook;
  final List<Knowledge>? knowledges;

  const Unit({
    required this.id,
    required this.textbookId,
    required this.name,
    required this.content,
    required this.order,
    this.textbook,
    this.knowledges,
  });

  factory Unit.fromJson(Map<String, dynamic> json) => _$UnitFromJson(json);

  Map<String, dynamic> toJson() => _$UnitToJson(this);
}

@JsonSerializable()
class Knowledge extends BaseEntity {
  final int id;
  @JsonKey(name: 'textbook_id')
  final int textbookId;
  @JsonKey(name: 'unit_id')
  final int unitId;
  final String name;
  final String content;
  final Difficulty? difficulty;
  final int importance;
  final int order;
  @JsonKey(name: 'parent_id')
  final int? parentId;
  final int level;
  final List<String>? tags;
  final Textbook? textbook;
  final Unit? unit;
  final List<Knowledge>? children;

  const Knowledge({
    required this.id,
    required this.textbookId,
    required this.unitId,
    required this.name,
    required this.content,
    this.difficulty,
    required this.importance,
    required this.order,
    this.parentId,
    required this.level,
    this.tags,
    this.textbook,
    this.unit,
    this.children,
  });

  factory Knowledge.fromJson(Map<String, dynamic> json) => _$KnowledgeFromJson(json);

  Map<String, dynamic> toJson() => _$KnowledgeToJson(this);
}

@JsonSerializable()
class Question extends BaseEntity {
  final int id;
  final QuestionType type;
  final String? subtype;
  final Subject subject;
  final Grade grade;
  final String content;
  final List<String>? options;
  final dynamic? answer;
  final String? explanation;
  final String? resource;
  @JsonKey(name: 'resource_type')
  final ResourceType? resourceType;
  @JsonKey(name: 'resource_content')
  final String? resourceContent;
  final Difficulty? difficulty;
  final int? points;
  @JsonKey(name: 'estimated_time')
  final int? estimatedTime;
  final List<String>? tags;
  @JsonKey(name: 'textbook_id')
  final int textbookId;
  @JsonKey(name: 'unit_id')
  final int? unitId;
  @JsonKey(name: 'knowledge_ids')
  final List<int>? knowledgeIds;
  @JsonKey(name: 'knowledge_names')
  final List<String>? knowledgeNames;
  @JsonKey(name: 'is_correct')
  final bool? isCorrect;
  final int? order;
  @JsonKey(name: 'user_answer')
  final String? userAnswer;
  @JsonKey(name: 'time_spent')
  final int? timeSpent;

  const Question({
    required this.id,
    required this.type,
    this.subtype,
    required this.subject,
    required this.grade,
    required this.content,
    this.options,
    this.answer,
    this.explanation,
    this.resource,
    this.resourceType,
    this.resourceContent,
    this.difficulty,
    this.points,
    this.estimatedTime,
    this.tags,
    required this.textbookId,
    this.unitId,
    this.knowledgeIds,
    this.knowledgeNames,
    this.isCorrect,
    this.order,
    this.userAnswer,
    this.timeSpent,
  });

  factory Question.fromJson(Map<String, dynamic> json) => _$QuestionFromJson(json);

  Map<String, dynamic> toJson() => _$QuestionToJson(this);
}

@JsonSerializable()
class QuestionOption {
  final String id;
  final String label;
  final String content;
  @JsonKey(name: 'is_correct')
  final bool isCorrect;

  const QuestionOption({
    required this.id,
    required this.label,
    required this.content,
    required this.isCorrect,
  });

  factory QuestionOption.fromJson(Map<String, dynamic> json) => _$QuestionOptionFromJson(json);

  Map<String, dynamic> toJson() => _$QuestionOptionToJson(this);
}

@JsonSerializable()
class QuestionGroup {
  final int id;
  final String title;
  final String? description;
  final String? material;
  final List<Question> questions;
  @JsonKey(name: 'total_points')
  final int totalPoints;

  const QuestionGroup({
    required this.id,
    required this.title,
    this.description,
    this.material,
    required this.questions,
    required this.totalPoints,
  });

  factory QuestionGroup.fromJson(Map<String, dynamic> json) => _$QuestionGroupFromJson(json);

  Map<String, dynamic> toJson() => _$QuestionGroupToJson(this);
}

@JsonSerializable()
class PracticeSession extends BaseEntity {
  final int id;
  @JsonKey(name: 'student_id')
  final String studentId;
  @JsonKey(name: 'session_type')
  final PracticeType sessionType;
  @JsonKey(name: 'target_id')
  final int? targetId;
  @JsonKey(name: 'textbook_id')
  final int? textbookId;
  @JsonKey(name: 'question_count')
  final int questionCount;
  @JsonKey(name: 'answer_count')
  final int answerCount;
  @JsonKey(name: 'correct_count')
  final int correctCount;
  final PracticeSessionStatus status;
  @JsonKey(name: 'generate_status')
  final PracticeGenerateStatus generateStatus;
  @JsonKey(name: 'start_time')
  final int startTime;
  @JsonKey(name: 'end_time')
  final int? endTime;
  final Student? student;
  final Textbook? textbook;
  final Unit? unit;
  final List<Question>? questions;
  final List<PracticeAnswer>? answers;
  final PracticeReport? report;

  const PracticeSession({
    required this.id,
    required this.studentId,
    required this.sessionType,
    this.targetId,
    this.textbookId,
    required this.questionCount,
    required this.answerCount,
    required this.correctCount,
    required this.status,
    required this.generateStatus,
    required this.startTime,
    this.endTime,
    this.student,
    this.textbook,
    this.unit,
    this.questions,
    this.answers,
    this.report,
  });

  factory PracticeSession.fromJson(Map<String, dynamic> json) => _$PracticeSessionFromJson(json);

  Map<String, dynamic> toJson() => _$PracticeSessionToJson(this);
}

@JsonSerializable()
class CreatePracticeRequest {
  final PracticeType type;
  @JsonKey(name: 'textbook_id')
  final int textbookId;
  @JsonKey(name: 'unit_id')
  final int? unitId;
  @JsonKey(name: 'target_date')
  final String? targetDate;
  @JsonKey(name: 'question_count')
  final int? questionCount;
  final String? difficulty;
  @JsonKey(name: 'knowledge_ids')
  final List<int>? knowledgeIds;

  const CreatePracticeRequest({
    required this.type,
    required this.textbookId,
    this.unitId,
    this.targetDate,
    this.questionCount,
    this.difficulty,
    this.knowledgeIds,
  });

  factory CreatePracticeRequest.fromJson(Map<String, dynamic> json) => _$CreatePracticeRequestFromJson(json);

  Map<String, dynamic> toJson() => _$CreatePracticeRequestToJson(this);
}

@JsonSerializable()
class PracticeAnswer extends BaseEntity {
  final int id;
  @JsonKey(name: 'session_id')
  final int sessionId;
  @JsonKey(name: 'question_id')
  final int questionId;
  @JsonKey(name: 'question_order')
  final int questionOrder;
  @JsonKey(name: 'text_answer')
  final String? textAnswer;
  final AnswerStatus status;
  @JsonKey(name: 'time_spent')
  final int timeSpent;
  @JsonKey(name: 'submit_time')
  final int? submitTime;
  @JsonKey(name: 'audio_answer')
  final String? audioAnswer;
  final Question? question;

  const PracticeAnswer({
    required this.id,
    required this.sessionId,
    required this.questionId,
    required this.questionOrder,
    this.textAnswer,
    required this.status,
    required this.timeSpent,
    this.submitTime,
    this.audioAnswer,
    this.question,
  });

  factory PracticeAnswer.fromJson(Map<String, dynamic> json) => _$PracticeAnswerFromJson(json);

  Map<String, dynamic> toJson() => _$PracticeAnswerToJson(this);
}

@JsonSerializable()
class SubmitAnswerRequest {
  @JsonKey(name: 'session_id')
  final int sessionId;
  @JsonKey(name: 'question_id')
  final int questionId;
  final String answer;
  @JsonKey(name: 'time_spent')
  final int timeSpent;
  @JsonKey(name: 'is_audio_answer')
  final bool? isAudioAnswer;
  @JsonKey(name: 'audio_data')
  final String? audioData;
  @JsonKey(name: 'audio_match')
  final bool? audioMatch;
  @JsonKey(name: 'audio_reason')
  final String? audioReason;
  @JsonKey(name: 'audio_suggestion')
  final String? audioSuggestion;

  const SubmitAnswerRequest({
    required this.sessionId,
    required this.questionId,
    required this.answer,
    required this.timeSpent,
    this.isAudioAnswer,
    this.audioData,
    this.audioMatch,
    this.audioReason,
    this.audioSuggestion,
  });

  factory SubmitAnswerRequest.fromJson(Map<String, dynamic> json) => _$SubmitAnswerRequestFromJson(json);

  Map<String, dynamic> toJson() => _$SubmitAnswerRequestToJson(this);
}

@JsonSerializable()
class SubmitAnswerResponse {
  @JsonKey(name: 'is_correct')
  final bool isCorrect;
  @JsonKey(name: 'correct_answer')
  final String correctAnswer;
  @JsonKey(name: 'user_answer')
  final String? userAnswer;
  final String? analysis;
  final String? explanation;
  @JsonKey(name: 'session_progress')
  final dynamic sessionProgress;

  const SubmitAnswerResponse({
    required this.isCorrect,
    required this.correctAnswer,
    this.userAnswer,
    this.analysis,
    this.explanation,
    required this.sessionProgress,
  });

  factory SubmitAnswerResponse.fromJson(Map<String, dynamic> json) => _$SubmitAnswerResponseFromJson(json);

  Map<String, dynamic> toJson() => _$SubmitAnswerResponseToJson(this);
}

@JsonSerializable()
class WrongRecord extends BaseEntity {
  final int id;
  @JsonKey(name: 'student_id')
  final String studentId;
  @JsonKey(name: 'question_id')
  final int questionId;
  @JsonKey(name: 'session_id')
  final int sessionId;
  @JsonKey(name: 'unit_id')
  final int? unitId;
  @JsonKey(name: 'knowledge_ids')
  final List<int>? knowledgeIds;
  @JsonKey(name: 'knowledge_names')
  final List<String>? knowledgeNames;
  @JsonKey(name: 'textbook_id')
  final int? textbookId;
  @JsonKey(name: 'user_answer')
  final String? userAnswer;
  @JsonKey(name: 'correct_answer')
  final String? correctAnswer;
  final String? analysis;
  @JsonKey(name: 'time_spent')
  final int? timeSpent;
  @JsonKey(name: 'is_corrected')
  final bool isCorrected;
  @JsonKey(name: 'corrected_time')
  final int? correctedTime;
  @JsonKey(name: 'review_count')
  final int reviewCount;
  @JsonKey(name: 'mastery_level')
  final int masteryLevel;
  final Question? question;
  final PracticeSession? session;

  const WrongRecord({
    required this.id,
    required this.studentId,
    required this.questionId,
    required this.sessionId,
    this.unitId,
    this.knowledgeIds,
    this.knowledgeNames,
    this.textbookId,
    this.userAnswer,
    this.correctAnswer,
    this.analysis,
    this.timeSpent,
    required this.isCorrected,
    this.correctedTime,
    required this.reviewCount,
    required this.masteryLevel,
    this.question,
    this.session,
  });

  factory WrongRecord.fromJson(Map<String, dynamic> json) => _$WrongRecordFromJson(json);

  Map<String, dynamic> toJson() => _$WrongRecordToJson(this);
}

@JsonSerializable()
class PracticeReport extends BaseEntity {
  final int id;
  @JsonKey(name: 'session_id')
  final int sessionId;
  @JsonKey(name: 'student_id')
  final String studentId;
  @JsonKey(name: 'total_questions')
  final int totalQuestions;
  @JsonKey(name: 'correct_questions')
  final int correctQuestions;
  @JsonKey(name: 'total_time')
  final int totalTime;
  @JsonKey(name: 'overall_score')
  final int overallScore;
  @JsonKey(name: 'accuracy_rate')
  final int accuracyRate;
  @JsonKey(name: 'current_ability')
  final int? currentAbility;
  @JsonKey(name: 'ability_level')
  final String? abilityLevel;
  final int? percentile;
  final int? confidence;
  @JsonKey(name: 'knowledge_scores')
  final Map<String, int>? knowledgeScores;
  @JsonKey(name: 'question_distribution')
  final Map<String, int>? questionDistribution;
  @JsonKey(name: 'ability_breakdown')
  final Map<String, dynamic>? abilityBreakdown;
  @JsonKey(name: 'learning_speed')
  final int? learningSpeed;
  final int? consistency;
  final List<String>? strengths;
  final List<String>? weaknesses;
  final List<String>? recommendations;
  final PracticeSession? session;

  const PracticeReport({
    required this.id,
    required this.sessionId,
    required this.studentId,
    required this.totalQuestions,
    required this.correctQuestions,
    required this.totalTime,
    required this.overallScore,
    required this.accuracyRate,
    this.currentAbility,
    this.abilityLevel,
    this.percentile,
    this.confidence,
    this.knowledgeScores,
    this.questionDistribution,
    this.abilityBreakdown,
    this.learningSpeed,
    this.consistency,
    this.strengths,
    this.weaknesses,
    this.recommendations,
    this.session,
  });

  factory PracticeReport.fromJson(Map<String, dynamic> json) => _$PracticeReportFromJson(json);

  Map<String, dynamic> toJson() => _$PracticeReportToJson(this);
}

@JsonSerializable()
class AbilityAssessment {
  @JsonKey(name: 'overall_score')
  final int overallScore;
  @JsonKey(name: 'ability_level')
  final String abilityLevel;
  final int percentile;
  final int confidence;
  @JsonKey(name: 'subject_scores')
  final Map<String, int> subjectScores;
  @JsonKey(name: 'knowledge_mastery')
  final Map<String, dynamic> knowledgeMastery;
  @JsonKey(name: 'learning_trends')
  final dynamic learningTrends;
  @JsonKey(name: 'next_step_recommendations')
  final List<String> nextStepRecommendations;

  const AbilityAssessment({
    required this.overallScore,
    required this.abilityLevel,
    required this.percentile,
    required this.confidence,
    required this.subjectScores,
    required this.knowledgeMastery,
    required this.learningTrends,
    required this.nextStepRecommendations,
  });

  factory AbilityAssessment.fromJson(Map<String, dynamic> json) => _$AbilityAssessmentFromJson(json);

  Map<String, dynamic> toJson() => _$AbilityAssessmentToJson(this);
}

@JsonSerializable()
class LearningStatistics {
  @JsonKey(name: 'student_id')
  final String studentId;
  final String period;
  @JsonKey(name: 'total_practices')
  final int totalPractices;
  @JsonKey(name: 'total_questions')
  final int totalQuestions;
  @JsonKey(name: 'total_time')
  final int totalTime;
  @JsonKey(name: 'average_accuracy')
  final int averageAccuracy;
  @JsonKey(name: 'average_time_per_question')
  final int averageTimePerQuestion;
  @JsonKey(name: 'practice_type_stats')
  final Map<String, dynamic> practiceTypeStats;
  @JsonKey(name: 'knowledge_mastery')
  final Map<String, dynamic> knowledgeMastery;
  @JsonKey(name: 'daily_progress')
  final List<dynamic> dailyProgress;
  @JsonKey(name: 'weak_areas')
  final List<dynamic> weakAreas;

  const LearningStatistics({
    required this.studentId,
    required this.period,
    required this.totalPractices,
    required this.totalQuestions,
    required this.totalTime,
    required this.averageAccuracy,
    required this.averageTimePerQuestion,
    required this.practiceTypeStats,
    required this.knowledgeMastery,
    required this.dailyProgress,
    required this.weakAreas,
  });

  factory LearningStatistics.fromJson(Map<String, dynamic> json) => _$LearningStatisticsFromJson(json);

  Map<String, dynamic> toJson() => _$LearningStatisticsToJson(this);
}

@JsonSerializable()
class StudentStatistics {
  @JsonKey(name: 'total_practices')
  final int totalPractices;
  @JsonKey(name: 'total_questions')
  final int totalQuestions;
  @JsonKey(name: 'correct_rate')
  final int correctRate;
  @JsonKey(name: 'average_time')
  final int averageTime;
  @JsonKey(name: 'strength_knowledges')
  final List<String> strengthKnowledges;
  @JsonKey(name: 'weak_knowledges')
  final List<String> weakKnowledges;

  const StudentStatistics({
    required this.totalPractices,
    required this.totalQuestions,
    required this.correctRate,
    required this.averageTime,
    required this.strengthKnowledges,
    required this.weakKnowledges,
  });

  factory StudentStatistics.fromJson(Map<String, dynamic> json) => _$StudentStatisticsFromJson(json);

  Map<String, dynamic> toJson() => _$StudentStatisticsToJson(this);
}

@JsonSerializable()
class Admin extends BaseEntity {
  final String id;
  final String username;
  final String? password;
  final int type;
  final Status status;
  final String? name;
  final String? email;
  final String? phone;

  const Admin({
    required this.id,
    required this.username,
    this.password,
    required this.type,
    required this.status,
    this.name,
    this.email,
    this.phone,
  });

  factory Admin.fromJson(Map<String, dynamic> json) => _$AdminFromJson(json);

  Map<String, dynamic> toJson() => _$AdminToJson(this);
}

@JsonSerializable()
class LoginRequest {
  final String username;
  final String password;

  const LoginRequest({
    required this.username,
    required this.password,
  });

  factory LoginRequest.fromJson(Map<String, dynamic> json) => _$LoginRequestFromJson(json);

  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
}

@JsonSerializable()
class LoginResponse {
  final String token;
  final Admin user;

  const LoginResponse({
    required this.token,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) => _$LoginResponseFromJson(json);

  Map<String, dynamic> toJson() => _$LoginResponseToJson(this);
}

@JsonSerializable()
class Student extends BaseEntity {
  final String id;
  final String name;
  final String phone;
  final Grade grade;
  final Status status;
  final String? avatar;
  @JsonKey(name: 'parent_phone')
  final String? parentPhone;
  final String? address;

  const Student({
    required this.id,
    required this.name,
    required this.phone,
    required this.grade,
    required this.status,
    this.avatar,
    this.parentPhone,
    this.address,
  });

  factory Student.fromJson(Map<String, dynamic> json) => _$StudentFromJson(json);

  Map<String, dynamic> toJson() => _$StudentToJson(this);
}

@JsonSerializable()
class StudentLoginRequest {
  final String phone;
  final String password;

  const StudentLoginRequest({
    required this.phone,
    required this.password,
  });

  factory StudentLoginRequest.fromJson(Map<String, dynamic> json) => _$StudentLoginRequestFromJson(json);

  Map<String, dynamic> toJson() => _$StudentLoginRequestToJson(this);
}

@JsonSerializable()
class StudentLoginResponse {
  final String token;
  final Student student;

  const StudentLoginResponse({
    required this.token,
    required this.student,
  });

  factory StudentLoginResponse.fromJson(Map<String, dynamic> json) => _$StudentLoginResponseFromJson(json);

  Map<String, dynamic> toJson() => _$StudentLoginResponseToJson(this);
}

@JsonSerializable()
class StudentProfile {
  final Student student;
  final List<Textbook> textbooks;
  @JsonKey(name: 'recent_practices')
  final List<PracticeSession> recentPractices;
  final StudentStatistics statistics;

  const StudentProfile({
    required this.student,
    required this.textbooks,
    required this.recentPractices,
    required this.statistics,
  });

  factory StudentProfile.fromJson(Map<String, dynamic> json) => _$StudentProfileFromJson(json);

  Map<String, dynamic> toJson() => _$StudentProfileToJson(this);
}

@JsonSerializable()
class StudentStatistics {
  @JsonKey(name: 'total_practices')
  final int totalPractices;
  @JsonKey(name: 'total_questions')
  final int totalQuestions;
  @JsonKey(name: 'correct_rate')
  final int correctRate;
  @JsonKey(name: 'average_time')
  final int averageTime;
  @JsonKey(name: 'strength_knowledges')
  final List<String> strengthKnowledges;
  @JsonKey(name: 'weak_knowledges')
  final List<String> weakKnowledges;

  const StudentStatistics({
    required this.totalPractices,
    required this.totalQuestions,
    required this.correctRate,
    required this.averageTime,
    required this.strengthKnowledges,
    required this.weakKnowledges,
  });

  factory StudentStatistics.fromJson(Map<String, dynamic> json) => _$StudentStatisticsFromJson(json);

  Map<String, dynamic> toJson() => _$StudentStatisticsToJson(this);
}

@JsonSerializable()
class MediaFile extends BaseEntity {
  final String id;
  final String filename;
  @JsonKey(name: 'original_name')
  final String originalName;
  @JsonKey(name: 'file_type')
  final ResourceType fileType;
  @JsonKey(name: 'mime_type')
  final String mimeType;
  @JsonKey(name: 'file_size')
  final int fileSize;
  @JsonKey(name: 'file_path')
  final String filePath;
  @JsonKey(name: 'oss_path')
  final String? ossPath;
  final String? url;
  final int? duration;
  final int? width;
  final int? height;
  final String? description;
  final List<String>? tags;
  @JsonKey(name: 'uploaded_by')
  final String uploadedBy;
  @JsonKey(name: 'is_public')
  final bool isPublic;

  const MediaFile({
    required this.id,
    required this.filename,
    required this.originalName,
    required this.fileType,
    required this.mimeType,
    required this.fileSize,
    required this.filePath,
    this.ossPath,
    this.url,
    this.duration,
    this.width,
    this.height,
    this.description,
    this.tags,
    required this.uploadedBy,
    required this.isPublic,
  });

  factory MediaFile.fromJson(Map<String, dynamic> json) => _$MediaFileFromJson(json);

  Map<String, dynamic> toJson() => _$MediaFileToJson(this);
}

@JsonSerializable()
class AudioTranscription {
  final String id;
  @JsonKey(name: 'original_path')
  final String originalPath;
  final String transcription;
  final int confidence;
  final String language;
  final int duration;
  @JsonKey(name: 'processed_at')
  final int processedAt;

  const AudioTranscription({
    required this.id,
    required this.originalPath,
    required this.transcription,
    required this.confidence,
    required this.language,
    required this.duration,
    required this.processedAt,
  });

  factory AudioTranscription.fromJson(Map<String, dynamic> json) => _$AudioTranscriptionFromJson(json);

  Map<String, dynamic> toJson() => _$AudioTranscriptionToJson(this);
}

@JsonSerializable()
class AudioMatchAnalysis {
  final bool match;
  final int score;
  final String reason;
  final String? suggestion;
  @JsonKey(name: 'keywords_matched')
  final List<String> keywordsMatched;
  @JsonKey(name: 'keywords_missing')
  final List<String> keywordsMissing;
  @JsonKey(name: 'fluency_score')
  final int? fluencyScore;
  @JsonKey(name: 'pronunciation_score')
  final int? pronunciationScore;

  const AudioMatchAnalysis({
    required this.match,
    required this.score,
    required this.reason,
    this.suggestion,
    required this.keywordsMatched,
    required this.keywordsMissing,
    this.fluencyScore,
    this.pronunciationScore,
  });

  factory AudioMatchAnalysis.fromJson(Map<String, dynamic> json) => _$AudioMatchAnalysisFromJson(json);

  Map<String, dynamic> toJson() => _$AudioMatchAnalysisToJson(this);
}

@JsonSerializable()
class AudioUploadResult {
  final bool success;
  @JsonKey(name: 'file_id')
  final String? fileId;
  @JsonKey(name: 'oss_path')
  final String? ossPath;
  final String? url;
  @JsonKey(name: 'file_size')
  final int? fileSize;
  final int? duration;
  final String? error;

  const AudioUploadResult({
    required this.success,
    this.fileId,
    this.ossPath,
    this.url,
    this.fileSize,
    this.duration,
    this.error,
  });

  factory AudioUploadResult.fromJson(Map<String, dynamic> json) => _$AudioUploadResultFromJson(json);

  Map<String, dynamic> toJson() => _$AudioUploadResultToJson(this);
}

@JsonSerializable()
class ImageGenerationRequest {
  final String prompt;
  final String? style;
  final int? width;
  final int? height;
  final String? quality;
  @JsonKey(name: 'question_id')
  final int? questionId;
  final String? subject;
  final int? grade;

  const ImageGenerationRequest({
    required this.prompt,
    this.style,
    this.width,
    this.height,
    this.quality,
    this.questionId,
    this.subject,
    this.grade,
  });

  factory ImageGenerationRequest.fromJson(Map<String, dynamic> json) => _$ImageGenerationRequestFromJson(json);

  Map<String, dynamic> toJson() => _$ImageGenerationRequestToJson(this);
}

@JsonSerializable()
class ImageGenerationResult {
  final bool success;
  @JsonKey(name: 'image_id')
  final String? imageId;
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  @JsonKey(name: 'oss_path')
  final String? ossPath;
  final int? width;
  final int? height;
  @JsonKey(name: 'file_size')
  final int? fileSize;
  @JsonKey(name: 'generation_time')
  final int? generationTime;
  final String? error;

  const ImageGenerationResult({
    required this.success,
    this.imageId,
    this.imageUrl,
    this.ossPath,
    this.width,
    this.height,
    this.fileSize,
    this.generationTime,
    this.error,
  });

  factory ImageGenerationResult.fromJson(Map<String, dynamic> json) => _$ImageGenerationResultFromJson(json);

  Map<String, dynamic> toJson() => _$ImageGenerationResultToJson(this);
}

