/**
 * 选择题输入组件
 */
import { FC, memo } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoiceInputProps {
  question: Question;
  value?: string;
  disabled?: boolean;
  hasAnswered?: boolean;
  isCorrect?: boolean;
  onChange: (answer: string) => void;
}

export const ChoiceInput: FC<ChoiceInputProps> = memo(
  ({ question, value, disabled, hasAnswered, isCorrect, onChange }) => {
    let options: Array<string | { label: string; text: string }> = [];
    try {
      options = question.options ? JSON.parse(question.options) : [];
    } catch {
      options = question.options ? question.options.split("\n") : [];
    }

    // 判断选项是否较长：如果任何选项文本长度超过 15 个字符，使用 2 列布局，否则使用 4 列布局
    const hasLongOptions = options.some((option) => {
      const optionText =
        typeof option === "object" && option !== null && "text" in option
          ? option.text
          : String(option);
      return optionText.length > 15;
    });

    const gridCols = hasLongOptions ? "grid-cols-2" : "grid-cols-4";

    return (
      <div className={cn("grid gap-4", gridCols)}>
        {options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);
          const isSelected = value === optionLabel;
          const optionText =
            typeof option === "object" && option !== null && "text" in option
              ? option.text
              : String(option);

          return (
            <button
              key={index}
              onClick={() => !hasAnswered && !disabled && onChange(optionLabel)}
              disabled={hasAnswered || disabled}
              className={cn(
                "flex items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md",
                isSelected
                  ? hasAnswered
                    ? isCorrect
                      ? "border-green-500 bg-green-500/10 text-green-500 shadow-green-500/20"
                      : "border-destructive bg-destructive/10 text-destructive shadow-destructive/20"
                    : "border-primary bg-primary/10 text-primary shadow-primary/20"
                  : "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground",
                hasAnswered && !isSelected && "opacity-50 grayscale",
                hasAnswered && "cursor-not-allowed",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="text-xl font-bold text-center leading-relaxed flex-1">
                {optionText}
              </div>
              {isSelected && hasAnswered && (
                <div className="flex-shrink-0">
                  {isCorrect ? (
                    <CheckCircle className="h-7 w-7 text-green-500" />
                  ) : (
                    <XCircle className="h-7 w-7 text-destructive" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

ChoiceInput.displayName = "ChoiceInput";

