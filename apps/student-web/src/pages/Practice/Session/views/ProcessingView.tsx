/**
 * 单题步骤视图 - 组合进度、题目、答题、导航
 * 直接从 store 读取当前题目与状态，并派发动作
 */
import { ProgressIndicator } from "../components/ProgressIndicator";
import { QuestionCard } from "../components/QuestionCard";
import { Button, Card, CardContent } from "@/components/ui";
import { AnswerCard } from "../components/AnswerCard";
import { usePageModel } from "../models/PageModel";
import { AnswerAnalysis } from "../components/AnswerAnalysis";

export function ProcessingView() {
  const { question, isComplete, complete } = usePageModel();

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 返回按钮和进度指示器 */}
        <ProgressIndicator />

        {/* 题目卡片 */}
        <Card className="border-2 border-primary/30 shadow-lg rounded-2xl bg-card overflow-visible relative">
          <CardContent className="p-5">
            <QuestionCard />
          </CardContent>
        </Card>

        {/* 答题区 */}
        <AnswerCard key={question?.id} />

        <AnswerAnalysis />

        {/* 提交按钮 */}
        {isComplete && (
          <div className="pb-4">
            <Button
              type="button"
              className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
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
