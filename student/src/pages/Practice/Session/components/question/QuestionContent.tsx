/**
 * 题目内容组件 - 显示题目文本
 */
import { FC, memo } from "react";
import { cn } from "@/lib/utils";

interface QuestionContentProps {
  content: string;
  answerStatus?: number; // 0-未答, 1-正确, 2-错误
}

export const QuestionContent: FC<QuestionContentProps> = memo(
  ({ content, answerStatus }) => {
    return (
      <div
        className={cn(
          "text-lg leading-relaxed whitespace-pre-wrap",
          answerStatus === 1 && "text-green-700 dark:text-green-400",
          answerStatus === 2 && "text-red-700 dark:text-red-400"
        )}
      >
        {content}
      </div>
    );
  }
);

QuestionContent.displayName = "QuestionContent";

