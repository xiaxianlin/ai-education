/**
 * QuestionDisplay 组件类型定义
 */

export interface QuestionDisplayProps {
  question: Question;
  index?: number;
  showAnswer?: boolean;
  answerStatus?: 0 | 1 | 2; // 0-未答, 1-正确, 2-错误
}
