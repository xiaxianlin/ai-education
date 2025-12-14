/**
 * 选择题输入组件
 */
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePageModel } from "../../models/PageModel";

export function ChoiceInput({ value, disabled, onChange }: AnswerFormProps) {
  const { question } = usePageModel();

  let options: Array<{ label: string; text: string }> = [];
  try {
    options = JSON.parse(question?.options || "[]");
  } catch (error) {
    toast.error("选项解析失败，请刷新重试");
    console.error("Failed to parse question options:", error);
  }

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
