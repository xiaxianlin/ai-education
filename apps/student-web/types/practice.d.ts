declare global {
  interface AnswerRecord extends AudioAnswerAnalysisResponse {
    correct_answer?: string;
  }

  interface AnswerFormProps {
    value?: AnswerRecord;
    disabled?: boolean;
    onChange: (value: AnswerRecord) => void;
  }
}
export {};
