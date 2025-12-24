/**
 * 进度指示器组件 - 显示所有题目状态的圆圈网格
 */
import { cn } from "@/lib/utils";
import { usePageModel } from "../models/page";

export function ProgressIndicator() {
  const { questions, answers, order, jumpTo } = usePageModel();

  return (
    <div className="w-full">
      <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-4">
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
              className={cn(
                "relative aspect-square rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200",
                "hover:scale-110 active:scale-95",
                // 背景颜色 - 根据状态
                isUnanswered && "bg-gray-200 text-gray-600",
                isCorrect && "bg-gradient-to-br from-green-300 to-green-500 text-white",
                isIncorrect && "bg-gradient-to-br from-red-300 to-red-500 text-white",
                // 当前题目高亮
                isCurrent && "ring-4 ring-primary ring-offset-2"
              )}
              title={`第 ${index + 1} 题${isUnanswered ? " - 未作答" : isCorrect ? " - 正确" : " - 错误"}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
