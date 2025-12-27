// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'question_v2.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AnswerV2 _$AnswerV2FromJson(Map<String, dynamic> json) => AnswerV2(
  type: json['type'] as String? ?? 'exact',
  correctAnswers: (json['correct_answers'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  acceptAnswers: (json['accept_answers'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  scoring: json['scoring'] as Map<String, dynamic>?,
  rubric: json['rubric'] as Map<String, dynamic>?,
);

Map<String, dynamic> _$AnswerV2ToJson(AnswerV2 instance) => <String, dynamic>{
  'type': instance.type,
  'correct_answers': instance.correctAnswers,
  'accept_answers': instance.acceptAnswers,
  'scoring': instance.scoring,
  'rubric': instance.rubric,
};

QuestionOptionV2 _$QuestionOptionV2FromJson(Map<String, dynamic> json) =>
    QuestionOptionV2(
      id: json['id'] as String,
      text: json['text'] as String?,
      imageUrl: json['image_url'] as String?,
      audioUrl: json['audio_url'] as String?,
      isCorrect: json['is_correct'] as bool? ?? false,
      feedback: json['feedback'] as String?,
    );

Map<String, dynamic> _$QuestionOptionV2ToJson(QuestionOptionV2 instance) =>
    <String, dynamic>{
      'id': instance.id,
      'text': instance.text,
      'image_url': instance.imageUrl,
      'audio_url': instance.audioUrl,
      'is_correct': instance.isCorrect,
      'feedback': instance.feedback,
    };

QuestionResourceV2 _$QuestionResourceV2FromJson(Map<String, dynamic> json) =>
    QuestionResourceV2(
      id: json['id'] as String,
      type: json['type'] as String,
      url: json['url'] as String,
      alt: json['alt'] as String?,
      position: json['position'] as String? ?? 'stem',
      size: (json['size'] as Map<String, dynamic>?)?.map(
        (k, e) => MapEntry(k, (e as num).toInt()),
      ),
      style: json['style'] as Map<String, dynamic>?,
      duration: (json['duration'] as num?)?.toInt(),
      transcript: json['transcript'] as String?,
    );

Map<String, dynamic> _$QuestionResourceV2ToJson(QuestionResourceV2 instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'url': instance.url,
      'alt': instance.alt,
      'position': instance.position,
      'size': instance.size,
      'style': instance.style,
      'duration': instance.duration,
      'transcript': instance.transcript,
    };

SubStem _$SubStemFromJson(Map<String, dynamic> json) => SubStem(
  text: json['text'] as String,
  richText: json['rich_text'] as String?,
  hints: (json['hints'] as List<dynamic>?)?.map((e) => e as String).toList(),
);

Map<String, dynamic> _$SubStemToJson(SubStem instance) => <String, dynamic>{
  'text': instance.text,
  'rich_text': instance.richText,
  'hints': instance.hints,
};

SubQuestion _$SubQuestionFromJson(Map<String, dynamic> json) => SubQuestion(
  id: json['id'] as String,
  order: (json['order'] as num).toInt(),
  stem: SubStem.fromJson(json['stem'] as Map<String, dynamic>),
  interactionType: json['interaction_type'] as String,
  interactionConfig: json['interaction_config'] as Map<String, dynamic>?,
  options: (json['options'] as List<dynamic>?)
      ?.map((e) => QuestionOptionV2.fromJson(e as Map<String, dynamic>))
      .toList(),
  resources: (json['resources'] as List<dynamic>?)
      ?.map((e) => QuestionResourceV2.fromJson(e as Map<String, dynamic>))
      .toList(),
  answer: AnswerV2.fromJson(json['answer'] as Map<String, dynamic>),
  explanation: json['explanation'] as String?,
);

Map<String, dynamic> _$SubQuestionToJson(SubQuestion instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order': instance.order,
      'stem': instance.stem,
      'interaction_type': instance.interactionType,
      'interaction_config': instance.interactionConfig,
      'options': instance.options,
      'resources': instance.resources,
      'answer': instance.answer,
      'explanation': instance.explanation,
    };

StemV2 _$StemV2FromJson(Map<String, dynamic> json) => StemV2(
  text: json['text'] as String,
  richText: json['rich_text'] as String?,
  audioUrl: json['audio_url'] as String?,
  highlightWords: (json['highlight_words'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  hints: (json['hints'] as List<dynamic>?)?.map((e) => e as String).toList(),
  subQuestions: (json['sub_questions'] as List<dynamic>?)
      ?.map((e) => SubQuestion.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StemV2ToJson(StemV2 instance) => <String, dynamic>{
  'text': instance.text,
  'rich_text': instance.richText,
  'audio_url': instance.audioUrl,
  'highlight_words': instance.highlightWords,
  'hints': instance.hints,
  'sub_questions': instance.subQuestions,
};

FeedbackItem _$FeedbackItemFromJson(Map<String, dynamic> json) => FeedbackItem(
  sound: json['sound'] as String?,
  animation: json['animation'] as String?,
  messages: (json['messages'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  points: (json['points'] as num?)?.toInt(),
  showHint: json['show_hint'] as bool?,
  maxAttempts: (json['max_attempts'] as num?)?.toInt(),
);

Map<String, dynamic> _$FeedbackItemToJson(FeedbackItem instance) =>
    <String, dynamic>{
      'sound': instance.sound,
      'animation': instance.animation,
      'messages': instance.messages,
      'points': instance.points,
      'show_hint': instance.showHint,
      'max_attempts': instance.maxAttempts,
    };

FeedbackConfig _$FeedbackConfigFromJson(Map<String, dynamic> json) =>
    FeedbackConfig(
      correct: json['correct'] == null
          ? null
          : FeedbackItem.fromJson(json['correct'] as Map<String, dynamic>),
      incorrect: json['incorrect'] == null
          ? null
          : FeedbackItem.fromJson(json['incorrect'] as Map<String, dynamic>),
      partial: json['partial'] == null
          ? null
          : FeedbackItem.fromJson(json['partial'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$FeedbackConfigToJson(FeedbackConfig instance) =>
    <String, dynamic>{
      'correct': instance.correct,
      'incorrect': instance.incorrect,
      'partial': instance.partial,
    };

QuestionTypeV2 _$QuestionTypeV2FromJson(Map<String, dynamic> json) =>
    QuestionTypeV2(
      id: (json['id'] as num).toInt(),
      code: json['code'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      subject: json['subject'] as String,
      stages: (json['stages'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      grades: (json['grades'] as List<dynamic>)
          .map((e) => (e as num).toInt())
          .toList(),
      interactionType: json['interaction_type'] as String,
      interactionConfig: json['interaction_config'] as Map<String, dynamic>?,
      resourceType: json['resource_type'] as String? ?? 'none',
      resourceConfig: json['resource_config'] as Map<String, dynamic>?,
      answerType: json['answer_type'] as String,
      answerConfig: json['answer_config'] as Map<String, dynamic>?,
      feedbackConfig: json['feedback_config'] == null
          ? null
          : FeedbackConfig.fromJson(
              json['feedback_config'] as Map<String, dynamic>,
            ),
      cognitiveLevels: (json['cognitive_levels'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      abilityDimensions: (json['ability_dimensions'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
      isActive: json['is_active'] as bool? ?? true,
      createTime: (json['create_time'] as num).toInt(),
      updateTime: (json['update_time'] as num).toInt(),
    );

Map<String, dynamic> _$QuestionTypeV2ToJson(QuestionTypeV2 instance) =>
    <String, dynamic>{
      'id': instance.id,
      'code': instance.code,
      'name': instance.name,
      'description': instance.description,
      'subject': instance.subject,
      'stages': instance.stages,
      'grades': instance.grades,
      'interaction_type': instance.interactionType,
      'interaction_config': instance.interactionConfig,
      'resource_type': instance.resourceType,
      'resource_config': instance.resourceConfig,
      'answer_type': instance.answerType,
      'answer_config': instance.answerConfig,
      'feedback_config': instance.feedbackConfig,
      'cognitive_levels': instance.cognitiveLevels,
      'ability_dimensions': instance.abilityDimensions,
      'sort_order': instance.sortOrder,
      'is_active': instance.isActive,
      'create_time': instance.createTime,
      'update_time': instance.updateTime,
    };

QuestionV2 _$QuestionV2FromJson(Map<String, dynamic> json) => QuestionV2(
  id: json['id'] as String,
  questionTypeId: (json['question_type_id'] as num).toInt(),
  questionTypeCode: json['question_type_code'] as String,
  subject: json['subject'] as String,
  grade: (json['grade'] as num).toInt(),
  stage: json['stage'] as String,
  textbookId: (json['textbook_id'] as num?)?.toInt(),
  unitId: (json['unit_id'] as num?)?.toInt(),
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
  answer: AnswerV2.fromJson(json['answer'] as Map<String, dynamic>),
  explanation: json['explanation'] as String?,
  difficulty: json['difficulty'] as String,
  cognitiveLevel: json['cognitive_level'] as String?,
  knowledgePoints: (json['knowledge_points'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  abilityTags: (json['ability_tags'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  source: json['source'] as String? ?? 'ai',
  usageCount: (json['usage_count'] as num?)?.toInt() ?? 0,
  correctRate: json['correct_rate'] as String?,
  avgTimeSpent: (json['avg_time_spent'] as num?)?.toInt(),
  isActive: json['is_active'] as bool? ?? true,
  createTime: (json['create_time'] as num).toInt(),
  updateTime: (json['update_time'] as num).toInt(),
);

Map<String, dynamic> _$QuestionV2ToJson(QuestionV2 instance) =>
    <String, dynamic>{
      'id': instance.id,
      'question_type_id': instance.questionTypeId,
      'question_type_code': instance.questionTypeCode,
      'subject': instance.subject,
      'grade': instance.grade,
      'stage': instance.stage,
      'textbook_id': instance.textbookId,
      'unit_id': instance.unitId,
      'stem': instance.stem,
      'options': instance.options,
      'blanks': instance.blanks,
      'resources': instance.resources,
      'answer': instance.answer,
      'explanation': instance.explanation,
      'difficulty': instance.difficulty,
      'cognitive_level': instance.cognitiveLevel,
      'knowledge_points': instance.knowledgePoints,
      'ability_tags': instance.abilityTags,
      'source': instance.source,
      'usage_count': instance.usageCount,
      'correct_rate': instance.correctRate,
      'avg_time_spent': instance.avgTimeSpent,
      'is_active': instance.isActive,
      'create_time': instance.createTime,
      'update_time': instance.updateTime,
    };
