import 'package:json_annotation/json_annotation.dart';

part 'question_v2.g.dart';

// ============ 枚举类型 ============

/// 学段枚举
enum Stage {
  @JsonValue('primary_low')
  primaryLow,
  @JsonValue('primary_high')
  primaryHigh,
  @JsonValue('junior')
  junior,
  @JsonValue('senior')
  senior,
}

/// 交互类型枚举
enum InteractionType {
  @JsonValue('single_choice')
  singleChoice,
  @JsonValue('multi_choice')
  multiChoice,
  @JsonValue('image_choice')
  imageChoice,
  @JsonValue('text_input')
  textInput,
  @JsonValue('handwriting')
  handwriting,
  @JsonValue('voice_input')
  voiceInput,
  @JsonValue('drag_drop')
  dragDrop,
  @JsonValue('connect_line')
  connectLine,
  @JsonValue('sort_order')
  sortOrder,
  @JsonValue('true_false')
  trueFalse,
  @JsonValue('correct_wrong')
  correctWrong,
  @JsonValue('follow_read')
  followRead,
  @JsonValue('free_speak')
  freeSpeak,
  @JsonValue('fill_blank')
  fillBlank,
  @JsonValue('multi_step')
  multiStep,
}

/// 认知层次枚举
enum CognitiveLevel {
  @JsonValue('remember')
  remember,
  @JsonValue('understand')
  understand,
  @JsonValue('apply')
  apply,
  @JsonValue('analyze')
  analyze,
  @JsonValue('evaluate')
  evaluate,
  @JsonValue('create')
  create,
}

/// 难度枚举
enum DifficultyV2 {
  @JsonValue('easy')
  easy,
  @JsonValue('medium')
  medium,
  @JsonValue('hard')
  hard,
}

/// 资源类型枚举
enum ResourceTypeV2 {
  @JsonValue('none')
  none,
  @JsonValue('image')
  image,
  @JsonValue('audio')
  audio,
  @JsonValue('video')
  video,
  @JsonValue('animation')
  animation,
}

/// 答案类型枚举
enum AnswerType {
  @JsonValue('exact')
  exact,
  @JsonValue('fuzzy')
  fuzzy,
  @JsonValue('rubric')
  rubric,
  @JsonValue('ai')
  ai,
  @JsonValue('composite')
  composite,
}

// ============ 基础结构 ============

/// 答案模型
@JsonSerializable()
class AnswerV2 {
  final String type;
  @JsonKey(name: 'correct_answers')
  final List<String>? correctAnswers;
  @JsonKey(name: 'accept_answers')
  final List<String>? acceptAnswers;
  final Map<String, dynamic>? scoring;
  final Map<String, dynamic>? rubric;

  const AnswerV2({
    this.type = 'exact',
    this.correctAnswers,
    this.acceptAnswers,
    this.scoring,
    this.rubric,
  });

  factory AnswerV2.fromJson(Map<String, dynamic> json) =>
      _$AnswerV2FromJson(json);

  Map<String, dynamic> toJson() => _$AnswerV2ToJson(this);
}

/// 选项模型
@JsonSerializable()
class QuestionOptionV2 {
  final String id;
  final String? text;
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  @JsonKey(name: 'audio_url')
  final String? audioUrl;
  @JsonKey(name: 'is_correct')
  final bool isCorrect;
  final String? feedback;

  const QuestionOptionV2({
    required this.id,
    this.text,
    this.imageUrl,
    this.audioUrl,
    this.isCorrect = false,
    this.feedback,
  });

  factory QuestionOptionV2.fromJson(Map<String, dynamic> json) =>
      _$QuestionOptionV2FromJson(json);

  Map<String, dynamic> toJson() => _$QuestionOptionV2ToJson(this);
}

/// 资源模型
@JsonSerializable()
class QuestionResourceV2 {
  final String id;
  final String type;
  final String url;
  final String? alt;
  final String position;
  final Map<String, int>? size;
  final Map<String, dynamic>? style;
  final int? duration;
  final String? transcript;

  const QuestionResourceV2({
    required this.id,
    required this.type,
    required this.url,
    this.alt,
    this.position = 'stem',
    this.size,
    this.style,
    this.duration,
    this.transcript,
  });

  factory QuestionResourceV2.fromJson(Map<String, dynamic> json) =>
      _$QuestionResourceV2FromJson(json);

  Map<String, dynamic> toJson() => _$QuestionResourceV2ToJson(this);
}

/// 子题题干模型（简化版）
@JsonSerializable()
class SubStem {
  final String text;
  @JsonKey(name: 'rich_text')
  final String? richText;
  final List<String>? hints;

