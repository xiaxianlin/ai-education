import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePracticeSessionModel } from "../models/page";

/**
 * 根据状态映射获取按钮的 className
 */
function getButtonClassName(params: {
  isUnanswered: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  isCurrent: boolean;
}): string {
  const base =
    "relative min-w-[36px] h-9 px-2 rounded-lg flex items-center justify-center font-medium text-sm transition-all duration-200 border";

  if (params.isCurrent) {
    return cn(base, "bg-primary text-primary-foreground border-primary shadow-sm scale-105 z-10");
  }

  if (params.isUnanswered) {
    return cn(base, "bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-600");
  }

  if (params.isCorrect) {
    return cn(base, "bg-green-50 text-green-600 border-green-100 hover:bg-green-100 hover:border-green-200");
  }

  if (params.isIncorrect) {
    return cn(base, "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200");
  }

  return base;
}

export function ProgressIndicator() {
  const { questions, answers, order, jumpTo, prev, next } = usePracticeSessionModel();

  return (
    <div className="w-full py-2">
      <div className="flex items-center w-full bg-gray-50/50 rounded-xl border border-gray-100 shadow-sm p-1.5">
        {/* 上一题 */}
        <button
          onClick={prev}
          disabled={order === 0}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium transition-colors hover:bg-white hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent text-gray-600"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>上一题</span>
        </button>

        <div className="h-5 w-[1px] bg-gray-200 mx-1" />

        {/* 题目列表 - 允许自适应并处理溢出 */}
        <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar px-6 py-1.5">
          {questions.map((question, index) => {
            const answer = answers[index];
            const isUnanswered = !answer || answer.status === 0;
            const isCorrect = answer?.status === 1;
            const isIncorrect = answer?.status === 2;
            const isCurrent = index === order;

            return (
              <button
                key={question.id}
                onClick={() => jumpTo(index)}
                className={getButtonClassName({
                  isUnanswered,
                  isCorrect,
                  isIncorrect,
                  isCurrent,
                })}
                title={`第 ${index + 1} 题${isUnanswered ? " - 未作答" : isCorrect ? " - 正确" : " - 错误"}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-[1px] bg-gray-200 mx-1" />

        {/* 下一题 */}
        <button
          onClick={next}
          disabled={order === questions.length - 1}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium transition-colors hover:bg-white hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent text-gray-600"
        >
          <span>下一题</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
