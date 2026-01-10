/**
 * 题目序号和状态徽章组件
 */
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface QuestionHeaderProps {
  /** 题目序号（从 1 开始） */
  order: number;
  /** 答题状态：0-未答，1-正确，2-错误 */
  status?: number;
}

export function QuestionHeader({ order, status }: QuestionHeaderProps) {
  const resultBadge = useMemo(() => {
    if (status === 0 || status === undefined) return null;
    const isCorrect = status === 1;
    return (
      <div
        className={cn(
          "absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl z-10",
          isCorrect
            ? "bg-gradient-to-br from-yellow-300 via-green-400 to-emerald-500"
            : "bg-gradient-to-br from-pink-400 via-orange-400 to-amber-400"
        )}
      >
        {/* 内容 */}
        <div className="relative flex items-center justify-center">
          {isCorrect ? (
            <>
              {/* 正确答案 - 大大的笑脸和星星 */}
              <div className="relative">
                <div className="text-3xl font-bold">😊</div>
                {/* 闪耀的星星 */}
                <div className="absolute -top-1 -right-1 text-yellow-300 text-lg">✨</div>
                <div className="absolute -bottom-1 -left-1 text-yellow-300 text-lg">⭐</div>
              </div>
            </>
          ) : (
            <>
              {/* 错误答案 - 鼓励的表情 */}
              <div className="relative">
                <div className="text-3xl font-bold">💪</div>
                {/* 小爱心表示鼓励 */}
                <div className="absolute -top-1 -right-1 text-pink-300 text-sm">💖</div>
              </div>
            </>
          )}
        </div>

        {/* 装饰性边框 */}
        <div
          className={cn("absolute inset-0 rounded-full border-4", isCorrect ? "border-white/50" : "border-white/40")}
        />
      </div>
    );
  }, [status]);

  return (
    <div className="flex items-center justify-between mb-4 relative">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
          {order}
        </div>
        <span className="text-sm text-muted-foreground">第 {order} 题</span>
      </div>
      {resultBadge}
    </div>
  );
}
