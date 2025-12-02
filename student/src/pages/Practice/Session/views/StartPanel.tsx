/**
 * 开始练习面板
 * 直接从 store 读取数据并派发动作
 */
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSessionStore, useTotalQuestions } from "../stores/session-store";

const getPracticeTypeName = (sessionType?: PracticeSessionType): string => {
  if (!sessionType) return "练习";
  switch (sessionType) {
    case "daily_practice":
      return "每日练习";
    case "unit_practice":
      return "单元练习";
    case "assessment":
      return "能力评测";
    default:
      return "练习";
  }
};

export const StartPanel = memo(() => {
  const navigate = useNavigate();
  const session = useSessionStore((state) => state.session);
  const beginPractice = useSessionStore((state) => state.beginPractice);
  const totalQuestions = useTotalQuestions();

  const practiceType = getPracticeTypeName(session?.session_type);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBegin = async () => {
    try {
      await beginPractice();
      toast.success("练习已开始！");
    } catch (error) {
      console.error("Failed to begin practice:", error);
      const errorMessage =
        error instanceof Error ? error.message : "开始练习失败";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Button
        variant="outline"
        onClick={handleBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        ← 返回
      </Button>

      <div className="bg-card rounded-3xl p-12 shadow-xl border-2 border-primary/20 text-center">
        <div className="text-6xl mb-6">🎯</div>
        <h2 className="text-3xl font-bold text-foreground mb-4">
          {practiceType}
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          准备好开始挑战了吗？共有 {totalQuestions} 道题目等待你完成
        </p>
        <Button
          onClick={handleBegin}
          size="lg"
          className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-semibold text-lg"
        >
          开始练习 🚀
        </Button>
      </div>
    </div>
  );
});

StartPanel.displayName = "StartPanel";
