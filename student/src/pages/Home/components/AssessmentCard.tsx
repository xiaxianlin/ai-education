/**
 * 能力评测卡片组件
 * 显示能力评测的状态：未创建、已创建
 */
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2, Target } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { PracticeSession } from "@/lib/types/schema";

export type AssessmentStatus = "not_created" | "ready";

interface AssessmentCardProps {
  status: AssessmentStatus;
  session: PracticeSession | null;
  onCreate: () => Promise<PracticeSession>;
}

export const AssessmentCard = memo(function AssessmentCard({
  status,
  session,
  onCreate,
}: AssessmentCardProps) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    try {
      setCreating(true);
      const session = await onCreate();
      // 创建成功后导航到练习页面
      if (session) {
        const sessionId = session.session_id ?? session.id;
        if (sessionId) {
          navigate({ to: `/practice/${sessionId}` });
        }
      }
    } catch (error) {
      console.error("Failed to create assessment:", error);
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

  // 未创建状态
  if (status === "not_created") {
    return (
      <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border-2 border-purple-100 hover:border-purple-200 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8 flex flex-col gap-6">
          {/* 内容区域 */}
          <div className="flex items-center gap-5">
            <div className="text-6xl">🎯</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                能力评测
              </h3>
              <p className="text-base text-gray-600">
                让AI帮你找到学习的方向！✨
              </p>
            </div>
          </div>
          {/* 操作按钮 */}
          <Button
            onClick={handleCreate}
            disabled={creating}
            size="lg"
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl font-semibold text-base transition-all"
          >
            {creating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                创建中...
              </>
            ) : (
              <>
                <Target className="h-5 w-5 mr-2" />
                开始评测
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 已创建状态
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
      <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border-2 border-purple-200 hover:border-purple-300 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8 flex flex-col gap-6">
          {/* 内容区域 */}
          <div className="flex items-center gap-5">
            <div className="text-6xl">{isCompleted ? "🎉" : "🧠"}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                能力评测
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
          {/* 操作按钮 */}
          <Button
            onClick={handleStart}
            size="lg"
            className={cn(
              "w-full h-14 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base",
              isCompleted
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            )}
          >
            <Play className="h-5 w-5 mr-2" fill="currentColor" />
            {isCompleted ? "查看结果" : "继续评测"}
          </Button>
        </div>
      </div>
    );
  }

  return null;
});

