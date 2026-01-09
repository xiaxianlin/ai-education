/**
 * 判断题输入组件
 */
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import type { AnswerFormProps } from "../../types";

export function JudgeInput({ value, disabled, onChange }: AnswerFormProps) {
  return (
    <div className="space-y-4">
      {[
        { value: "正确", emoji: "✅" },
        { value: "错误", emoji: "❌" },
      ].map(({ value: option, emoji }) => {
        const isSelected = value?.text_answer === option;
        return (
          <button
            key={option}
            onClick={() => !disabled && onChange({ ...value, text_answer: option } as PracticeAnswer)}
            disabled={disabled}
            className={cn(
              "w-full p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
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
