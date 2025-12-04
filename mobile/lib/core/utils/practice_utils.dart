import 'package:flutter/material.dart';
import '../constants/practice_constants.dart';

/// 练习相关工具函数
class PracticeUtils {
  PracticeUtils._();

  /// 获取练习类型名称
  static String getPracticeTypeName(String? sessionType) {
    switch (sessionType) {
      case PracticeConstants.typeDailyPractice:
        return '每日练习';
      case PracticeConstants.typeUnitPractice:
        return '单元练习';
      case PracticeConstants.typeAssessment:
        return '能力评测';
      default:
        return '练习';
    }
  }

  /// 获取会话状态文本
  static String getStatusText(int status) {
    switch (status) {
      case PracticeConstants.statusNotStarted:
        return '未开始';
      case PracticeConstants.statusInProgress:
        return '进行中';
      case PracticeConstants.statusCompleted:
        return '已完成';
      default:
        return '未知';
    }
  }

  /// 获取会话状态颜色
  static Color getStatusColor(int status) {
    switch (status) {
      case PracticeConstants.statusNotStarted:
        return Colors.grey;
      case PracticeConstants.statusInProgress:
        return Colors.blue;
      case PracticeConstants.statusCompleted:
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  /// 获取答题状态文本
  static String getAnswerStatusText(int? status) {
    switch (status) {
      case PracticeConstants.answerStatusNotAnswered:
        return '未答';
      case PracticeConstants.answerStatusCorrect:
        return '正确';
      case PracticeConstants.answerStatusWrong:
        return '错误';
      default:
        return '未答';
    }
  }

  /// 获取答题状态颜色
  static Color getAnswerStatusColor(int? status) {
    switch (status) {
      case PracticeConstants.answerStatusNotAnswered:
        return Colors.grey;
      case PracticeConstants.answerStatusCorrect:
        return Colors.green;
      case PracticeConstants.answerStatusWrong:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  /// 计算正确率（百分比）
  static int calculateAccuracy(int answerCount, int correctCount) {
    if (answerCount == 0) return 0;
    return ((correctCount / answerCount) * 100).round();
  }
}

