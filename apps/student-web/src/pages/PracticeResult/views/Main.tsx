/**
 * 练习结果主视图
 */
import { Badge, Button, Card, CardContent, Skeleton } from "@/components/ui";
import { getPracticeName } from "@/lib/practice";
import { formatDateTime } from "@ai-education/shared-web";
import { ArrowLeft, Play, Trophy } from "lucide-react";
import { QuestionAnswerCard } from "../components/QuestionAnswerCard";
import { ReportSummary } from "../components/ReportSummary";
import { usePracticeResultModel } from "../models/page";

/**
 * 加载状态视图
 */
function LoadingView() {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-border">
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-2 border-border">
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * 错误状态视图
 */
function ErrorView() {
  const { error, handleBack } = usePracticeResultModel();

  return (
    <Card className="border-2 border-destructive/20">
      <CardContent className="py-10 px-6 text-center space-y-3">
        <div className="text-5xl">❌</div>
        <p className="text-xl font-bold text-foreground">加载失败</p>
        <p className="text-sm text-muted-foreground">{error?.message || "无法加载练习详情"}</p>
        <Button onClick={handleBack} variant="outline">
          返回
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * 主视图组件
 */
export function MainView() {
  const { detail, loading, error, answerMap, statusInfo, isCompleted, isInProgress, handleBack, handleContinue } =
    usePracticeResultModel();

  // 加载状态
  if (loading) {
    return <LoadingView />;
  }

  // 错误状态
  if (error || !detail) {
    return <ErrorView />;
  }

  const { session, questions, report } = detail;

  return (
    <div className="min-h-screen bg-pattern -m-6 p-6 space-y-8 animate-springy">
      {/* 顶部英雄区 */}
      <div className="relative">
        <Button
          variant="ghost"
          onClick={handleBack}
          size="sm"
          className="absolute -top-2 left-0 hover:bg-primary/10 text-primary font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        <Card className="mt-8 border-none shadow-xl bg-gradient-to-br from-white/80 to-primary/5 backdrop-blur-sm overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Trophy className="h-32 w-32 text-primary" />
          </div>

          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    {getPracticeName(session.practice_type)}
                  </h1>
                  <Badge
                    className={`${statusInfo.variant === "default" ? "bg-primary" : ""} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm`}
                  >
                    {statusInfo.text}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-8">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">总题数</div>
                    <div className="text-2xl font-black text-foreground">{session.question_count}</div>
                  </div>
                  <div className="space-y-1 border-l pl-8">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">已答题</div>
                    <div className="text-2xl font-black text-primary">{session.answer_count}</div>
                  </div>
                  <div className="space-y-1 border-l pl-8">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">正确数</div>
                    <div className="text-2xl font-black text-green-500">{session.correct_count}</div>
                  </div>
                  <div className="space-y-1 border-l pl-8">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-nowrap">
                      {isCompleted ? "完成时间" : isInProgress ? "开始时间" : "创建时间"}
                    </div>
                    <div className="text-lg font-bold text-foreground leading-tight">
                      {formatDateTime(session.end_time || session.start_time || session.create_time)}
                    </div>
                  </div>
                </div>
              </div>

              {!isCompleted && (
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-primary/30 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="h-5 w-5 mr-3 fill-current" />
                  继续练习
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧报告摘要 */}
        {isCompleted && report && (
          <div className="lg:col-span-4 h-full">
            <ReportSummary report={report} slug={session.practice_type} />
          </div>
        )}

        {/* 右侧题目列表 */}
        <div className={isCompleted && report ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-foreground">题目详情</h2>
            <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-primary/20 to-transparent hidden md:block" />
          </div>

          {questions.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5">
              <CardContent className="py-20 px-6 text-center space-y-4">
                <div className="text-7xl animate-bounce">📝</div>
                <h3 className="text-2xl font-bold text-foreground">暂无题目</h3>
                <p className="max-w-xs mx-auto text-muted-foreground">看起来这个练习里还没有任何题目，请稍后再试。</p>
              </CardContent>
            </Card>
          ) : (
            <div
              className={`grid grid-cols-1 ${isCompleted && report ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"} gap-6`}
            >
              {questions.map((question, index) => {
                const answer = answerMap.get(question.id);
                return (
                  <div
                    key={question.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <QuestionAnswerCard question={question} answer={answer} index={index} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
