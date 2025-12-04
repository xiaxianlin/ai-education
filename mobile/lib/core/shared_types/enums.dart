/// Auto-generated Dart enums from TypeScript types.
/// Generated on: 2025-12-04T11:07:34.369Z

enum Status {
  DISABLED,
  ENABLED,
}

extension StatusExtension on Status {
  String get value {
    switch (this) {
      case Status.DISABLED:
        return '0';
      case Status.ENABLED:
        return '1';
    }
  }

  static Status fromValue(String value) {
    switch (value) {
      case '0':
        return Status.DISABLED;
      case '1':
        return Status.ENABLED;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum Gender {
  MALE,
  FEMALE,
}

extension GenderExtension on Gender {
  String get value {
    switch (this) {
      case Gender.MALE:
        return '1';
      case Gender.FEMALE:
        return '2';
    }
  }

  static Gender fromValue(String value) {
    switch (value) {
      case '1':
        return Gender.MALE;
      case '2':
        return Gender.FEMALE;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum Subject {
  MATH,
  ENGLISH,
  CHINESE,
  PHYSICS,
  CHEMISTRY,
  BIOLOGY,
  HISTORY,
  GEOGRAPHY,
  POLITICS,
}

extension SubjectExtension on Subject {
  String get value {
    switch (this) {
      case Subject.MATH:
        return '数学';
      case Subject.ENGLISH:
        return '英语';
      case Subject.CHINESE:
        return '语文';
      case Subject.PHYSICS:
        return '物理';
      case Subject.CHEMISTRY:
        return '化学';
      case Subject.BIOLOGY:
        return '生物';
      case Subject.HISTORY:
        return '历史';
      case Subject.GEOGRAPHY:
        return '地理';
      case Subject.POLITICS:
        return '政治';
    }
  }

  static Subject fromValue(String value) {
    switch (value) {
      case '数学':
        return Subject.MATH;
      case '英语':
        return Subject.ENGLISH;
      case '语文':
        return Subject.CHINESE;
      case '物理':
        return Subject.PHYSICS;
      case '化学':
        return Subject.CHEMISTRY;
      case '生物':
        return Subject.BIOLOGY;
      case '历史':
        return Subject.HISTORY;
      case '地理':
        return Subject.GEOGRAPHY;
      case '政治':
        return Subject.POLITICS;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum Grade {
  GRADE_1,
  GRADE_2,
  GRADE_3,
  GRADE_4,
  GRADE_5,
  GRADE_6,
  GRADE_7,
  GRADE_8,
  GRADE_9,
  GRADE_10,
  GRADE_11,
  GRADE_12,
}

extension GradeExtension on Grade {
  String get value {
    switch (this) {
      case Grade.GRADE_1:
        return '1';
      case Grade.GRADE_2:
        return '2';
      case Grade.GRADE_3:
        return '3';
      case Grade.GRADE_4:
        return '4';
      case Grade.GRADE_5:
        return '5';
      case Grade.GRADE_6:
        return '6';
      case Grade.GRADE_7:
        return '7';
      case Grade.GRADE_8:
        return '8';
      case Grade.GRADE_9:
        return '9';
      case Grade.GRADE_10:
        return '10';
      case Grade.GRADE_11:
        return '11';
      case Grade.GRADE_12:
        return '12';
    }
  }

  static Grade fromValue(String value) {
    switch (value) {
      case '1':
        return Grade.GRADE_1;
      case '2':
        return Grade.GRADE_2;
      case '3':
        return Grade.GRADE_3;
      case '4':
        return Grade.GRADE_4;
      case '5':
        return Grade.GRADE_5;
      case '6':
        return Grade.GRADE_6;
      case '7':
        return Grade.GRADE_7;
      case '8':
        return Grade.GRADE_8;
      case '9':
        return Grade.GRADE_9;
      case '10':
        return Grade.GRADE_10;
      case '11':
        return Grade.GRADE_11;
      case '12':
        return Grade.GRADE_12;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum Semester {
  FIRST,
  SECOND,
  FULL,
}

extension SemesterExtension on Semester {
  String get value {
    switch (this) {
      case Semester.FIRST:
        return '上学期';
      case Semester.SECOND:
        return '下学期';
      case Semester.FULL:
        return '整学期';
    }
  }

  static Semester fromValue(String value) {
    switch (value) {
      case '上学期':
        return Semester.FIRST;
      case '下学期':
        return Semester.SECOND;
      case '整学期':
        return Semester.FULL;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum QuestionType {
  MULTIPLE_CHOICE,
  TRUE_FALSE,
  FILL_BLANK,
  SHORT_ANSWER,
  ESSAY,
  CALCULATION,
  READING,
  LISTENING,
  SPEAKING,
}

extension QuestionTypeExtension on QuestionType {
  String get value {
    switch (this) {
      case QuestionType.MULTIPLE_CHOICE:
        return '选择题';
      case QuestionType.TRUE_FALSE:
        return '判断题';
      case QuestionType.FILL_BLANK:
        return '填空题';
      case QuestionType.SHORT_ANSWER:
        return '简答题';
      case QuestionType.ESSAY:
        return '论述题';
      case QuestionType.CALCULATION:
        return '计算题';
      case QuestionType.READING:
        return '阅读理解';
      case QuestionType.LISTENING:
        return '听力题';
      case QuestionType.SPEAKING:
        return '口语题';
    }
  }

  static QuestionType fromValue(String value) {
    switch (value) {
      case '选择题':
        return QuestionType.MULTIPLE_CHOICE;
      case '判断题':
        return QuestionType.TRUE_FALSE;
      case '填空题':
        return QuestionType.FILL_BLANK;
      case '简答题':
        return QuestionType.SHORT_ANSWER;
      case '论述题':
        return QuestionType.ESSAY;
      case '计算题':
        return QuestionType.CALCULATION;
      case '阅读理解':
        return QuestionType.READING;
      case '听力题':
        return QuestionType.LISTENING;
      case '口语题':
        return QuestionType.SPEAKING;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum Difficulty {
  EASY,
  MEDIUM,
  HARD,
}

extension DifficultyExtension on Difficulty {
  String get value {
    switch (this) {
      case Difficulty.EASY:
        return '简单';
      case Difficulty.MEDIUM:
        return '普通';
      case Difficulty.HARD:
        return '困难';
    }
  }

  static Difficulty fromValue(String value) {
    switch (value) {
      case '简单':
        return Difficulty.EASY;
      case '普通':
        return Difficulty.MEDIUM;
      case '困难':
        return Difficulty.HARD;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum ResourceType {
  IMAGE,
  AUDIO,
  VIDEO,
  DOCUMENT,
}

extension ResourceTypeExtension on ResourceType {
  String get value {
    switch (this) {
      case ResourceType.IMAGE:
        return 'image';
      case ResourceType.AUDIO:
        return 'audio';
      case ResourceType.VIDEO:
        return 'video';
      case ResourceType.DOCUMENT:
        return 'document';
    }
  }

  static ResourceType fromValue(String value) {
    switch (value) {
      case 'image':
        return ResourceType.IMAGE;
      case 'audio':
        return ResourceType.AUDIO;
      case 'video':
        return ResourceType.VIDEO;
      case 'document':
        return ResourceType.DOCUMENT;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum PracticeType {
  DAILY,
  UNIT,
  ASSESSMENT,
}

extension PracticeTypeExtension on PracticeType {
  String get value {
    switch (this) {
      case PracticeType.DAILY:
        return 'daily_practice';
      case PracticeType.UNIT:
        return 'unit_practice';
      case PracticeType.ASSESSMENT:
        return 'assessment';
    }
  }

  static PracticeType fromValue(String value) {
    switch (value) {
      case 'daily_practice':
        return PracticeType.DAILY;
      case 'unit_practice':
        return PracticeType.UNIT;
      case 'assessment':
        return PracticeType.ASSESSMENT;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum PracticeSessionStatus {
  NOT_STARTED,
  IN_PROGRESS,
  COMPLETED,
}

extension PracticeSessionStatusExtension on PracticeSessionStatus {
  String get value {
    switch (this) {
      case PracticeSessionStatus.NOT_STARTED:
        return '0';
      case PracticeSessionStatus.IN_PROGRESS:
        return '1';
      case PracticeSessionStatus.COMPLETED:
        return '2';
    }
  }

  static PracticeSessionStatus fromValue(String value) {
    switch (value) {
      case '0':
        return PracticeSessionStatus.NOT_STARTED;
      case '1':
        return PracticeSessionStatus.IN_PROGRESS;
      case '2':
        return PracticeSessionStatus.COMPLETED;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum PracticeGenerateStatus {
  FAILED,
  GENERATING,
  SUCCESS,
}

extension PracticeGenerateStatusExtension on PracticeGenerateStatus {
  String get value {
    switch (this) {
      case PracticeGenerateStatus.FAILED:
        return 'Unknown';
      case PracticeGenerateStatus.GENERATING:
        return '0';
      case PracticeGenerateStatus.SUCCESS:
        return '1';
    }
  }

  static PracticeGenerateStatus fromValue(String value) {
    switch (value) {
      case 'Unknown':
        return PracticeGenerateStatus.FAILED;
      case '0':
        return PracticeGenerateStatus.GENERATING;
      case '1':
        return PracticeGenerateStatus.SUCCESS;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

enum AnswerStatus {
  UNANSWERED,
  CORRECT,
  INCORRECT,
}

extension AnswerStatusExtension on AnswerStatus {
  String get value {
    switch (this) {
      case AnswerStatus.UNANSWERED:
        return '0';
      case AnswerStatus.CORRECT:
        return '1';
      case AnswerStatus.INCORRECT:
        return '2';
    }
  }

  static AnswerStatus fromValue(String value) {
    switch (value) {
      case '0':
        return AnswerStatus.UNANSWERED;
      case '1':
        return AnswerStatus.CORRECT;
      case '2':
        return AnswerStatus.INCORRECT;
      default:
        throw ArgumentError('Unknown enum value: $value');
    }
  }
}

