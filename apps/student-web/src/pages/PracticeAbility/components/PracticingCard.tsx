import { Button } from "@/components/ui";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PracticeCardProps } from "../types";
import { PracticeStatus } from "@ai-education/shared-web";

export function PracticingCard({ practice, textbook }: PracticeCardProps) {
  const navigate = useNavigate();
  const isInProgress = practice?.status === PracticeStatus.PRACTICING;
  const { question_count = 0, answer_count = 0 } = practice || {};

  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{isInProgress ? "📝" : "✨"}</div>
            <h3 className="text-xl font-bold text-foreground">{textbook.semester}</h3>
          </div>
          <div className="px-3 py-1 bg-primary/10 rounded-lg text-[10px] font-black text-primary uppercase tracking-wider">
            {isInProgress ? "进行中" : "已就绪"}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isInProgress ? "正在练习中，继续完成剩余题目吧。" : "练习已准备完成，随时可以开始。"}
          </p>
          <div className="p-3 bg-secondary/30 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">进度</span>
            <span className="text-xs font-black text-foreground">
              {answer_count}/{question_count} 题
            </span>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/practice/${practice?.id}`)}
          className="w-full h-12 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 transition-all"
        >
          <Play className="h-4 w-4 mr-2" fill="currentColor" />
          {isInProgress ? "继续练习" : "开始练习"}
        </Button>
      </div>
    </div>
  );
}
