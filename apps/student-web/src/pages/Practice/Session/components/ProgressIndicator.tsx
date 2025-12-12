/**
 * 步骤图组件 - 显示所有题目的步骤点
 * 每个题目一个圆，有4种状态：未开始、进行中、正确、错误
 * 点击已答题的步骤点可切换到对应题目，未作答的题目不可点击
 */
import { memo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Circle } from "lucide-react";
import {
  usePageModel,
  useTotalQuestions,
  useCurrentQuestionIndex,
} from "../models/PageModel";

/**
 * 步骤状态类型
 * 0: 未开始
 * 1: 进行中
 * 2: 正确
 * 3: 错误
 */
type StepStatus = 0 | 1 | 2 | 3;

interface StepIndicatorProps {
  practiceType?: string;
}

export const ProgressIndicator = memo(function ProgressIndicator({
  practiceType,
}: StepIndicatorProps) {
  const totalQuestions = useTotalQuestions();
  const currentQuestionIndex = useCurrentQuestionIndex();
  const pageModel = usePageModel();
  const questions = pageModel.questions;
  const answerStatus = pageModel.answerStatus;
  const goToQuestion = pageModel.goToQuestion;

  const getStepStatus = (index: number): StepStatus => {
    if (index === currentQuestionIndex) {
      return 1; // 进行中
    }

    const question = questions[index];
    if (!question) return 0;

    const questionId =
      typeof question.id === "string" ? parseInt(question.id, 10) : question.id;
    const status = answerStatus[questionId];

    if (status === undefined || status === 0) {
      return 0; // 未开始
    } else if (status === 1) {
      return 2; // 正确
    } else {
      return 3; // 错误
    }
  };

  const canClickStep = (index: number): boolean => {
    const status = getStepStatus(index);
    // 只有已答题的步骤（正确或错误）可以点击
    return status === 2 || status === 3;
  };

  const handleStepClick = (index: number) => {
    if (canClickStep(index)) {
      goToQuestion(index);
    }
  };

  const renderStepIcon = (status: StepStatus) => {
    switch (status) {
      case 1: // 进行中
        return (
          <Circle className="h-6 w-6 text-primary fill-primary/20 stroke-2" />
        );
      case 2: // 正确
        return <CheckCircle2 className="h-6 w-6 text-green-500 fill-green-500/20" />;
      case 3: // 错误
        return <XCircle className="h-6 w-6 text-red-500 fill-red-500/20" />;
      default: // 未开始
        return (
          <Circle className="h-6 w-6 text-muted-foreground fill-muted/20" />
        );
    }
  };

  const getStepClassName = (status: StepStatus, clickable: boolean) => {
    return cn(
      "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
      status === 1 && "ring-2 ring-primary ring-offset-2 bg-primary/10",
      status === 2 && "bg-green-50 hover:bg-green-100",
      status === 3 && "bg-red-50 hover:bg-red-100",
      status === 0 && "bg-muted/30",
      clickable && "cursor-pointer hover:scale-110",
      !clickable && "cursor-not-allowed"
    );
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg rounded-2xl bg-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          {practiceType && (
            <div className="text-lg font-semibold text-foreground">
              {practiceType}
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>
              第 {currentQuestionIndex + 1} 题 / 共 {totalQuestions} 题
            </span>
          </div>
          {/* 步骤图 */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {Array.from({ length: totalQuestions }).map((_, index) => {
              const status = getStepStatus(index);
              const clickable = canClickStep(index);

              return (
                <div
                  key={index}
                  className={getStepClassName(status, clickable)}
                  onClick={() => handleStepClick(index)}
                  title={
                    status === 0
                      ? "未作答"
                      : status === 1
                      ? "当前题目"
                      : status === 2
                      ? "回答正确"
                      : "回答错误"
                  }
                >
                  {renderStepIcon(status)}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

