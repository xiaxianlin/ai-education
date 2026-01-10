import { AlertCircle, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface FeedbackAnimationProps {
  status: "correct" | "incorrect" | "partial" | null;
  onComplete?: () => void;
}

/**
 * 根据状态映射获取主容器的 className
 */
function getMainContainerClassName(params: {
  status: "correct" | "incorrect" | "partial";
}): string {
  const base = "flex flex-col items-center gap-4 p-8 rounded-3xl shadow-2xl animate-in zoom-in-50 duration-300";
  const classes: string[] = [base];
  
  if (params.status === "correct") {
    classes.push("bg-primary text-primary-foreground");
  } else if (params.status === "incorrect") {
    classes.push("bg-destructive text-destructive-foreground");
  } else {
    classes.push("bg-amber-500 text-white");
  }
  
  return classes.join(" ");
}

/**
 * 根据状态映射获取背景层的 className
 */
function getBackgroundClassName(params: {
  status: "correct" | "incorrect" | "partial";
}): string {
  const base = "absolute inset-0 z-[-1] animate-in fade-in duration-500";
  const classes: string[] = [base];
  
  if (params.status === "correct") {
    classes.push("bg-primary/10");
  } else if (params.status === "incorrect") {
    classes.push("bg-destructive/10");
  } else {
    classes.push("bg-amber-500/10");
  }
  
  return classes.join(" ");
}

/**
 * 答题反馈动画组件
 */
export function FeedbackAnimation({ status, onComplete }: FeedbackAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!status || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={getMainContainerClassName({
          status,
        })}
      >
        <div className="relative">
          {status === "correct" && (
            <>
              <CheckCircle2 className="w-20 h-20 animate-bounce" />
              <div className="absolute -inset-4 z-[-1]">
                <Sparkles className="w-28 h-28 animate-pulse opacity-50" />
              </div>
            </>
          )}
          {status === "incorrect" && <XCircle className="w-20 h-20 animate-shake" />}
          {status === "partial" && <AlertCircle className="w-20 h-20 animate-pulse" />}
        </div>

        <div className="text-2xl font-bold tracking-tight">
          {status === "correct" && "太棒了！"}
          {status === "incorrect" && "再试一次吧"}
          {status === "partial" && "已经很接近了"}
        </div>
      </div>

      {/* 背景全屏闪烁效果 */}
      <div
        className={getBackgroundClassName({
          status,
        })}
      />
    </div>
  );
}
