/**
 * 练习中状态卡片
 * 显示练习进度和继续/开始按钮
 */
import { Button } from "@/components/ui";
import { PracticeStatus } from "@ai-education/shared-web";
import { Lightbulb, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PracticeStateCardProps } from "./types";

interface PracticingCardProps extends Pick<PracticeStateCardProps, "type" | "atomic" | "unit" | "textbook" | "showKnowledgeButton" | "onKnowledgeClick"> {
  practice: Practice;
}

export function PracticingCard({
  type,
  atomic,
  practice,
  unit,
  textbook,
  showKnowledgeButton,
  onKnowledgeClick,
}: PracticingCardProps) {
  const navigate = useNavigate();
  const isInProgress = practice.status === PracticeStatus.PRACTICING;
  const { question_count = 0, answer_count = 0 } = practice;

  // 统一导航路径
  const handleNavigate = () => {
    navigate(`/practice/${practice.id}`);
  };

  // 能力练习样式
  if (type === "ability") {
    return (
      <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">{atomic?.name || "能力练习"}</h3>
                {atomic?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{atomic.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {atomic?.domain_code && (
                <div className="px-2 py-1 bg-primary/10 rounded-lg text-[10px] font-medium text-primary">
                  {atomic.domain_code}
                </div>
              )}
              <div className="px-3 py-1 bg-primary/10 rounded-lg text-[10px] font-black text-primary uppercase tracking-wider">
                {isInProgress ? "进行中" : "已就绪"}
              </div>
              {atomic?.difficulty && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">难度:</span>
                  <span className="text-sm">{"⭐".repeat(atomic.difficulty || 1)}</span>
                </div>
              )}
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
            onClick={handleNavigate}
            className="w-full h-12 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 transition-all"
          >
            <Play className="h-4 w-4 mr-2" fill="currentColor" />
            {isInProgress ? "继续练习" : "开始练习"}
          </Button>
        </div>
      </div>
    );
  }

  // 单元练习样式
  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground truncate">{unit?.name || "单元练习"}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showKnowledgeButton && unit && onKnowledgeClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onKnowledgeClick(unit)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Lightbulb className="h-5 w-5" />
              </Button>
            )}
            <div className="px-3 py-1 bg-primary/10 rounded-lg text-[10px] font-black text-primary uppercase tracking-wider">
              {isInProgress ? "进行中" : "已就绪"}
            </div>
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

        <div className="flex gap-3 mt-2">
          <Button
            size="sm"
            onClick={handleNavigate}
            className="flex-1 h-11 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all"
          >
            <Play className="h-4 w-4 mr-2" fill="currentColor" />
            {isInProgress ? "继续练习" : "开始练习"}
          </Button>
        </div>
      </div>
    </div>
  );
}
