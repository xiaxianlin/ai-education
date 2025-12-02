/**
 * AnswerInput 组件类型定义
 */

export interface AnswerInputProps {
  question: Question;
  value?: string;
  disabled?: boolean;
  onChange: (answer: string, audioUrl?: string) => void;
}
