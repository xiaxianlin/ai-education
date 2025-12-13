/**
 * 文本输入组件 - 用于主观题、拼写题等
 */
import { cn } from "@/lib/utils";

export function TextInput({ value, disabled, onChange }: AnswerFormProps) {
  return (
    <div>
      <textarea
        value={value?.text || ""}
        rows={3}
        onChange={(e) => !disabled && onChange({ text: e.target.value, match: false, analysis: "" })}
        disabled={disabled}
        placeholder="请输入你的答案..."
        className={cn(
          "w-full p-6 border-2 rounded-2xl resize-none focus:outline-none focus:ring-4 transition-all text-lg bg-card text-foreground placeholder:text-muted-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
    </div>
  );
}
