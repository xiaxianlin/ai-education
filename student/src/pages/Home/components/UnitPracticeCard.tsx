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
      <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border-2 border-purple-100 hover:border-purple-200 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5 flex-1">
              <div className="text-6xl">📖</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  单元练习
                </h3>
                <p className="text-base text-gray-600">
                  选择单元开始练习，巩固知识点！✨
                </p>
              </div>
            </div>
            <Button
              onClick={handleGoToUnitPractice}
              size="lg"
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl font-semibold text-base transition-all"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              选择单元
            </Button>
          </div>
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
      <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border-2 border-purple-200 hover:border-purple-300 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5 flex-1">
              <div className="text-6xl">{isCompleted ? "🎉" : "📝"}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  单元练习
                </h3>
                {isCompleted ? (
                  <p className="text-base text-gray-600 mb-3">
                    已完成 {correctCount}/{questionCount} 题 ✨
                  </p>
                ) : (
                  <>
                    <p className="text-base text-gray-600 mb-3">
                      已完成 {answerCount}/{questionCount} 题 · 正确{" "}
                      {correctCount} 题
                    </p>
                    {questionCount > 0 && (
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 transition-all duration-500 rounded-full shadow-sm"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <Button
              onClick={handleStart}
              size="lg"
              className={cn(
                "h-14 px-8 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base",
                isCompleted
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              )}
            >
              <Play className="h-5 w-5 mr-2" fill="currentColor" />
              {isCompleted ? "查看结果" : "继续练习"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
});

