/**
 * 答题面板组件 - 根据题目类型组合不同的输入组件
 * 直接从 store 读取当前题目与答案，并派发变更
 */
import { memo } from "react";
import { ChoiceInput } from "../components/answer/ChoiceInput";
import { JudgeInput } from "../components/answer/JudgeInput";
import { TextInput } from "../components/answer/TextInput";
import { AudioInput } from "../components/answer/AudioInput";
import {
  useSessionStore,
  useCurrentQuestion,
  useCurrentAnswer,
  useCurrentAudioAnswer,
  useCurrentAnswerStatus,
  useHasAnsweredCurrent,
} from "../stores/session-store";

export const AnswerPanel = memo(() => {
  const question = useCurrentQuestion();
  const answer = useCurrentAnswer();
  const audioAnswer = useCurrentAudioAnswer();
  const answerStatus = useCurrentAnswerStatus();
  const hasAnswered = useHasAnsweredCurrent();
  const setAnswer = useSessionStore((state) => state.setAnswer);
  const setAudioAnswer = useSessionStore((state) => state.setAudioAnswer);

  if (!question) return null;

  const isCorrect = answerStatus === 1;

  const setAudioAnalysis = useSessionStore((state) => state.setAudioAnalysis);

  const handleChange = (value: string, audioBase64?: string, audioAnalysis?: UploadRecordingResult) => {
    setAnswer(question.id, value);
    if (audioBase64) {
      setAudioAnswer(question.id, audioBase64);
    }
    if (audioAnalysis) {
      setAudioAnalysis(question.id, audioAnalysis);
    }
  };

  // 选择题
  if (question.type === "选择题") {
    return (
      <ChoiceInput
        question={question}
        value={answer}
        disabled={hasAnswered}
        hasAnswered={hasAnswered}
        isCorrect={isCorrect}
        onChange={(ans) => handleChange(ans)}
      />
    );
  }

  // 判断题
  if (question.type === "判断题") {
    return (
      <JudgeInput
        value={answer}
        disabled={hasAnswered}
        hasAnswered={hasAnswered}
        isCorrect={isCorrect}
        onChange={(ans) => handleChange(ans)}
      />
    );
  }

  // 口语题
  if (question.type === "口语题") {
    return (
      <AudioInput
        value={audioAnswer}
        disabled={hasAnswered}
        hasAnswered={hasAnswered}
        onChange={(text, base64, analysis) => handleChange(text, base64, analysis)}
      />
    );
  }

  // 主观题、拼写题等
  const isSpelling = question.type === "拼写题";
  return (
    <TextInput
      value={answer}
      disabled={hasAnswered}
      hasAnswered={hasAnswered}
      isCorrect={isCorrect}
      isSpelling={isSpelling}
      onChange={(ans) => handleChange(ans)}
    />
  );
});

AnswerPanel.displayName = "AnswerPanel";

