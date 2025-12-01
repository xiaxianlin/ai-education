/**
 * 已完成状态的练习卡片
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
    <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative p-8 flex flex-col gap-6">
        {/* 内容区域 */}
        <div className="flex items-center gap-5">
          <div className="text-2xl">{isCompleted ? "🎉" : "📝"}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground line-clamp-2">
              {textbookTitle}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              今日练习已为你准备完成，随时可以开始答题或继续完成剩余题目。
            </p>
          </div>
        </div>
        <p className="text-base text-muted-foreground mb-3">
          ✨ 已完成 {answer_count}/{question_count} 题 · 正确 {correct_count} 题
        </p>
        {/* 操作按钮 */}
        <Button
          size="lg"
          onClick={() => navigate(`/practice/session/${session.id}`)}
          className="w-full h-14 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base text-primary-foreground bg-primary hover:bg-primary/90"
        >
          <Play className="h-5 w-5 mr-2" fill="currentColor" />
          {isCompleted ? "查看结果" : "继续练习"}
        </Button>
      </div>
    </div>
  );
};
