/**
 * 选择题输入组件
 */
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { usePracticeSessionModel } from "../../models/page";
import type { AnswerFormProps } from "../../types";

export function ChoiceInput({ value, disabled, onChange }: AnswerFormProps) {
  const { question } = usePracticeSessionModel();

  // question.options 是 QuestionOption[]，需要转换为 { label, text } 格式
  const options: Array<{ label: string; text: string }> = (question?.options || []).map((opt) => ({
    label: opt.id,
    text: opt.text || opt.id,
  }));

  console.log("answer", value);

  return (
    <div className="grid gap-4 grid-cols-2">
      {options.map(({ label, text }) => {
        const isSelected = value?.text_answer === label;

        return (
          <button
            key={label}
            onClick={() => !disabled && onChange({ ...value, text_answer: label } as PracticeAnswer)}
            disabled={disabled}
            className={cn(
              "flex items-center justify-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 shadow-sm",
              isSelected
                ? "border-primary bg-primary/10 text-primary shadow-primary/20"
                : "border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="text-xl font-bold text-center leading-relaxed flex-1">{text}</div>
            {isSelected && (
              <div className="flex-shrink-0">
                <CheckCircle className="h-7 w-7 text-primary" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
