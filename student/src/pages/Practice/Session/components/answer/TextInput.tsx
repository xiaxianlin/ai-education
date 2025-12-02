/**
 * 文本输入组件 - 用于主观题、拼写题等
 */
import { FC, memo } from "react";
import { cn } from "@/lib/utils";

interface TextInputProps {
  value?: string;
  disabled?: boolean;
  hasAnswered?: boolean;
  isCorrect?: boolean;
  isSpelling?: boolean; // 是否为拼写题（使用较小的 textarea）
  onChange: (answer: string) => void;
  placeholder?: string;
}

export const TextInput: FC<TextInputProps> = memo(
  ({
    value,
    disabled,
    hasAnswered,
    isCorrect,
    isSpelling = false,
    onChange,
    placeholder = "请输入你的答案...",
  }) => {
    return (
      <div>
        <textarea
          value={value || ""}
          onChange={(e) => !hasAnswered && !disabled && onChange(e.target.value)}
          disabled={hasAnswered || disabled}
          placeholder={placeholder}
          className={cn(
            "w-full p-6 border-2 rounded-2xl resize-none focus:outline-none focus:ring-4 transition-all text-lg bg-card text-foreground placeholder:text-muted-foreground",
            hasAnswered
              ? isCorrect
                ? "border-green-500 bg-green-500/10 text-green-500"
                : "border-destructive bg-destructive/10 text-destructive"
              : "border-input focus:border-primary focus:ring-primary/20",
            hasAnswered && "cursor-not-allowed opacity-80",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          rows={isSpelling ? 2 : 6}
        />
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

