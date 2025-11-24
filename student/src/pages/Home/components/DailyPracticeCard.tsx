/**
 * 每日练习卡片组件
 * 显示每日练习的三种状态：未生成、生成中、生成完成
 */
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { PracticeSession } from "@/lib/types/schema";

export type DailyPracticeStatus = "not_generated" | "generating" | "ready";

interface DailyPracticeCardProps {
  status: DailyPracticeStatus;
  session: PracticeSession | null;
  onCreate: () => Promise<void>;
}

export const DailyPracticeCard = memo(function DailyPracticeCard({
  status,
  session,
  onCreate,
}: DailyPracticeCardProps) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    try {
      setCreating(true);
      await onCreate();
    } catch (error) {
      console.error("Failed to create daily practice:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleStart = () => {
    if (session) {
      const sessionId = session.session_id ?? session.id;
      if (sessionId) {
        navigate({ to: `/practice/${sessionId}` });
      }
    }
  };

  // 未生成状态
  if (status === "not_generated") {
    return (
      <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border-2 border-blue-100 hover:border-blue-200 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8 flex flex-col gap-6">
          {/* 内容区域 */}
          <div className="flex items-center gap-5">
            <div className="text-6xl">📚</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                每日练习
              </h3>
              <p className="text-base text-gray-600">
                今天还没有生成练习，快来开始吧！✨
              </p>
            </div>
          </div>
          {/* 操作按钮 */}
          <Button
            onClick={handleCreate}
            disabled={creating}
            size="lg"
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl font-semibold text-base transition-all"
          >
            {creating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                生成练习
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 生成中状态
  if (status === "generating") {
    return (
      <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border-2 border-yellow-200">
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="relative p-8">
          <div className="flex items-center gap-6">
            <div
              className="text-6xl animate-bounce"
              style={{ animationDuration: "1.5s" }}
            >
              ⚡
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                正在生成每日练习
              </h3>
              <p className="text-base text-gray-600 mb-4">
                AI 正在为你精心准备题目，请稍候...
              </p>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                <span className="text-sm font-medium text-yellow-600">
                  生成中
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 生成完成状态
  if (status === "ready" && session) {
    const questionCount =
      session.question_count ?? session.total_questions ?? 0;
    const answerCount =
      session.answer_count ?? session.completed_questions ?? 0;
    const correctCount = session.correct_count ?? session.right_questions ?? 0;
    const progress =
      questionCount > 0 ? Math.round((answerCount / questionCount) * 100) : 0;
    const isCompleted = session.status === 2;

    return (
      <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border-2 border-green-200 hover:border-green-300 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8 flex flex-col gap-6">
          {/* 内容区域 */}
          <div className="flex items-center gap-5">
            <div className="text-6xl">{isCompleted ? "🎉" : "📝"}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                每日练习
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
                        className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 transition-all duration-500 rounded-full shadow-sm"
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
              "w-full h-14 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base",
              isCompleted
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            )}
          >
            <Play className="h-5 w-5 mr-2" fill="currentColor" />
            {isCompleted ? "查看结果" : "开始练习"}
          </Button>
        </div>
      </div>
    );
  }

  return null;
});
