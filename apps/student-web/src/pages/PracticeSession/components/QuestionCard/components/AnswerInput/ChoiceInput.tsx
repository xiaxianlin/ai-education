/**
 * 选择题输入组件
 * 支持 single_choice / multi_choice / image_choice
 */
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import type { AnswerInputProps } from "../../types";

export function ChoiceInput({ question, value, disabled, onChange }: AnswerInputProps) {
  // question.options 是 QuestionOption[]，需要转换为 { label, text } 格式
  const options: Array<{ label: string; text: string }> = (question?.options || []).map((opt) => ({
    label: opt.id,
    text: opt.text || opt.id,
  }));

  return (
    <div className="grid gap-2 grid-cols-2">
      {options.map(({ label, text }) => {
        const isSelected = value?.text_answer === label;

        return (
          <button
            key={label}
            onClick={() => !disabled && onChange({ ...value, text_answer: label } as PracticeAnswer)}
            disabled={disabled}
            className={cn(
              "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 shadow-sm",
              isSelected
                ? "border-primary bg-primary/10 text-primary shadow-primary/20"
                : "border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5 hover:text-primary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="text-sm font-semibold text-center leading-snug flex-1">{text}</div>
            {isSelected && (
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
