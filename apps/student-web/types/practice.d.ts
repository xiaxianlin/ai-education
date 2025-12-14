declare global {
  interface AnswerFormProps {
    value?: PracticeAnswer;
    disabled?: boolean;
    onChange: (value: PracticeAnswer) => void;
  }
}
export {};
