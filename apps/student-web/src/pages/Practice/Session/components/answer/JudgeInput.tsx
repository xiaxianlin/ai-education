/**
 * 判断题输入组件
 */
import { FC, memo } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface JudgeInputProps {
  value?: string;
  disabled?: boolean;
  hasAnswered?: boolean;
  isCorrect?: boolean;
  onChange: (answer: string) => void;
}

export const JudgeInput: FC<JudgeInputProps> = memo(
  ({ value, disabled, hasAnswered, isCorrect, onChange }) => {
    const options = [
      { value: "正确", emoji: "✅" },
      { value: "错误", emoji: "❌" },
    ];

    return (
      <div className="space-y-4">
        {options.map(({ value: option, emoji }) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              onClick={() => !hasAnswered && !disabled && onChange(option)}
              disabled={hasAnswered || disabled}
              className={cn(
                "w-full p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md",
                isSelected
                  ? hasAnswered
                    ? isCorrect
                      ? "border-green-500 bg-green-500/10 text-green-500"
                      : "border-destructive bg-destructive/10 text-destructive"
                    : "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground",
                hasAnswered && "cursor-not-allowed opacity-80",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-4xl">{emoji}</span>
                  {option}
                </span>
                {isSelected && hasAnswered && (
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-destructive" />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

JudgeInput.displayName = "JudgeInput";

