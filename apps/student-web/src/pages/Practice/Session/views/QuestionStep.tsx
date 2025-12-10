/**
 * 单题步骤视图 - 组合进度、题目、答题、导航
 * 直接从 store 读取当前题目与状态，并派发动作
 */
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProgressIndicator } from "./ProgressIndicator";
import { QuestionCard } from "./QuestionCard";
import { AnswerPanel } from "./AnswerPanel";
import { NavigationButtons } from "./NavigationButtons";
import {
  useSessionStore,
  useCurrentQuestion,
  useTotalQuestions,
  useAnsweredCount,
  useCurrentAnswerStatus,
  useCurrentAnswer,
  useCurrentAudioAnswer,
  useIsLastQuestion,
  useHasAnsweredCurrent,
} from "../stores/session-store";

const getPracticeTypeName = (sessionType?: PracticeType): string => {
  if (!sessionType) return "练习";
  switch (sessionType) {
    case "daily_practice":
      return "每日练习";
    case "unit_practice":
      return "单元练习";
    case "assessment":
      return "能力评测";
    default:
      return "练习";
  }
};

export const QuestionStep = memo(() => {
  const navigate = useNavigate();

  const session = useSessionStore((state) => state.session);
  const currentQuestionIndex = useSessionStore(
    (state) => state.currentQuestionIndex
  );
  const submitting = useSessionStore((state) => state.submitting);
  const submitCurrentAnswer = useSessionStore(
    (state) => state.submitCurrentAnswer
  );
  const completePractice = useSessionStore((state) => state.completePractice);
  const goPrev = useSessionStore((state) => state.goPrev);
  const goNext = useSessionStore((state) => state.goNext);

  const currentQuestion = useCurrentQuestion();
  const totalQuestions = useTotalQuestions();
  const answeredCount = useAnsweredCount();
  const answerStatus = useCurrentAnswerStatus();
  const currentAnswer = useCurrentAnswer();
  const currentAudioAnswer = useCurrentAudioAnswer();
  const isLastQuestion = useIsLastQuestion();
  const hasAnsweredCurrent = useHasAnsweredCurrent();

  if (!session || !currentQuestion) return null;

  const practiceType = getPracticeTypeName(session.session_type);

  const hasAnswer =
    currentQuestion.type === "口语题"
      ? !!currentAudioAnswer
      : !!currentAnswer;
  const canGoPrevious = currentQuestionIndex > 0;

  const handleSubmit = async () => {
    try {
      const result = await submitCurrentAnswer();
      toast.success(result.is_correct ? "回答正确！" : "回答错误");
    } catch (error) {
      console.error("Failed to submit answer:", error);
      const errorMessage =
        error instanceof Error ? error.message : "提交答案失败";
      toast.error(errorMessage);
    }
  };

  const handleComplete = async () => {
    try {
      await completePractice();
      toast.success("练习已完成！");
      navigate(`/practice-result/${session.id}`);
    } catch (error) {
      console.error("Failed to complete practice:", error);
      const errorMessage =
        error instanceof Error ? error.message : "完成练习失败";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* 进度指示器 */}
      <ProgressIndicator
        currentIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        practiceType={practiceType}
      />

      {/* 题目卡片 */}
      <QuestionCard
        question={currentQuestion}
        index={currentQuestionIndex}
        answerStatus={answerStatus}
      />

      {/* 答题区域 */}
      <div className="space-y-6">
        <AnswerPanel />

        <NavigationButtons
          canGoPrevious={canGoPrevious}
          hasAnswered={hasAnsweredCurrent}
          hasAnswer={hasAnswer}
          submitting={submitting}
          isLastQuestion={isLastQuestion}
          onPrevious={goPrev}
          onNext={goNext}
          onSubmit={handleSubmit}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
});

QuestionStep.displayName = "QuestionStep";

