/**
 * 已完成状态的练习卡片
 */
import { Button } from "@/components/ui";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PracticeCardProps } from "../types";

export function CompleteCard({ practice, textbook }: PracticeCardProps) {
  const navigate = useNavigate();
  const { id, answer_count = 0, correct_count = 0 } = practice || {};

  if (!textbook) return null;

  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎉</div>
            <h3 className="text-xl font-bold text-foreground">{textbook.semester}</h3>
          </div>
          <div className="px-3 py-1 bg-green-100 rounded-lg text-[10px] font-black text-green-600 uppercase tracking-wider">
            已完成
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">能力练习已完成，快来看看你的学习记录吧！</p>
          <div className="p-3 bg-secondary/30 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">正确率</span>
            <span className="text-xs font-black text-foreground">
              {answer_count > 0 ? Math.round((correct_count / answer_count) * 100) : 0}% ({correct_count}/{answer_count}
              )
            </span>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => navigate(`/practice/result/${id}`)}
          className="w-full h-12 rounded-xl font-bold transition-all text-sm bg-primary hover:bg-primary/90"
        >
          <Play className="h-4 w-4 mr-2" fill="currentColor" />
          查看结果
        </Button>
      </div>
    </div>
  );
}
