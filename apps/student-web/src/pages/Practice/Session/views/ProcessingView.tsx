/**
 * 单题步骤视图 - 组合进度、题目、答题、导航
 * 直接从 store 读取当前题目与状态，并派发动作
 */
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { QuestionCard } from "../components/QuestionCard";
import { AnswerPanel } from "../components/AnswerPanel";
import { NavigationButtons } from "../components/NavigationButtons";
import {
  usePageModel,
  useCurrentQuestion,
  useCurrentAnswer,
  useCurrentAudioAnswer,
  useCurrentAnswerStatus,
  useIsLastQuestion,
  useHasAnsweredCurrent,
} from "../models/PageModel";

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

export const ProcessingView = memo(() => {
  const navigate = useNavigate();

  const pageModel = usePageModel();
  const session = pageModel.session;
  const currentQuestionIndex = pageModel.currentQuestionIndex;
  const submitting = pageModel.submitting;
  const submitCurrentAnswer = pageModel.submitCurrentAnswer;
  const completePractice = pageModel.completePractice;
  const goPrev = pageModel.goPrev;
  const goNext = pageModel.goNext;

  const currentQuestion = useCurrentQuestion();
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
      // 完成练习后，Main.tsx 会自动切换到结算视图
    } catch (error) {
      console.error("Failed to complete practice:", error);
      const errorMessage =
        error instanceof Error ? error.message : "完成练习失败";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* 步骤图组件 */}
      <ProgressIndicator practiceType={practiceType} />

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

