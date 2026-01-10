/**
 * 单个子题组件
 * 每个子题包含题干和答题区域（紧凑版）
 */
import type { SubQuestionInputProps } from "../types";
import { getInputComponent } from "./AnswerInput";

export function SubQuestionItem({ subQuestion, index, value, disabled, onChange }: SubQuestionInputProps) {
  const InputComponent = getInputComponent(subQuestion.interaction_type);

  // 获取题干文本
  const stemText = typeof subQuestion.stem === "string" ? subQuestion.stem : subQuestion.stem?.text || "";

  // 构造一个类 Question 对象给 InputComponent 使用
  // 子题的 options 需要传递给 ChoiceInput 等组件
  const subQuestionAsQuestion = {
    options: subQuestion.options?.map((opt: any) => ({
      id: opt.id || opt.label,
      text: opt.text || opt.label || opt.id,
      ...opt,
    })),
    question_type: {
      interaction_type: subQuestion.interaction_type,
    },
  } as Question;

  return (
    <div className="p-3 bg-secondary/20 rounded-xl border border-border/30">
      {/* 序号 + 题干 */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
          {index + 1}
        </div>
        <div className="text-sm font-medium leading-relaxed">{stemText}</div>
      </div>

      {/* 答题区域 */}
      <div className="pl-8">
        {InputComponent ? (
          <InputComponent
            question={subQuestionAsQuestion}
            value={{ text_answer: value } as PracticeAnswer}
            disabled={disabled}
            onChange={(newAnswer) => onChange(newAnswer.text_answer || "")}
          />
        ) : (
          <div className="text-xs text-muted-foreground italic">不支持的题型: {subQuestion.interaction_type}</div>
        )}
      </div>
    </div>
  );
}
