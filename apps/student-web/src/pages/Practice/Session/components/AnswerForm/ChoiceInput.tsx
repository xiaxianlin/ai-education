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
    console.log("[LOG_INFO]", question);
    options = JSON.parse(question?.options || "[]");
  } catch (error) {
    toast.error("选项解析失败，请刷新重试");
    console.error("Failed to parse question options:", error);
  }

  // 判断选项是否较长：如果任何选项文本长度超过 15 个字符，使用 2 列布局
  const hasLongOptions = options.some((option) => option.text.length > 15);
  const gridCols = hasLongOptions ? "grid-cols-2" : "grid-cols-4";

  return (
    <div className={cn("grid gap-4", gridCols)}>
      {options.map(({ label, text }) => {
        const isSelected = value?.text === label;

        return (
          <button
            key={label}
            onClick={() => !disabled && onChange({ text: label, match: false, analysis: "" })}
            disabled={disabled}
            className={cn(
              "flex items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md",
              isSelected
                ? "border-primary bg-primary/10 text-primary shadow-primary/20"
                : "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground",
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
