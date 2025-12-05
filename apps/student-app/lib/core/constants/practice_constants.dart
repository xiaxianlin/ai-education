/// 练习相关常量
class PracticeConstants {
  PracticeConstants._();

  /// 练习类型
  static const String typeDailyPractice = 'daily_practice';
  static const String typeUnitPractice = 'unit_practice';
  static const String typeAssessment = 'assessment';

  /// 练习会话状态
  /// 0: 未开始
  /// 1: 进行中
  /// 2: 已完成
  static const int statusNotStarted = 0;
  static const int statusInProgress = 1;
  static const int statusCompleted = 2;

  /// 练习生成状态
  /// -1: 生成失败
  /// 0: 生成中
  /// 1: 生成成功
  static const int generateStatusFailed = -1;
  static const int generateStatusGenerating = 0;
  static const int generateStatusSuccess = 1;

  /// 答题状态
  /// 0: 未答
  /// 1: 正确
  /// 2: 错误
  static const int answerStatusNotAnswered = 0;
  static const int answerStatusCorrect = 1;
  static const int answerStatusWrong = 2;
}

