/**
 * 已完成状态的评估卡片
 */
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompleteCardProps {
  session: PracticeSession;
  textbookTitle: string;
}

export const CompleteCard: FC<CompleteCardProps> = ({
  session,
  textbookTitle,
}) => {
  const navigate = useNavigate();
  const { question_count, answer_count, correct_count, status } = session || {};
  const isCompleted = status === 2;

  return (
    <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all min-h-[280px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative p-8 flex flex-col h-full">
        {/* 内容区域 */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="text-4xl">{isCompleted ? "🎉" : "✨"}</div>
            <h3 className="text-2xl font-bold text-foreground text-center">
              {textbookTitle}
            </h3>
          </div>

          <div className="text-center space-y-2">
            <p className="text-base text-muted-foreground">
              综合评估已为你准备完成，随时可以开始答题或继续完成剩余题目。
            </p>
            <p className="text-base text-muted-foreground font-medium">
              ✨ 已完成 {answer_count}/{question_count} 题 · 正确 {correct_count}{" "}
              题
            </p>
          </div>
        </div>
        {/* 操作按钮 */}
        <Button
          size="lg"
          onClick={() => navigate(`/practice/session/${session.id}`)}
          className="w-full h-14 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base text-primary-foreground bg-primary hover:bg-primary/90"
        >
          <Play className="h-5 w-5 mr-2" fill="currentColor" />
          {isCompleted ? "查看结果" : "继续评估"}
        </Button>
      </div>
    </div>
  );
};
