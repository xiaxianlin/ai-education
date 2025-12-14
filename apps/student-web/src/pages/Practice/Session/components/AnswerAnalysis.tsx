import { Card, CardContent } from "@/components/ui/card";
import { usePageModel } from "../models/PageModel";
import { CheckCircle, Lightbulb } from "lucide-react";

/**
 * 答案解析组件
 * - 展示正确答案
 * - 展示分析结果（如果有）
 */
export function AnswerAnalysis() {
  const { answer } = usePageModel();

  // 如果答案记录不存在或答案正确，则不显示
  if (!answer || answer.status !== 2) return null;

  return (
    <Card className="border-2 border-primary/20 shadow-lg rounded-2xl bg-card">
      <CardContent className="p-6 space-y-5">
        <div className="rounded-xl border border-green-500/40 bg-green-50 dark:bg-green-950/20 p-4">
          <div className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>正确答案</span>
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{answer.correct_answer}</div>
        </div>

        <div className="rounded-xl border border-orange-500/40 bg-orange-50 dark:bg-orange-950/20 p-4">
          <div className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>分析</span>
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{answer.analysis}</div>
        </div>
      </CardContent>
    </Card>
  );
}
