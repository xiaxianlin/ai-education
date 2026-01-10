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
  // 格式: [{"sub_id": "1", "value": "答案"}]
  const compositeAnswers = useMemo(() => {
    const rawAnswer = answer?.answer;
    if (!rawAnswer) return {};
    
    try {
      const parsed = typeof rawAnswer === "string" ? JSON.parse(rawAnswer) : rawAnswer;
      
      if (Array.isArray(parsed)) {
        // 转换为字典便于查找
        const result: Record<string, string> = {};
        parsed.forEach((item: any) => {
          if (item.sub_id && item.value !== undefined) {
            result[item.sub_id] = String(item.value);
          }
        });
        return result;
      }
      return {};
    } catch {
      return {};
    }
  }, [answer?.answer]);

  // 更新子题答案
  const handleSubAnswerChange = (subQuestionId: string, value: string) => {
    // 构建新格式的答案数组
    const currentAnswers = Array.isArray(answer?.answer) 
      ? [...answer.answer] 
      : Object.entries(compositeAnswers).map(([subId, val]) => ({
          sub_id: subId,
          value: String(val),
        }));
    
    // 更新或添加子题答案
    const existingIndex = currentAnswers.findIndex(
      (item: any) => item.sub_id === subQuestionId
    );
    
    if (existingIndex >= 0) {
      currentAnswers[existingIndex] = { sub_id: subQuestionId, value };
    } else {
      currentAnswers.push({ sub_id: subQuestionId, value });
    }
    
    if (onAnswerChange) {
      onAnswerChange({
        ...answer,
        answer: currentAnswers,
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
