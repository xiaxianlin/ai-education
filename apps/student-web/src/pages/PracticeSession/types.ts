export enum PanelType {
  LOADING = "loading",
  EMPTY = "empty",
  ERROR = "error",
  READY = "ready",
  PROCESSING = "processing",
  SETTLEMENT = "settlement",
  RESULT = "result",
}

export enum QuestionType {
  CHOICE = "选择题",
  JUDGE = "判断题",
  TEXT = "拼写题",
  AUDIO = "口语题",
}

/** 答案表单 Props */
export interface AnswerFormProps {
  value?: PracticeAnswer;
  disabled?: boolean;
  onChange: (value: PracticeAnswer) => void;
}
