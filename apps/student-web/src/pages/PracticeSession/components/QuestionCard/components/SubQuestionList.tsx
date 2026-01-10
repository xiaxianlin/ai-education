/**
 * 复合题子题列表组件
 */
import { Button } from "@/components/ui";
import { Loader2 } from "lucide-react";
import { useMemo, useRef } from "react";
import type { QuestionCardProps } from "../types";
import { SubQuestionItem } from "./SubQuestionItem";

type SubQuestionListProps = Pick<
  QuestionCardProps,
  "question" | "answer" | "disabled" | "submitting" | "onAnswerChange" | "onSubmit"
> & {
  /** 是否显示提交按钮（默认 true） */
  showSubmit?: boolean;
};

export function SubQuestionList({
  question,
  answer,
  disabled,
  submitting,
  onAnswerChange,
  onSubmit,
  showSubmit = true,
}: SubQuestionListProps) {
  const startTime = useRef(Date.now());

  // 获取子题列表（兼容不同字段名）
  const subQuestions = question?.stem?.sub_questions || (question?.stem as any)?.subQuestions || [];

  // 解析复合题答案
  const compositeAnswers = useMemo(() => {
    if (!answer?.text_answer) return {};
    try {
      return JSON.parse(answer.text_answer);
    } catch {
      return {};
    }
  }, [answer?.text_answer]);

  // 更新子题答案
  const handleSubAnswerChange = (subQuestionId: string, value: string) => {
    const newAnswers = { ...compositeAnswers, [subQuestionId]: value };
    if (onAnswerChange) {
      onAnswerChange({
        ...answer,
        text_answer: JSON.stringify(newAnswers),
      } as PracticeAnswer);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const timeSpent = Math.ceil((Date.now() - startTime.current) / 1000);
      onSubmit(timeSpent);
    }
  };

  if (subQuestions.length === 0) {
    return <div className="text-muted-foreground">暂无子题</div>;
  }

  return (
    <div className="space-y-3">
      {/* 子题列表 */}
      {subQuestions.map((subQ: SubQuestion, idx: number) => (
        <SubQuestionItem
          key={subQ.id}
          subQuestion={subQ}
          index={idx}
          value={compositeAnswers[subQ.id] || ""}
          disabled={disabled || false}
          onChange={(val) => handleSubAnswerChange(subQ.id, val)}
        />
      ))}

      {/* 提交按钮（可控制是否显示） */}
      {showSubmit && !disabled && answer?.status === 0 && (
        <Button
          type="button"
          disabled={submitting}
          className="w-full h-12 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
