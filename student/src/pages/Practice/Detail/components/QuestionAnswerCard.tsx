/**
 * 题目答案展示卡片组件
 */
import { FC, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDuration } from "@/utils/time";

interface QuestionAnswerCardProps {
  question: Question;
  answer?: PracticeAnswer;
  index: number;
}

/**
 * 获取答题状态信息
 */
function getAnswerStatusInfo(status?: number) {
  if (status === undefined || status === 0) {
    return {
      text: "未答",
      icon: null,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      borderColor: "border-muted",
    };
  } else if (status === 1) {
    return {
      text: "正确",
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    };
  } else {
    return {
      text: "错误",
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
    };
  }
}

export const QuestionAnswerCard: FC<QuestionAnswerCardProps> = ({
  question,
  answer,
  index,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const status = answer?.status;
  const statusInfo = getAnswerStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  const hasAnswer = status !== undefined && status !== 0;
  const isCorrect = status === 1;
  const userAnswer = answer?.text_answer || "未作答";
  const correctAnswer = question.answer || "";
  const timeSpent = answer?.time_spent || 0;

  return (
    <Card
      className={`border-2 ${statusInfo.borderColor} transition-all h-full flex flex-col ${
        hasAnswer ? "shadow-sm" : ""
      }`}
    >
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {/* 题目头部 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <Badge
                    variant={
                      isCorrect
                        ? "default"
                        : status === 2
                        ? "destructive"
                        : "outline"
                    }
                    className="flex items-center gap-1 text-xs"
                  >
                    {StatusIcon && <StatusIcon className="h-2.5 w-2.5" />}
                    {statusInfo.text}
                  </Badge>
                  {question.type && (
                    <Badge variant="outline" className="text-xs">
                      {question.type}
                    </Badge>
                  )}
                </div>
                <div
                  className="text-sm text-foreground line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: question.content }}
                />
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* 展开的答案详情 */}
          {isExpanded && (
            <div className="pt-4 border-t space-y-4">
              {/* 答题信息 */}
              {hasAnswer && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>答题耗时: {formatDuration(timeSpent)}</span>
                  </div>

                  {/* 用户答案 */}
                  <div className={`rounded-lg p-4 ${statusInfo.bgColor}`}>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      你的答案:
                    </div>
                    <div className="text-base text-foreground">{userAnswer}</div>
                  </div>

                  {/* 正确答案 */}
                  {!isCorrect && (
                    <div className="rounded-lg p-4 bg-green-500/10 border border-green-500/20">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                        正确答案:
                      </div>
                      <div className="text-base text-green-700 dark:text-green-300">
                        {correctAnswer}
                      </div>
                    </div>
                  )}

                  {/* 错题分析 */}
                  {status === 2 && question.analysis && (
                    <div className="rounded-lg p-4 bg-destructive/10 border border-destructive/20">
                      <div className="text-sm font-medium text-destructive mb-2">
                        错题分析:
                      </div>
                      <div
                        className="text-sm text-foreground"
                        dangerouslySetInnerHTML={{ __html: question.analysis }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 未答题提示 */}
              {!hasAnswer && (
                <div className="text-center py-4 text-muted-foreground">
                  此题尚未作答
                </div>
              )}

              {/* 知识点 */}
              {question.knowledge && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">知识点: </span>
                  {question.knowledge}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

