/**
 * 通用练习会话页面
 * 根据 session_id 进行答题，支持所有类型的练习
 */
import { useParams, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { LoadingSpinner } from "@/components/biz/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { usePracticeSession } from "./hooks/usePracticeSession";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { AnswerOptions } from "@/components/practice/AnswerOptions";
import { NavigationButtons } from "@/components/practice/NavigationButtons";
import { ResultModal } from "./components/ResultModal";

export function PracticeSession() {
  const { sessionId } = useParams({ from: "/practice/$sessionId" });
  const navigate = useNavigate();

  const {
    loading,
    session,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    answeredCount,
    userAnswers,
    audioUrls,
    answerStatus,
    submitting,
    report,
    handleAnswerChange,
    handleSubmitAnswer,
    goToPreviousQuestion,
    goToNextQuestion,
    handleComplete,
    handleBegin,
  } = usePracticeSession(Number(sessionId));

  // 获取返回路径
  const getBackPath = () => {
    if (!session) return "/home";
    switch (session.session_type) {
      case "unit_practice":
        return "/unit-practice";
      default:
        return "/home";
    }
  };

  // 获取练习类型名称
  const getPracticeTypeName = () => {
    if (!session) return "练习";
    switch (session.session_type) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <LoadingSpinner size="lg" text="加载中..." />
        </div>
      </div>
    );
  }

  if (report) {
    return (
      <>
        <Header />
        <ResultModal report={report} sessionType={session?.session_type} />
      </>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            练习会话不存在
          </h2>
          <Button onClick={() => navigate({ to: getBackPath() })}>返回</Button>
        </div>
      </div>
    );
  }

  // 如果练习未开始，显示开始按钮
  if (session.status === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <Button
            variant="outline"
            onClick={() => navigate({ to: getBackPath() })}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            返回
          </Button>

          <div className="bg-card rounded-3xl p-12 shadow-xl border-2 border-primary/20 text-center">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {getPracticeTypeName()}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              准备好开始挑战了吗？共有 {totalQuestions} 道题目等待你完成
            </p>
            <Button
              onClick={handleBegin}
              size="lg"
              className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-semibold text-lg"
            >
              开始练习 🚀
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // status: 0-未答, 1-正确, 2-错误
  const answerStatusValue = answerStatus[currentQuestion.id];
  const hasAnswered = answerStatusValue !== undefined && answerStatusValue !== 0;
  const currentAnswer = userAnswers[currentQuestion.id];
  const currentAudioUrl = audioUrls[currentQuestion.id];
  const isCorrect = answerStatusValue === 1;
  const hasAnswer =
    currentQuestion.type === "口语题" ? !!currentAudioUrl : !!currentAnswer;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 返回按钮 */}
        <Button
          variant="outline"
          onClick={() => navigate({ to: getBackPath() })}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          返回{getPracticeTypeName()}
        </Button>

        {/* 进度指示器 */}
        <ProgressIndicator
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          practiceType={getPracticeTypeName()}
        />

        {/* 题目卡片 */}
        <QuestionCard
          question={currentQuestion}
          index={currentQuestionIndex}
          answerStatus={answerStatusValue}
        />

        {/* 答题区域 */}
        <div className="space-y-6">
          <AnswerOptions
            question={currentQuestion}
            answer={currentAnswer}
            hasAnswered={hasAnswered}
            isCorrect={isCorrect}
            onAnswerChange={handleAnswerChange}
          />

          <NavigationButtons
            canGoPrevious={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < totalQuestions - 1}
            hasAnswered={hasAnswered}
            hasAnswer={hasAnswer}
            submitting={submitting}
            isLastQuestion={currentQuestionIndex === totalQuestions - 1}
            onPrevious={goToPreviousQuestion}
            onNext={goToNextQuestion}
            onSubmit={handleSubmitAnswer}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
}
