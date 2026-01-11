/**
 * 答题区域容器组件
 * 根据交互类型渲染对应的输入组件和提交按钮
 */
import { Button } from "@/components/ui";
import { Loader2 } from "lucide-react";
import { useRef } from "react";
import type { QuestionCardProps } from "../types";
import { getInputComponent } from "./AnswerInput";

type AnswerSectionProps = Pick<
  QuestionCardProps,
  "question" | "answer" | "disabled" | "submitting" | "onAnswerChange" | "onSubmit"
> & {
  /** 是否所有题目都已作答 */
  isAllAnswered?: boolean;
};

export function AnswerSection({
  question,
  answer,
  disabled,
  submitting,
  onAnswerChange,
  onSubmit,
  isAllAnswered = false,
}: AnswerSectionProps) {
  const startTime = useRef(Date.now());

  if (!question) {
    return <div className="text-muted-foreground">题目加载中...</div>;
  }

  const interactionType = question.question_type?.interaction_type;
  if (!interactionType) {
    return <div className="text-muted-foreground">题型信息不完整</div>;
  }
  const InputComponent = getInputComponent(interactionType);

  const handleSubmit = () => {
    if (onSubmit) {
      const timeSpent = Math.ceil((Date.now() - startTime.current) / 1000);
      onSubmit(timeSpent);
    }
  };

  return (
    <div className="space-y-5 mt-6">
      {/* 答题输入区域 */}
      <div className="min-h-[120px]">
        {InputComponent ? (
          <InputComponent
            question={question}
            value={answer}
            disabled={disabled}
            onChange={onAnswerChange || (() => {})}
          />
        ) : (
          <div className="text-muted-foreground p-6 rounded-2xl border border-gray-100 bg-white">
            暂不支持此题型: {interactionType}
          </div>
        )}
      </div>

      {/* 提交按钮 */}
      {!disabled && answer?.status === 0 && (
        <Button
          type="button"
          disabled={submitting || !isAllAnswered}
          className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              提交中...
            </>
          ) : (
            "提交答案"
          )}
        </Button>
      )}
    </div>
  );
}
