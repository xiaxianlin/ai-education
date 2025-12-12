/**
 * 单题步骤视图 - 组合进度、题目、答题、导航
 * 直接从 store 读取当前题目与状态，并派发动作
 */
import { ProgressIndicator } from "../components/ProgressIndicator";
import { QuestionCard } from "../components/QuestionCard";
import { Button } from "@/components/ui/button";
import { AnswerCard } from "../components/AnswerCard";

export function ProcessingView() {
  return (
    <div className="space-y-6">
      {/* 步骤图组件 */}
      <ProgressIndicator />

      {/* 题目卡片 */}
      <QuestionCard />

      <AnswerCard />

      <Button variant="outline" className="flex-1 h-16 text-lg font-bold rounded-2xl border-2">
        提交
      </Button>
    </div>
  );
}
