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
    <textarea
      rows={3}
      disabled={disabled}
      value={answerText}
      onChange={(e) => !disabled && onChange({ ...value, answer: e.target.value } as PracticeAnswer)}
      placeholder="请输入你的答案..."
      className={cn(
        "w-full p-6 border border-gray-100 rounded-2xl resize-none focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-xl bg-white text-foreground placeholder:text-muted-foreground shadow-sm hover:border-gray-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    />
  );
}
