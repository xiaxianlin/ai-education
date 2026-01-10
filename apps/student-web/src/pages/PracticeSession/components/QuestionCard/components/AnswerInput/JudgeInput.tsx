/**
 * 判断题输入组件
 * 支持 true_false / correct_wrong
 */
import { CheckCircle } from "lucide-react";
import type { AnswerInputProps } from "../../types";

/**
 * 根据状态映射获取按钮的 className
 */
function getButtonClassName(params: {
  isSelected: boolean;
  disabled: boolean;
}): string {
  const base = "w-full p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md";
  const classes: string[] = [base];
  
  if (params.disabled) {
    classes.push("opacity-50 cursor-not-allowed");
  }
  
  if (params.isSelected) {
    classes.push("border-primary bg-primary/10 text-primary");
  } else {
    classes.push("border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground");
  }
  
  return classes.join(" ");
}

export function JudgeInput({ value, disabled, onChange }: AnswerInputProps) {
  // 从 answer.answer 读取答案
  const rawAnswer = value?.answer;
  const currentAnswer = typeof rawAnswer === "string" ? rawAnswer : "";

  return (
    <div className="space-y-4">
      {[
        { value: "正确", emoji: "✅" },
        { value: "错误", emoji: "❌" },
      ].map(({ value: option, emoji }) => {
        const isSelected = currentAnswer === option;
        return (
          <button
            key={option}
            onClick={() => !disabled && onChange({ ...value, answer: option } as PracticeAnswer)}
            disabled={disabled}
            className={getButtonClassName({
              isSelected,
              disabled: !!disabled,
            })}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold flex items-center gap-3">
                <span className="text-4xl">{emoji}</span>
                {option}
              </span>
              {isSelected && (
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
