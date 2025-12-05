/**
 * 答案状态图标组件
 */
import { FC, memo } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface AnswerStatusIconProps {
  isCorrect: boolean;
  size?: number;
}

export const AnswerStatusIcon: FC<AnswerStatusIconProps> = memo(
  ({ isCorrect, size = 7 }) => {
    if (isCorrect) {
      return <CheckCircle className={`h-${size} w-${size} text-green-500`} />;
    }
    return <XCircle className={`h-${size} w-${size} text-destructive`} />;
  }
);

AnswerStatusIcon.displayName = "AnswerStatusIcon";

