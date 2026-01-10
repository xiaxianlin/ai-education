/**
 * QuestionCard 组件类型定义
 */

export interface QuestionCardProps {
  /** 题目数据 */
  question: Question;
  /** 答案记录 */
  answer?: PracticeAnswer;
  /** 题目序号（从 1 开始） */
  order?: number;
  /** 是否禁用交互（已提交/已完成） */
  disabled?: boolean;
  /** 是否正在提交 */
  submitting?: boolean;
  /** 答案变更回调 */
  onAnswerChange?: (answer: PracticeAnswer) => void;
  /** 提交回调 */
  onSubmit?: (timeSpent: number) => void;
  /** 是否显示解析 */
  showAnalysis?: boolean;
}

export interface AnswerInputProps {
  /** 题目数据 */
  question: Question;
  /** 当前答案 */
  value?: PracticeAnswer;
  /** 是否禁用 */
  disabled?: boolean;
  /** 答案变更回调 */
  onChange: (value: PracticeAnswer) => void;
}

export interface SubQuestionInputProps {
  /** 子题数据 */
  subQuestion: SubQuestion;
  /** 子题索引 */
  index: number;
  /** 当前答案值 */
  value: string;
  /** 是否禁用 */
  disabled: boolean;
  /** 答案变更回调 */
  onChange: (val: string) => void;
  /** 父题的答案对象（用于获取正确答案） */
  parentAnswer?: PracticeAnswer;
}
