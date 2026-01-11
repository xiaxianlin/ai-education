/**
 * 单题步骤视图 - 组合进度、题目、答题、导航
 * 直接从 store 读取当前题目与状态，并派发动作
 */
import { Button } from "@/components/ui";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { QuestionCard } from "../components/QuestionCard";
import { usePracticeSessionModel } from "../models/page";

export function ProcessingView() {
  const { question, answer, order, submitting, isComplete, setAnswer, handleSubmit, complete } =
    usePracticeSessionModel();

  return (
    <div className="p-6 bg-[#fafafa] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* 返回按钮和进度指示器 */}
        <ProgressIndicator />

        {/* 统一的题目卡片 */}
        <QuestionCard
          key={question?.id}
          question={question!}
          answer={answer}
          order={order + 1}
          disabled={submitting || isComplete || answer?.status !== 0}
          submitting={submitting}
          onAnswerChange={setAnswer}
          onSubmit={handleSubmit}
          showAnalysis={true}
        />

        {/* 完成练习按钮 */}
        {isComplete && (
          <div className="pb-8">
            <Button
              type="button"
              className="w-full h-14 text-base font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all"
              onClick={complete}
            >
              完成练习
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
