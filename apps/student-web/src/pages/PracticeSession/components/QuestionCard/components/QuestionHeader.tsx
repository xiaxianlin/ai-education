/**
 * 题目序号和状态徽章组件
 */
import { useMemo } from "react";

interface QuestionHeaderProps {
  /** 题目序号（从 1 开始） */
  order: number;
  /** 答题状态：0-未答，1-正确，2-错误 */
  status?: number;
}

/**
 * 根据状态映射获取结果徽章的 className
 */
function getResultBadgeClassName(params: { isCorrect: boolean }): string {
  const base = "absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-2xl z-10";
  const classes: string[] = [base];

  if (params.isCorrect) {
    classes.push("bg-gradient-to-br from-yellow-300 via-green-400 to-emerald-500");
  } else {
    classes.push("bg-gradient-to-br from-pink-400 via-orange-400 to-amber-400");
  }

  return classes.join(" ");
}

/**
 * 根据状态映射获取装饰性边框的 className
 */
function getBorderClassName(params: { isCorrect: boolean }): string {
  const base = "absolute inset-0 rounded-full border-4";
  const classes: string[] = [base];

  if (params.isCorrect) {
    classes.push("border-white/50");
  } else {
    classes.push("border-white/40");
  }

  return classes.join(" ");
}

export function QuestionHeader({ order, status }: QuestionHeaderProps) {
  const resultBadge = useMemo(() => {
    if (status === 0 || status === undefined) return null;
    const isCorrect = status === 1;
    return (
      <div
        className={getResultBadgeClassName({
          isCorrect,
        })}
      >
        {/* 内容 */}
        <div className="relative flex items-center justify-center">
          {isCorrect ? (
            <>
              {/* 正确答案 - 大大的笑脸和星星 */}
              <div className="relative">
                <div className="text-2xl font-bold">😊</div>
                {/* 闪耀的星星 */}
                <div className="absolute -top-1 -right-1 text-yellow-300 text-lg">✨</div>
                <div className="absolute -bottom-1 -left-1 text-yellow-300 text-lg">⭐</div>
              </div>
            </>
          ) : (
            <>
              {/* 错误答案 - 鼓励的表情 */}
              <div className="relative">
                <div className="text-2xl font-bold">💪</div>
                {/* 小爱心表示鼓励 */}
                <div className="absolute -top-1 -right-1 text-pink-300 text-sm">💖</div>
              </div>
            </>
          )}
        </div>

        {/* 装饰性边框 */}
        <div
          className={getBorderClassName({
            isCorrect,
          })}
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
