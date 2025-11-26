/**
 * 文本题输入组件
 */
import { FC } from "react";
import { Input } from "@/components/ui/input";
import type { AnswerInputProps } from "./types";

export const TextInput: FC<AnswerInputProps> = ({
  value,
  disabled,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <Input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="请输入答案"
        className="h-12 text-base"
      />
    </div>
  );
};
