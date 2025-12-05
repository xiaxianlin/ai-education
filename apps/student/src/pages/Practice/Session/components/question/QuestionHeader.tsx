/**
 * 题目头部组件 - 显示题号、类型、难度、状态
 */
import { FC, memo } from "react";
import { Badge } from "@/components/ui/badge";

interface QuestionHeaderProps {
  index: number;
  type: string;
  difficulty?: string;
  knowledge?: string;
  answerStatus?: number; // 0-未答, 1-正确, 2-错误
}

export const QuestionHeader: FC<QuestionHeaderProps> = memo(
  ({ index, type, difficulty, knowledge, answerStatus }) => {
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {index + 1}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {type}
              </Badge>
              {difficulty && (
                <Badge variant="secondary" className="text-xs">
                  {difficulty}
                </Badge>
              )}
              {knowledge && (
                <span className="text-sm text-muted-foreground">
                  {knowledge}
                </span>
              )}
            </div>
          </div>
        </div>
        {getStatusBadge()}
      </div>
    );
  }
);

QuestionHeader.displayName = "QuestionHeader";

