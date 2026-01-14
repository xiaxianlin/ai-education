/**
 * 题目答案展示卡片组件
 * 参考单元练习页面的卡片设计风格
 */
import { Badge, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { formatDuration } from "@ai-education/shared-web";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Lightbulb, XCircle } from "lucide-react";
import { FC, useState } from "react";

/**
 * 根据状态映射获取 Card 的 className
 */
function getCardClassName(params: { hasAnswer: boolean; isCorrect: boolean }): string {
  const base =
    "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg rounded-2xl bg-card h-full flex flex-col";
  const classes: string[] = [base];

  if (params.hasAnswer) {
    if (params.isCorrect) {
      classes.push("border-green-500/50 hover:border-green-500/70 bg-green-50/30");
    } else {
      classes.push("border-red-500/50 hover:border-red-500/70 bg-red-50/30");
    }
  } else {
    classes.push("border-border hover:border-primary/40 hover:bg-primary/5");
  }

  return classes.join(" ");
}

/**
 * 根据状态映射获取序号图标容器的 className
 */
function getIndexIconClassName(params: { hasAnswer: boolean; isCorrect: boolean }): string {
  const base = "p-2.5 rounded-xl shadow-sm flex-shrink-0";
  const classes: string[] = [base];

  if (params.hasAnswer) {
    if (params.isCorrect) {
      classes.push("bg-green-500");
    } else {
      classes.push("bg-red-500");
    }
  } else {
    classes.push("bg-primary");
  }

  return classes.join(" ");
}

/**
 * 根据状态映射获取状态标识的 className
 */
function getStatusBadgeClassName(params: { isCorrect: boolean }): string {
  const base = "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm";
  const classes: string[] = [base];

  if (params.isCorrect) {
    classes.push("bg-green-100 text-green-700");
  } else {
    classes.push("bg-red-100 text-red-700");
  }

  return classes.join(" ");
}

/**
 * 根据状态映射获取答案容器的 className
 */
function getAnswerContainerClassName(params: { isCorrect: boolean }): string {
  const base = "rounded-xl p-4 border-2 shadow-sm";
  const classes: string[] = [base];

  if (params.isCorrect) {
    classes.push("bg-green-50 border-green-300");
  } else {
    classes.push("bg-red-50 border-red-300");
  }

  return classes.join(" ");
}

/**
 * 从结构化正确答案中提取显示文本
 */
function formatCorrectAnswer(correctAnswer: unknown): string {
  if (!correctAnswer) return "";

  // 兼容旧数据：如果是字符串，直接返回
  if (typeof correctAnswer === "string") return correctAnswer;

  // 新数据格式：结构化对象
  if (typeof correctAnswer === "object") {
    const data = correctAnswer as Record<string, unknown>;

    // 复合题：展示子答案
    if (data.sub_answers && Array.isArray(data.sub_answers)) {
      return data.sub_answers.map((sub: Record<string, unknown>) => `${sub.sub_id}: ${sub.value}`).join(", ");
    }

    // 多值答案
    if (data.values && Array.isArray(data.values)) {
      return data.values.join(", ");
    }

    // 单值答案（优先使用选项文本）
    if (data.options && Array.isArray(data.options) && data.options.length > 0) {
      const opt = data.options[0] as Record<string, unknown>;
      return `${opt.id}: ${opt.text}`;
    }

    // 单值答案
    if (data.value !== undefined) {
      return String(data.value);
    }
  }

  return "";
}

/**
 * 从分析对象中提取显示内容
 */
function parseAnalysis(analysis: unknown): { explanation?: string; analysisText?: string } {
  if (!analysis) return {};

  // 兼容旧数据：如果是字符串，作为分析内容
  if (typeof analysis === "string") {
    return { analysisText: analysis };
  }

  // 新数据格式：结构化对象
  if (typeof analysis === "object") {
    const data = analysis as Record<string, unknown>;
    return {
      explanation: data.explanation as string | undefined,
      analysisText: data.analysis as string | undefined,
    };
  }

  return {};
}

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
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-500/50",
      iconBg: "bg-green-500",
      iconColor: "text-white",
    };
  } else {
    return {
      text: "错误",
      icon: XCircle,
      color: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-500/50",
      iconBg: "bg-red-500",
      iconColor: "text-white",
    };
  }
}

