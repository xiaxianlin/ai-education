/**
 * 已完成状态卡片
 * 显示完成结果和重新练习按钮
 */
import { Button } from "@/components/ui";
import { FileText, Lightbulb, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PracticeStateCardProps } from "./types";

interface CompleteCardProps extends Pick<PracticeStateCardProps, "type" | "atomic" | "unit" | "textbook" | "showKnowledgeButton" | "onKnowledgeClick"> {
  practice: Practice;
  createPractice?: () => void;
  creating?: boolean;
}

export function CompleteCard({
  type,
  atomic,
  practice,
  unit,
  textbook,
  createPractice,
  creating = false,
  showKnowledgeButton,
  onKnowledgeClick,
}: CompleteCardProps) {
  const navigate = useNavigate();
  const { id, answer_count = 0, correct_count = 0 } = practice;
  const accuracy = answer_count > 0 ? Math.round((correct_count / answer_count) * 100) : 0;

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
              <div className="px-3 py-1 bg-green-100 rounded-lg text-[10px] font-black text-green-600 uppercase tracking-wider">
                已完成
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
            <p className="text-sm text-muted-foreground">能力练习已完成，快来看看你的学习记录吧！</p>
            <div className="p-3 bg-secondary/30 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">正确率</span>
              <span className="text-xs font-black text-foreground">
                {accuracy}% ({correct_count}/{answer_count})
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
            <div className="px-3 py-1 bg-green-100 rounded-lg text-[10px] font-black text-green-600 uppercase tracking-wider">
              已完成
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">本单元练习已完成，快来看看你的学习成果吧！</p>
          <div className="p-3 bg-secondary/30 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">正确率</span>
            <span className="text-xs font-black text-foreground">
              {accuracy}% ({correct_count}/{answer_count})
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            size="sm"
            onClick={() => navigate(`/practice/result/${id}`)}
            className="w-full h-11 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all"
          >
            <FileText className="h-4 w-4 mr-2" />
            查看报告
          </Button>
          {createPractice && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={createPractice}
                disabled={creating}
                className="flex-1 h-11 rounded-xl text-xs font-bold border-2 border-primary/5 hover:bg-primary/5 transition-all text-muted-foreground"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                重新练习
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
