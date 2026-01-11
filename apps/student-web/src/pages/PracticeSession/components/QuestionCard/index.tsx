/**
 * QuestionCard 统一组件
 * 整合题目展示、答题交互、解析展示
 * 支持单题和复合题
 */
import { Button, Card, CardContent } from "@/components/ui";
import { isCompositeQuestion } from "@ai-education/shared-web";
import { Loader2 } from "lucide-react";
import { useMemo, useRef } from "react";
import { AnalysisSection, AnswerSection, QuestionHeader, QuestionStem, SubQuestionList } from "./components";
import type { QuestionCardProps } from "./types";

export function QuestionCard(props: QuestionCardProps) {
  const { question, answer, showAnalysis = true } = props;

  if (!question) {
    return (
      <Card className="border-2 border-primary/30 shadow-lg rounded-2xl bg-card">
        <CardContent className="p-5">
          <div className="text-muted-foreground">题目加载中...</div>
        </CardContent>
      </Card>
    );
  }

  const isComposite = isCompositeQuestion(question);
  const isAnswered = answer?.status !== 0;
  const isWrong = answer?.status === 2;
  // 检查是否有 AI 分析（从 answer.analysis 中解析）
  const hasAIAnalysis = useMemo(() => {
    if (!answer?.analysis) return false;
    try {
      const analysisData = typeof answer.analysis === "string" ? JSON.parse(answer.analysis) : answer.analysis;
      return !!analysisData?.analysis;
    } catch {
      return false;
    }
  }, [answer?.analysis]);
  const startTime = useRef(Date.now());

  // 检查是否所有题目都已作答
  const isAllAnswered = useMemo(() => {
    const rawAnswer = answer?.answer;
    if (!rawAnswer) return false;

    if (isComposite) {
      // 复合题：检查所有子题是否都已作答
      const subQuestions = question?.stem?.sub_questions || (question?.stem as any)?.subQuestions || [];
      if (subQuestions.length === 0) return false;

      try {
        const parsed = typeof rawAnswer === "string" ? JSON.parse(rawAnswer) : rawAnswer;
        let compositeAnswers: Record<string, string> = {};

        if (Array.isArray(parsed)) {
          // 新格式：转换为字典
          parsed.forEach((item: any) => {
            if (item.sub_id && item.value !== undefined) {
              compositeAnswers[item.sub_id] = String(item.value);
            }
          });
        } else if (typeof parsed === "object" && parsed !== null) {
          compositeAnswers = parsed;
        }

        return subQuestions.every((subQ: SubQuestion) => {
          const subAnswer = compositeAnswers[subQ.id];
          return subAnswer && String(subAnswer).trim() !== "";
        });
      } catch {
        return false;
      }
    } else {
      // 单题：检查答案是否非空
      const answerStr = typeof rawAnswer === "string" ? rawAnswer : JSON.stringify(rawAnswer);
      return answerStr.trim() !== "" && answerStr !== "[]" && answerStr !== "{}";
    }
  }, [answer?.answer, answer?.answer, isComposite, question]);

  const handleSubmit = () => {
    if (props.onSubmit) {
      const timeSpent = Math.ceil((Date.now() - startTime.current) / 1000);
      props.onSubmit(timeSpent);
    }
  };

  return (
    <Card className="border border-gray-100 shadow-sm rounded-2xl bg-white overflow-visible relative">
      <CardContent className="p-5">
        <QuestionHeader question={question} status={answer?.status} />

        {isComposite ? (
          // 复合题：左右布局 4/6 比例
          <>
            <div className="flex gap-6">
              {/* 左侧：题干和资源 (40%) */}
              <div className="w-2/5 min-w-0">
                <QuestionStem question={question} />
              </div>
              {/* 右侧：子题列表 (60%) */}
              <div className="w-3/5 min-w-0">
                <SubQuestionList {...props} showSubmit={false} />
              </div>
            </div>
            {/* 提交按钮放在底部 */}
            {!props.disabled && answer?.status === 0 && (
              <div className="mt-4">
                <Button
                  type="button"
                  disabled={props.submitting || !isAllAnswered}
                  className="w-full h-12 text-base font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                >
                  {props.submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    "提交答案"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          // 单题：垂直布局
          <>
            <QuestionStem question={question} />
            <AnswerSection {...props} isAllAnswered={isAllAnswered} />
          </>
        )}

        {/* 解析区域（答错或有 AI 分析时显示） */}
        {showAnalysis && isAnswered && (isWrong || hasAIAnalysis) && answer && (
          <AnalysisSection answer={answer} question={question} />
        )}

        {/* 提交中的加载蒙层 */}
        {props.submitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl transition-all animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 animate-pulse" />
                <Loader2 className="absolute inset-0 w-12 h-12 text-primary animate-spin stroke-[2.5px]" />
              </div>
              <span className="text-sm font-semibold text-primary animate-pulse">正在智能核查中...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type { QuestionCardProps } from "./types";
