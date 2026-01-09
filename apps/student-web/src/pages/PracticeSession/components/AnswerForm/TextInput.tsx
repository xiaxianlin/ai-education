/**
 * 文本输入组件 - 用于主观题、拼写题等
 */
import { cn } from "@/lib/utils";
import type { AnswerFormProps } from "../../types";

export function TextInput({ value, disabled, onChange }: AnswerFormProps) {
  return (
    <div>
      <textarea
        rows={3}
        disabled={disabled}
        value={value?.text_answer || ""}
        onChange={(e) => !disabled && onChange({ ...value, text_answer: e.target.value } as PracticeAnswer)}
        placeholder="请输入你的答案..."
        className={cn(
          "w-full p-6 border-2 rounded-2xl resize-none focus:outline-none focus:ring-4 transition-all text-lg bg-card text-foreground placeholder:text-muted-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
    </div>
  );
}