export const QuestionAnswerCard: FC<QuestionAnswerCardProps> = ({ question, answer, index }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const status = answer?.status;
  const statusInfo = getAnswerStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  const hasAnswer = status !== undefined && status !== 0;
  const isCorrect = status === 1;

  const userAnswer = answer?.answer || "未作答";

  // 正确答案：优先使用 answer.correct_answer（结构化），否则从 question.answer 提取
  const correctAnswer =
    formatCorrectAnswer(answer?.correct_answer) ||
    (Array.isArray(question.answer?.correct_answers)
      ? question.answer.correct_answers.join(", ")
      : question.answer?.correct_answers?.[0] || "");

  // 解析分析数据
  const { explanation, analysisText } = parseAnalysis(answer?.analysis);

  const timeSpent = answer?.time_spent || 0;

  return (
    <>
      <Card
        className={`${getCardClassName({
          hasAnswer,
          isCorrect,
        })} cursor-pointer bubbly-card group relative active:scale-95`}
        onClick={() => setIsDialogOpen(true)}
      >
        {/* 背景装饰 */}
        <div className={`absolute top-0 right-0 p-4 transition-transform duration-500 group-hover:scale-125 opacity-5`}>
          {StatusIcon && <StatusIcon className="h-20 w-20" />}
        </div>

        <CardContent className="relative z-10 p-6 flex flex-col h-full">
          <div className="space-y-4 flex-1">
            {/* 题目头部 */}
            <div className="flex items-start gap-4 flex-1">
              {/* 序号图标容器 */}
              <div
                className={`${getIndexIconClassName({
                  hasAnswer,
                  isCorrect,
                })} w-12 h-12 flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12`}
              >
                <span className="text-xl font-black text-white">{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                {/* 状态标识和题目类型 */}
                <div className="flex items-center gap-2 flex-wrap">
                  {hasAnswer && StatusIcon && (
                    <div
                      className={`${getStatusBadgeClassName({
                        isCorrect,
                      })} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      <span>{statusInfo.text}</span>
                    </div>
                  )}
                  {!hasAnswer && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-muted text-muted-foreground uppercase tracking-wider shadow-sm border border-muted-foreground/10">
                      <Clock className="h-3 w-3" />
                      <span>未答</span>
                    </div>
                  )}
                  {question.question_type_code && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border-primary/20 bg-primary/5 text-primary"
                    >
                      {question.question_type_code}
                    </Badge>
                  )}
                </div>

                {/* 题目内容 */}
                <div
                  className="text-base leading-snug text-foreground line-clamp-3 font-bold tracking-tight"
                  dangerouslySetInnerHTML={{ __html: question.stem.rich_text || question.stem.text }}
                />
              </div>
            </div>

            {/* 底部信息预览 */}
            {hasAnswer && (
              <div className="pt-4 mt-auto border-t border-black/5 flex items-center justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(answer?.time_spent || 0)}</span>
                </div>
                <div className="flex items-center gap-1 group-hover:text-primary transition-colors">
                  <span>查看详情</span>
                  <ArrowLeft className="h-3 w-3 rotate-180" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 题目详情弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className={getIndexIconClassName({
                  hasAnswer,
                  isCorrect,
                })}
              >
                <span className="text-xl font-bold text-white">{index + 1}</span>
              </div>
              <span>题目详情</span>
              {question.question_type_code && (
                <Badge variant="outline" className="text-xs">
                  {question.question_type_code}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4 overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            {/* 题目内容 */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-muted-foreground">题目</div>
              <div
                className="text-base leading-relaxed text-foreground"
                dangerouslySetInnerHTML={{ __html: question.stem.rich_text || question.stem.text }}
              />
            </div>

            {/* 答题信息 */}
            {hasAnswer && (
              <div className="space-y-4">
                {/* 答题耗时 */}
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>答题耗时: {formatDuration(timeSpent)}</span>
                </div>

                {/* 用户答案 */}
                <div
                  className={getAnswerContainerClassName({
                    isCorrect,
                  })}
                >
                  <div className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span>📝</span>
                    <span>你的答案</span>
                  </div>
                  <div className="text-base text-foreground leading-relaxed">{userAnswer}</div>
                </div>

                {/* 正确答案 */}
                {!isCorrect && (
                  <div className="rounded-xl p-4 bg-green-50 border-2 border-green-400 shadow-sm">
                    <div className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>正确答案</span>
                    </div>
                    <div className="text-base text-green-800 leading-relaxed">{correctAnswer}</div>
                  </div>
                )}

                {/* 题目解析 */}
                {status === 2 && explanation && (
                  <div className="rounded-xl p-4 bg-blue-50 border-2 border-blue-400 shadow-sm">
                    <div className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>题目解析</span>
                    </div>
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{explanation}</div>
                  </div>
                )}

                {/* 错题分析 */}
                {status === 2 && analysisText && (
                  <div className="rounded-xl p-4 bg-orange-50 border-2 border-orange-400 shadow-sm">
                    <div className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>错题分析</span>
                    </div>
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{analysisText}</div>
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
