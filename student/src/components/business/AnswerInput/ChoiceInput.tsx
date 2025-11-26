/**
 * 选择题输入组件
 */
import { FC } from "react";
import { cn } from "@/lib/utils";
import type { AnswerInputProps } from "./types";

export const ChoiceInput: FC<AnswerInputProps> = ({
  question,
  value,
  disabled,
  onChange,
}) => {
  const options = question.options?.split("\n") || [];

  return (
    <div className="space-y-3">
      {options.map((option, idx) => {
        const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D...
        const isSelected = value === optionLetter;

        return (
          <button
            key={idx}
            onClick={() => !disabled && onChange(optionLetter)}
            disabled={disabled}
            className={cn(
              "w-full p-4 text-left rounded-xl border-2 transition-all",
              "hover:border-primary hover:bg-primary/5",
              isSelected
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border bg-background",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {optionLetter}
              </div>
              <span className="text-base">{option.replace(/^[A-Z][.、]\s*/, "")}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
