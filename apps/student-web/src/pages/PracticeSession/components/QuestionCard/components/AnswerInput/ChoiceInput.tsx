/**
 * 选择题输入组件
 * 支持 single_choice / multi_choice / image_choice
 */
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import type { AnswerInputProps } from "../../types";

export function ChoiceInput({ question, value, disabled, onChange }: AnswerInputProps) {
  // question.options 是 QuestionOption[]，需要转换为 { label, text } 格式
  const options: Array<{ label: string; text: string }> = (question?.options || []).map((opt) => ({
    label: opt.id,
    text: opt.text || opt.id,
  }));

  const interactionType = question?.question_type?.interaction_type;
  const isMultiChoice = interactionType === "multi_choice";

  // 从 answer.answer 读取答案
  const rawAnswer = value?.answer;
  let currentAnswer: string | string[] = "";
  
  if (rawAnswer) {
    try {
      const parsed = typeof rawAnswer === "string" ? JSON.parse(rawAnswer) : rawAnswer;
      if (isMultiChoice) {
        currentAnswer = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        currentAnswer = Array.isArray(parsed) ? parsed[0] : String(parsed);
      }
    } catch {
      currentAnswer = isMultiChoice ? (Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer]) : String(rawAnswer);
    }
  } else {
    currentAnswer = isMultiChoice ? [] : "";
  }

  const isSelected = (label: string) => {
    if (isMultiChoice) {
      return Array.isArray(currentAnswer) && currentAnswer.includes(label);
    } else {
      return currentAnswer === label;
    }
  };

  const handleClick = (label: string) => {
    if (disabled) return;

    let newAnswer: string | string[];
    if (isMultiChoice) {
      const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (currentArray.includes(label)) {
        // 取消选择
        newAnswer = currentArray.filter((item) => item !== label);
      } else {
        // 添加选择
        newAnswer = [...currentArray, label];
      }
    } else {
      // 单选题：直接替换
      newAnswer = label;
    }

    onChange({
      ...value,
      answer: newAnswer,
    } as PracticeAnswer);
  };

  return (
    <div className="grid gap-2 grid-cols-2">
      {options.map(({ label, text }) => {
        const selected = isSelected(label);

        return (
          <button
            key={label}
            onClick={() => handleClick(label)}
            disabled={disabled}
            className={cn(
              "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 shadow-sm",
              selected
                ? "border-primary bg-primary/10 text-primary shadow-primary/20"
                : "border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5 hover:text-primary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="text-sm font-semibold text-center leading-snug flex-1">{text}</div>
            {selected && (
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
