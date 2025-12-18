import { Play } from "lucide-react";
import { Button } from "@/components/button";
import { PracticeCardProps } from "./types";
import { PracticeStatus } from "@/pages/Practice/constants";
import { useNavigate } from "react-router-dom";

export function PracticingCard({ practice, textbook, status }: PracticeCardProps) {
  const navigate = useNavigate();
  const isInProgress = status === PracticeStatus.PRACTICING;
  const { question_count, answer_count, correct_count } = practice || {};

  return (
    <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all min-h-[280px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative p-8 flex flex-col h-full">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="text-4xl">{isInProgress ? "📝" : "✨"}</div>
            <h3 className="text-2xl font-bold text-foreground">{textbook.semester}</h3>
          </div>
          <div className="text-center space-y-2">
            <p className="text-base text-muted-foreground">
              {isInProgress
                ? "正在练习中，随时可以继续完成剩余题目。"
                : "练习已准备完成，随时可以开始答题。"}
            </p>
            <p className="text-base text-muted-foreground font-medium">
              ✨ 已完成 {answer_count}/{question_count} 题 · 正确 {correct_count} 题
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/practice/session/${practice?.id}`)}
            className="flex-1 h-14 rounded-2xl font-semibold bg-primary hover:bg-primary/90"
          >
            <Play className="h-5 w-5 mr-2" fill="currentColor" />
            {isInProgress ? "继续练习" : "开始练习"}
          </Button>
        </div>
      </div>
    </div>
  );
};

