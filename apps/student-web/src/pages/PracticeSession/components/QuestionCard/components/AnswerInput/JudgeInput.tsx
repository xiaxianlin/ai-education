/**
 * 判断题输入组件
 * 支持 true_false / correct_wrong
 */
import { CheckCircle2 } from "lucide-react";
import type { AnswerInputProps } from "../../types";

/**
 * 根据状态映射获取按钮的 className
 */
function getButtonClassName(params: { isSelected: boolean; disabled: boolean; type: "correct" | "wrong" }): string {
  const base =
    "relative overflow-hidden group w-full p-4 rounded-xl border-2 shadow-sm flex flex-col items-center justify-center gap-2";
  const classes: string[] = [base];

  if (params.disabled) {
    classes.push("opacity-50 cursor-not-allowed");
  } else {
    classes.push("cursor-pointer");
  }

  if (params.isSelected) {
    if (params.type === "correct") {
      classes.push("border-green-500 bg-green-50 text-green-700");
    } else {
      classes.push("border-red-500 bg-red-50 text-red-700");
    }
  } else {
    classes.push("border-gray-100 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/20");
  }

  return classes.join(" ");
}

export function JudgeInput({ question, value, disabled, onChange }: AnswerInputProps) {
  // 从 answer.answer 读取答案
  const rawAnswer = value?.answer;
  const currentAnswer = typeof rawAnswer === "string" ? rawAnswer : "";

  const values = question.options
    ? question.options?.map((option) => ({ label: option.text, value: option.id }))
    : [
        { label: "正确", value: "true" },
        { label: "错误", value: "false" },
      ];

  const options = values.map((value) => {
    return {
      label: value.label,
      value: value.value,
      type: "correct" as const,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      hoverColor: "group-hover:text-green-600",
    };
  });

  return (
    <div className="grid grid-cols-2 gap-4 py-4">
      {options.map((option) => {
        const isSelected = currentAnswer === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            onClick={() => !disabled && onChange({ ...value, answer: option.value } as PracticeAnswer)}
            disabled={disabled}
            className={getButtonClassName({
              isSelected,
              disabled: !!disabled,
              type: option.type,
            })}
          >
            {/* 背景装饰 */}
            <div className={`absolute -right-2 -bottom-2 w-12 h-12 rounded-full ${option.bgColor} opacity-10`} />

            <div>
              <Icon
                className={`w-10 h-10 ${isSelected ? option.color : "text-gray-300 " + option.hoverColor}`}
                strokeWidth={2}
              />
            </div>

            <span className={`text-xl font-bold tracking-wider ${isSelected ? "" : "group-hover:text-gray-900"}`}>
              {option.label}
            </span>

            {/* 选中状态指示器 */}
            {isSelected && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current" />}
          </button>
        );
      })}
    </div>
  );
}