  const SubStem({
    required this.text,
    this.richText,
    this.hints,
  });

  factory SubStem.fromJson(Map<String, dynamic> json) =>
      _$SubStemFromJson(json);

  Map<String, dynamic> toJson() => _$SubStemToJson(this);
}

/// 子题模型 - 用于复合题/应用题
@JsonSerializable()
class SubQuestion {
  final String id;
  final int order;
  final SubStem stem;
  @JsonKey(name: 'interaction_type')
  final String interactionType;
  @JsonKey(name: 'interaction_config')
  final Map<String, dynamic>? interactionConfig;
  final List<QuestionOptionV2>? options;
  final List<QuestionResourceV2>? resources;
  final AnswerV2 answer;
  final String? explanation;

  const SubQuestion({
    required this.id,
    required this.order,
    required this.stem,
    required this.interactionType,
    this.interactionConfig,
    this.options,
    this.resources,
    required this.answer,
    this.explanation,
  });

  factory SubQuestion.fromJson(Map<String, dynamic> json) =>
      _$SubQuestionFromJson(json);

  Map<String, dynamic> toJson() => _$SubQuestionToJson(this);
}

/// 题干模型
@JsonSerializable()
class StemV2 {
  final String text;
  @JsonKey(name: 'rich_text')
  final String? richText;
  @JsonKey(name: 'audio_url')
  final String? audioUrl;
  @JsonKey(name: 'highlight_words')
  final List<String>? highlightWords;
  final List<String>? hints;
  @JsonKey(name: 'sub_questions')
  final List<SubQuestion>? subQuestions;

  const StemV2({
    required this.text,
    this.richText,
    this.audioUrl,
    this.highlightWords,
    this.hints,
    this.subQuestions,
  });

  factory StemV2.fromJson(Map<String, dynamic> json) => _$StemV2FromJson(json);

  Map<String, dynamic> toJson() => _$StemV2ToJson(this);
}

/// 反馈项
@JsonSerializable()
class FeedbackItem {
  final String? sound;
  final String? animation;
  final List<String>? messages;
  final int? points;
  @JsonKey(name: 'show_hint')
  final bool? showHint;
  @JsonKey(name: 'max_attempts')
  final int? maxAttempts;

  const FeedbackItem({
    this.sound,
    this.animation,
    this.messages,
    this.points,
    this.showHint,
    this.maxAttempts,
  });

  factory FeedbackItem.fromJson(Map<String, dynamic> json) =>
      _$FeedbackItemFromJson(json);

  Map<String, dynamic> toJson() => _$FeedbackItemToJson(this);
}

/// 反馈配置
@JsonSerializable()
class FeedbackConfig {
  final FeedbackItem? correct;
  final FeedbackItem? incorrect;
  final FeedbackItem? partial;

  const FeedbackConfig({
    this.correct,
    this.incorrect,
    this.partial,
  });

  factory FeedbackConfig.fromJson(Map<String, dynamic> json) =>
      _$FeedbackConfigFromJson(json);

  Map<String, dynamic> toJson() => _$FeedbackConfigToJson(this);
}

// ============ 题型 ============

/// 题型配置模型 V2
@JsonSerializable()
class QuestionTypeV2 {
  final int id;
  final String code;
  final String name;
  final String? description;
  final String subject;
  final List<String> stages;
  final List<int> grades;
  @JsonKey(name: 'interaction_type')
  final String interactionType;
  @JsonKey(name: 'interaction_config')
  final Map<String, dynamic>? interactionConfig;
  @JsonKey(name: 'resource_type')
  final String resourceType;
  @JsonKey(name: 'resource_config')
  final Map<String, dynamic>? resourceConfig;
  @JsonKey(name: 'answer_type')
  final String answerType;
  @JsonKey(name: 'answer_config')
  final Map<String, dynamic>? answerConfig;
  @JsonKey(name: 'feedback_config')
  final FeedbackConfig? feedbackConfig;
  @JsonKey(name: 'cognitive_levels')
  final List<String>? cognitiveLevels;
  @JsonKey(name: 'ability_dimensions')
  final List<String>? abilityDimensions;
  @JsonKey(name: 'sort_order')
  final int sortOrder;
  @JsonKey(name: 'is_active')
  final bool isActive;
  @JsonKey(name: 'create_time')
  final int createTime;
  @JsonKey(name: 'update_time')
  final int updateTime;

