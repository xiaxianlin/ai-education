/**
 * 单题步骤视图 - 组合进度、题目、答题、导航
 * 直接从 store 读取当前题目与状态，并派发动作
 */
import { useNavigate } from "react-router-dom";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { QuestionCard } from "../components/QuestionCard";
import { Button } from "@/components/ui/button";
import { AnswerCard } from "../components/AnswerCard";
import { Card, CardContent } from "@/components/ui/card";
import { usePageModel } from "../models/PageModel";
import { ArrowLeft } from "lucide-react";

export function ProcessingView() {
  const navigate = useNavigate();
  const { handleSubmit, canSubmit } = usePageModel();

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 返回按钮和进度指示器 */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-xl border-2 hover:bg-muted/50 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <ProgressIndicator />
        </div>

        {/* 题目卡片 */}
        <Card className="border-2 border-primary/30 shadow-lg rounded-2xl bg-card overflow-visible relative">
          <CardContent className="p-5">
            <QuestionCard />
          </CardContent>
        </Card>

        {/* 答题区 */}
        <AnswerCard />

        {/* 提交按钮 */}
        <div className="pb-4">
          <Button
            type="button"
            className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            disabled={!canSubmit}
            onClick={() => handleSubmit()}
          >
            提交
          </Button>
        </div>
      </div>
    </div>
  );
}
