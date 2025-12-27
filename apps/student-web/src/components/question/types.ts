/**
 * 题目答题组件类型定义
 */
import type { InteractionType, Question, QuestionOption, SubQuestion } from "@ai-education/shared-web";

// 重新导出共享类型
export type { InteractionType, Question, QuestionOption, SubQuestion };

/** 答题状态 */
export type AnswerStatus = "pending" | "answered" | "correct" | "incorrect" | "partial";

/** 单题答案 */
export interface AnswerValue {
  questionId: string;
  subQuestionId?: string;
  value: string | string[];
  timeSpent: number;
  status: AnswerStatus;
}

/** 复合题答案 */
export interface CompositeAnswerValue {
  questionId: string;
  subAnswers: Record<string, AnswerValue>;
  totalTimeSpent: number;
  status: AnswerStatus;
}

/** 答题回调 */
export interface AnswerCallbacks {
  onAnswer?: (value: AnswerValue | CompositeAnswerValue) => void;
  onSubmit?: (value: AnswerValue | CompositeAnswerValue) => Promise<void>;
}

/** 交互组件通用 Props */
export interface InteractionInputProps {
  value: string | string[];
  options?: QuestionOption[];
  disabled?: boolean;
  onChange: (value: string | string[]) => void;
}

/** 题目渲染器 Props */
export interface QuestionRendererProps {
  question: Question;
  answer?: AnswerValue | CompositeAnswerValue;
  disabled?: boolean;
  showFeedback?: boolean;
  callbacks?: AnswerCallbacks;
}

/** 子题渲染器 Props */
export interface SubQuestionRendererProps {
  subQuestion: SubQuestion;
  index: number;
  answer?: AnswerValue;
  disabled?: boolean;
  showFeedback?: boolean;
  onChange: (value: string | string[]) => void;
}

/** 交互类型到组件的映射 */
export const INTERACTION_COMPONENTS: Record<InteractionType, string> = {
  single_choice: "SingleChoiceInput",
  multi_choice: "MultiChoiceInput",
  image_choice: "ImageChoiceInput",
  text_input: "TextInput",
  handwriting: "HandwritingInput",
  voice_input: "VoiceInput",
  drag_drop: "DragDropInput",
  connect_line: "ConnectLineInput",
  sort_order: "SortOrderInput",
  true_false: "TrueFalseInput",
  correct_wrong: "CorrectWrongInput",
  follow_read: "FollowReadInput",
  free_speak: "FreeSpeakInput",
  fill_blank: "FillBlankInput",
  multi_step: "MultiStepInput",
};