  const QuestionTypeV2({
    required this.id,
    required this.code,
    required this.name,
    this.description,
    required this.subject,
    required this.stages,
    required this.grades,
    required this.interactionType,
    this.interactionConfig,
    this.resourceType = 'text',
    this.resourceConfig,
    required this.answerType,
    this.answerConfig,
    this.feedbackConfig,
    this.cognitiveLevels,
    this.abilityDimensions,
    this.sortOrder = 0,
    this.isActive = true,
    required this.createTime,
    required this.updateTime,
  });

  factory QuestionTypeV2.fromJson(Map<String, dynamic> json) =>
      _$QuestionTypeV2FromJson(json);

  Map<String, dynamic> toJson() => _$QuestionTypeV2ToJson(this);
}

// ============ 题目 ============

/// 题目模型 V2
@JsonSerializable()
class QuestionV2 {
  final String id;
  @JsonKey(name: 'question_type_id')
  final int questionTypeId;
  @JsonKey(name: 'question_type_code')
  final String questionTypeCode;
  final String subject;
  final int grade;
  final String stage;
  final StemV2 stem;
  final List<QuestionOptionV2>? options;
  final List<Map<String, dynamic>>? blanks;
  final List<QuestionResourceV2>? resources;
  final AnswerV2 answer;
  final String? explanation;
  final String difficulty;
  @JsonKey(name: 'cognitive_level')
  final String? cognitiveLevel;
  @JsonKey(name: 'knowledge_points')
  final List<String>? knowledgePoints;
  @JsonKey(name: 'ability_tags')
  final List<String>? abilityTags;
  final String source;
  @JsonKey(name: 'usage_count')
  final int usageCount;
  @JsonKey(name: 'correct_rate')
  final String? correctRate;
  @JsonKey(name: 'avg_time_spent')
  final int? avgTimeSpent;
  @JsonKey(name: 'is_active')
  final bool isActive;
  @JsonKey(name: 'create_time')
  final int createTime;
  @JsonKey(name: 'update_time')
  final int updateTime;

  const QuestionV2({
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
    required this.answer,
    this.explanation,
    required this.difficulty,
    this.cognitiveLevel,
    this.knowledgePoints,
    this.abilityTags,
    this.source = 'ai',
    this.usageCount = 0,
    this.correctRate,
    this.avgTimeSpent,
    this.isActive = true,
    required this.createTime,
    required this.updateTime,
  });

  factory QuestionV2.fromJson(Map<String, dynamic> json) =>
      _$QuestionV2FromJson(json);

  Map<String, dynamic> toJson() => _$QuestionV2ToJson(this);

  /// 判断是否为复合题
  bool get isComposite => (stem.subQuestions?.length ?? 0) > 0;

  /// 获取题目总分
  int get totalScore {
    if (isComposite) {
      return stem.subQuestions?.fold<int>(
            0,
            (sum, sub) => sum + ((sub.answer.scoring?['full_score'] as int?) ?? 0),
          ) ??
          0;
    }
    return (answer.scoring?['full_score'] as int?) ?? 10;
  }
}

// ============ 常量映射 ============

/// 学段与年级映射
const Map<String, List<int>> stageGrades = {
  'primary_low': [1, 2, 3],
  'primary_high': [4, 5, 6],
  'junior': [7, 8, 9],
  'senior': [10, 11, 12],
};

/// 根据年级获取学段
String gradeToStage(int grade) {
  if (grade <= 3) return 'primary_low';
  if (grade <= 6) return 'primary_high';
  if (grade <= 9) return 'junior';
  return 'senior';
}

/// 学段标签
const Map<String, String> stageLabels = {
  'primary_low': '小学低段',
  'primary_high': '小学高段',
  'junior': '初中',
  'senior': '高中',
};

/// 难度标签
const Map<String, String> difficultyLabels = {
  'easy': '简单',
  'medium': '中等',
  'hard': '困难',
};

/// 认知层次标签
const Map<String, String> cognitiveLevelLabels = {
  'remember': '识记',
  'understand': '理解',
  'apply': '应用',
  'analyze': '分析',
  'evaluate': '评价',
  'create': '创造',
};

/// 交互类型标签
const Map<String, String> interactionTypeLabels = {
  'single_choice': '单选题',
  'multi_choice': '多选题',
  'image_choice': '图片选择',
  'text_input': '文本输入',
  'handwriting': '手写输入',
  'voice_input': '语音输入',
  'drag_drop': '拖拽放置',
  'connect_line': '连线匹配',
  'sort_order': '排序排列',
  'true_false': '是非判断',
  'correct_wrong': '对错判断',
  'follow_read': '跟读',
  'free_speak': '自由表达',
  'fill_blank': '填空',
  'multi_step': '多步骤',
};

