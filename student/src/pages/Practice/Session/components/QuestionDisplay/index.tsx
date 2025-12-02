/**
 * 统一题目显示组件
 * 支持文本、图片、音频等各种题目类型
 */
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuestionDisplayProps } from "./types";

export const QuestionDisplay: FC<QuestionDisplayProps> = ({
  question,
  index,
  showAnswer = false,
  answerStatus,
}) => {
  const getStatusBadge = () => {
    if (answerStatus === undefined || answerStatus === 0) return null;

    return (
      <Badge
        variant={answerStatus === 1 ? "default" : "destructive"}
        className="text-sm"
      >
        {answerStatus === 1 ? "✓ 正确" : "✗ 错误"}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* 题目头部 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {index !== undefined && (
            <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {index + 1}
            </span>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {question.type}
              </Badge>
              {question.difficulty && (
                <Badge variant="secondary" className="text-xs">
                  {question.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* 题目内容 */}
      <div className="pl-11">
        <div
          className={cn(
            "text-lg leading-relaxed",
            answerStatus === 1 && "text-green-700 dark:text-green-400",
            answerStatus === 2 && "text-red-700 dark:text-red-400"
          )}
        >
          {question.content}
        </div>

        {/* 资源展示 */}
        {question.resource && (
          <div className="mt-4">
            {question.resource_type === "image" && (
              <img
                src={question.resource}
                alt="题目图片"
                className="max-w-full h-auto rounded-lg border border-border"
              />
            )}
            {question.resource_type === "audio" && (
              <audio
                src={question.resource}
                controls
                className="w-full max-w-md"
              />
            )}
          </div>
        )}

        {/* 选项 */}
        {question.options && (
          <div className="mt-4 space-y-2">
            {question.options.split("\n").map((option, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-border bg-muted/30 text-base"
              >
                {option}
              </div>
            ))}
          </div>
        )}

        {/* 答案展示（如果需要） */}
        {showAnswer && question.answer && (
          <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="font-semibold text-green-800 dark:text-green-400 mb-1">
              正确答案
            </div>
            <div className="text-green-700 dark:text-green-300">
              {question.answer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export type { QuestionDisplayProps } from "./types";
