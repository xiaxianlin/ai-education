/**
 * 题目答案展示卡片组件
 * 参考单元练习页面的卡片设计风格
 */
import { FC, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDuration } from "@/utils/time";
import { cn } from "@/lib/utils";

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
      bgColor: "bg-muted/30",
      borderColor: "border-border",
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
    };
  } else if (status === 1) {
    return {
      text: "正确",
      icon: CheckCircle,
      color: "text-green-700 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-500/50 dark:border-green-400/50",
      iconBg: "bg-green-500",
      iconColor: "text-white",
    };
  } else {
    return {
      text: "错误",
      icon: XCircle,
      color: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-500/50 dark:border-red-400/50",
      iconBg: "bg-red-500",
      iconColor: "text-white",
    };
  }
}

export const QuestionAnswerCard: FC<QuestionAnswerCardProps> = ({ question, answer, index }) => {
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
      className={cn(
        "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg rounded-2xl bg-card h-full flex flex-col",
        hasAnswer
          ? isCorrect
            ? "border-green-500/50 dark:border-green-400/50 hover:border-green-500/70 dark:hover:border-green-400/70 bg-green-50/30 dark:bg-green-950/10"
            : "border-red-500/50 dark:border-red-400/50 hover:border-red-500/70 dark:hover:border-red-400/70 bg-red-50/30 dark:bg-red-950/10"
          : "border-border hover:border-primary/40 hover:bg-primary/5"
      )}
    >
      <CardContent className="relative z-10 p-5 flex flex-col h-full">
        <div className="space-y-4 flex-1">
          {/* 题目头部 */}
          <div className="flex items-start gap-3 flex-1">
            {/* 序号图标容器 - 参考单元练习卡片的设计 */}
            <div
              className={cn(
                "p-2.5 rounded-xl shadow-sm flex-shrink-0",
                hasAnswer ? (isCorrect ? "bg-green-500" : "bg-red-500") : "bg-primary"
              )}
            >
              <span className="text-xl font-bold text-white">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              {/* 状态标识和题目类型 */}
              <div className="flex items-center gap-2 flex-wrap">
                {hasAnswer && StatusIcon && (
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm",
                      isCorrect
                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                    )}
                  >
                    <StatusIcon className="h-4 w-4" />
                    <span>{statusInfo.text}</span>
                  </div>
                )}
                {!hasAnswer && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-muted text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>未答</span>
                  </div>
                )}
                {question.type && (
                  <Badge variant="outline" className="text-xs px-2.5 py-1 border">
                    {question.type}
                  </Badge>
                )}
              </div>

              {/* 题目内容 */}
              <div
                className="text-base leading-relaxed text-foreground line-clamp-3 font-medium"
                dangerouslySetInnerHTML={{ __html: question.content }}
              />
            </div>

            {/* 展开/收起按钮 */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 p-2 hover:bg-muted/70 rounded-lg transition-all"
              aria-label={isExpanded ? "收起详情" : "展开详情"}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* 展开的答案详情 */}
          {isExpanded && (
            <div className="pt-4 border-t border-border space-y-4">
              {/* 答题信息 */}
              {hasAnswer && (
                <div className="space-y-3">
                  {/* 答题耗时 */}
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>答题耗时: {formatDuration(timeSpent)}</span>
                  </div>

                  {/* 用户答案 */}
                  <div
                    className={cn(
                      "rounded-xl p-4 border-2 shadow-sm",
                      isCorrect
                        ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700"
                        : "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700"
                    )}
                  >
                    <div className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span>📝</span>
                      <span>你的答案</span>
                    </div>
                    <div className="text-base text-foreground leading-relaxed">{userAnswer}</div>
                  </div>

                  {/* 正确答案 */}
                  {!isCorrect && (
                    <div className="rounded-xl p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-400 dark:border-green-600 shadow-sm">
                      <div className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>正确答案</span>
                      </div>
                      <div className="text-base text-green-800 dark:text-green-200 leading-relaxed">
                        {correctAnswer}
                      </div>
                    </div>
                  )}

                  {/* 错题分析 */}
                  {status === 2 && answer?.analysis && (
                    <div className="rounded-xl p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-400 dark:border-orange-600 shadow-sm">
                      <div className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                        <span>💡</span>
                        <span>错题分析</span>
                      </div>
                      <div
                        className="text-sm text-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: answer.analysis }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 未答题提示 */}
              {!hasAnswer && (
                <div className="text-center py-6 text-sm text-muted-foreground bg-muted/30 rounded-xl">
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-medium">此题尚未作答</div>
                </div>
              )}

              {/* 知识点 */}
              {question.knowledge && (
                <div className="rounded-xl p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <span>📚</span>
                    <span>知识点</span>
                  </div>
                  <div className="text-sm text-foreground leading-relaxed">{question.knowledge}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
