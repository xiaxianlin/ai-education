/**
 * 文本输入组件
 * 支持 text_input / fill_blank 以及其他未实现交互类型的 fallback
 */
import { cn } from "@/lib/utils";
import type { AnswerInputProps } from "../../types";

export function TextInput({ value, disabled, onChange }: AnswerInputProps) {
  // 从 answer.answer 读取答案
  const rawAnswer = value?.answer;
  const answerText = typeof rawAnswer === "string" ? rawAnswer : "";

  return (
    <div>
      <textarea
        rows={3}
        disabled={disabled}
        value={answerText}
        onChange={(e) => !disabled && onChange({ ...value, answer: e.target.value } as PracticeAnswer)}
        placeholder="请输入你的答案..."
        className={cn(
          "w-full p-6 border-2 rounded-2xl resize-none focus:outline-none focus:ring-4 transition-all text-lg bg-card text-foreground placeholder:text-muted-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
    </div>
  );
}
