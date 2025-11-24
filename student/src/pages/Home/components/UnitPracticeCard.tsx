/**
 * 单元练习卡片组件
 * 显示单元练习的状态：无进行中练习、有进行中练习
 */
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Play, BookOpen } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { PracticeSession } from "@/lib/types/schema";

export type UnitPracticeStatus = "no_session" | "in_progress";

interface UnitPracticeCardProps {
  status: UnitPracticeStatus;
  session: PracticeSession | null;
}

export const UnitPracticeCard = memo(function UnitPracticeCard({
  status,
  session,
}: UnitPracticeCardProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (session) {
      const sessionId = session.session_id ?? session.id;
      if (sessionId) {
        navigate({ to: `/practice/${sessionId}` });
      }
    }
  };

  const handleGoToUnitPractice = () => {
    navigate({ to: "/unit-practice" });
  };

  // 无进行中练习状态
  if (status === "no_session") {
    return (
      <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8 flex flex-col gap-6">
          {/* 内容区域 */}
          <div className="flex items-center gap-5">
            <div className="text-6xl">📚</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                单元练习
              </h3>
              <p className="text-base text-muted-foreground">
                选择单元开始练习，巩固知识点！✨
              </p>
            </div>
          </div>
          {/* 操作按钮 */}
          <Button
            onClick={handleGoToUnitPractice}
            size="lg"
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl font-semibold text-base transition-all text-primary-foreground"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            选择单元
          </Button>
        </div>
      </div>
    );
  }

  // 有进行中练习状态
  if (status === "in_progress" && session) {
    const questionCount =
      session.question_count ?? session.total_questions ?? 0;
    const answerCount =
      session.answer_count ?? session.completed_questions ?? 0;
    const correctCount = session.correct_count ?? session.right_questions ?? 0;
    const progress =
      questionCount > 0 ? Math.round((answerCount / questionCount) * 100) : 0;
    const isCompleted = session.status === 2;

    return (
      <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8 flex flex-col gap-6">
          {/* 内容区域 */}
          <div className="flex items-center gap-5">
            <div className="text-6xl">{isCompleted ? "🎉" : "📚"}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                单元练习
              </h3>
              {isCompleted ? (
                <p className="text-base text-muted-foreground mb-3">
                  已完成 {correctCount}/{questionCount} 题 ✨
                </p>
              ) : (
                <>
                  <p className="text-base text-muted-foreground mb-3">
                    已完成 {answerCount}/{questionCount} 题 · 正确{" "}
                    {correctCount} 题
                  </p>
                  {questionCount > 0 && (
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-primary transition-all duration-500 rounded-full shadow-sm"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          {/* 操作按钮 */}
          <Button
            onClick={handleStart}
            size="lg"
            className={cn(
              "w-full h-14 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base text-primary-foreground",
              isCompleted
                ? "bg-primary hover:bg-primary/90"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            <Play className="h-5 w-5 mr-2" fill="currentColor" />
            {isCompleted ? "查看结果" : "继续练习"}
          </Button>
        </div>
      </div>
    );
  }

  return null;
});

