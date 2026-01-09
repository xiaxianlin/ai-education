/**
 * 等待状态卡片
 * 显示创建练习按钮
 */
import { Button } from "@/components/ui";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { PracticeStateCardProps } from "./types";

interface WaitCardProps extends Pick<PracticeStateCardProps, "type" | "atomic" | "unit" | "textbook" | "showKnowledgeButton" | "onKnowledgeClick"> {
  createPractice: () => void;
  creating: boolean;
  canCreate: boolean;
}

export function WaitCard({
  type,
  atomic,
  unit,
  textbook,
  createPractice,
  creating,
  canCreate,
  showKnowledgeButton,
  onKnowledgeClick,
}: WaitCardProps) {
  // 能力练习样式
  if (type === "ability") {
    return (
      <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <div className="p-6 flex flex-col gap-5">
          {/* 能力信息头部 */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">{atomic?.name || "能力练习"}</h3>
              {atomic?.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{atomic.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {atomic?.domain_code && (
                <div className="px-2 py-1 bg-primary/10 rounded-lg text-[10px] font-medium text-primary">
                  {atomic.domain_code}
                </div>
              )}
              {atomic?.difficulty && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">难度:</span>
                  <span className="text-sm">{"⭐".repeat(atomic.difficulty || 1)}</span>
                </div>
              )}
            </div>
          </div>

          <Button
            disabled={creating || !canCreate || !createPractice}
            onClick={createPractice}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold text-sm transition-all"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                创建中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                创建练习
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 单元练习样式
  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground truncate">{unit?.name || "单元练习"}</h3>
          </div>
          {showKnowledgeButton && unit && onKnowledgeClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onKnowledgeClick(unit)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Lightbulb className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {unit?.content || "本单元包含多个重点知识点，快来挑战吧！"}
        </p>

        <div className="flex gap-3 mt-2">
          <Button
            size="sm"
            disabled={creating || !canCreate}
            onClick={createPractice}
            className="flex-1 h-11 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                创建中
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" fill="currentColor" />
                开始练习
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
