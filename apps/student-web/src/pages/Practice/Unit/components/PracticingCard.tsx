import { Button } from "@/components/ui";
import { Lightbulb, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageModel } from "../models/page";
import { PracticeCardProps } from "../types";

export function PracticingCard({ practice, unit }: PracticeCardProps) {
  const navigate = useNavigate();
  const { setUnit } = usePageModel();
  const isInProgress = practice?.status === PracticeSessionStatus.PRACTICING;
  const { question_count, answer_count, correct_count } = practice || {};

  return (
    <div className="relative overflow-hidden bg-accent/10 rounded-3xl shadow-xl border-2 border-accent/40 hover:border-accent/60 transition-all min-h-[280px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative p-8 flex flex-col h-full">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="text-4xl">{isInProgress ? "📝" : "✨"}</div>
            <h3 className="text-2xl font-bold text-foreground">{unit.name}</h3>
          </div>
          <div className="text-center space-y-2">
            <p className="text-base text-muted-foreground">
              {isInProgress ? "正在练习中，随时可以继续完成剩余题目。" : "练习已准备完成，随时可以开始答题。"}
            </p>
            <p className="text-base text-muted-foreground font-medium">
              ✨ 已完成 {answer_count}/{question_count} 题 · 正确 {correct_count} 题
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setUnit(unit)}
            className="flex-1 h-14 rounded-2xl text-base font-semibold transition-all"
          >
            <Lightbulb className="h-5 w-5 mr-2" />
            查看知识点
          </Button>
          <Button
            onClick={() => navigate(`/practice/session/${practice?.id}`)}
            className="flex-1 h-14 rounded-2xl text-base font-semibold transition-all text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl"
          >
            <Play className="h-5 w-5 mr-2" fill="currentColor" />
            {isInProgress ? "继续练习" : "开始练习"}
          </Button>
        </div>
      </div>
    </div>
  );
}

