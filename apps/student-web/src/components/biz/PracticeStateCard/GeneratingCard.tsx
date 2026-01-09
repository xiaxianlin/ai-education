/**
 * 生成中状态卡片
 * 显示生成进度
 */
import { Button } from "@/components/ui";
import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { Lightbulb, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { POLL_CONFIG, PracticeStateCardProps } from "./types";

interface GeneratingCardProps extends Pick<PracticeStateCardProps, "type" | "atomic" | "unit" | "textbook" | "showKnowledgeButton" | "onKnowledgeClick"> {
  /** 练习会话 ID */
  sessionId?: string;
  /** 轮询重试次数（用于估算进度，当 API 不可用时） */
  retryCount?: number;
}

// 步骤名称映射
const STEP_MESSAGES: Record<string, string> = {
  pending: "等待生成",
  load_session: "加载会话",
  validate_params: "验证参数",
  select_question_types: "选择题型",
  generate_questions: "生成题目",
  prepare_records: "准备答题记录",
  complete: "生成完成",
};

export function GeneratingCard({
  type,
  atomic,
  unit,
  textbook,
  sessionId,
  retryCount = 0,
  showKnowledgeButton,
  onKnowledgeClick,
}: GeneratingCardProps) {
  // 从 API 获取进度
  const { data: progressData } = useRequest(
    () => (sessionId ? studentApi.getPracticeProgress(sessionId) : Promise.resolve(null)),
    {
      ready: !!sessionId,
      pollingInterval: 2000, // 每 2 秒轮询一次
    }
  );

  // 计算显示的进度
  const displayProgress = useMemo(() => {
    if (progressData?.progress) {
      return progressData.progress;
    }
    // 没有 API 数据时，使用轮询次数估算
    return Math.min(Math.round((retryCount / POLL_CONFIG.maxRetries) * 90), 90);
  }, [progressData, retryCount]);

  // 显示的消息
  const displayMessage = useMemo(() => {
    if (progressData?.message) {
      return progressData.message;
    }
    if (progressData?.step) {
      return STEP_MESSAGES[progressData.step] || progressData.step;
    }
    return "正在生成练习";
  }, [progressData]);

  // 能力练习样式
  if (type === "ability") {
    return (
      <div className="bg-white rounded-2xl border shadow-sm transition-all">
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
          <p className="text-sm text-muted-foreground">AI 正在为你精心准备能力练习题目，请稍候片刻～</p>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-3 py-2 bg-secondary/50 rounded-xl">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <span className="text-xs font-bold text-primary">{displayMessage} ({displayProgress}%)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 单元练习样式
  return (
    <div className="bg-white rounded-2xl border shadow-sm transition-all">
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-3xl animate-bounce" style={{ animationDuration: "1.5s" }}>
              ⏳
            </div>
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
        <p className="text-sm text-muted-foreground">AI 正在为你精心准备练习题目，请稍候片刻～</p>

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-3 py-2 bg-secondary/50 rounded-xl">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
            <span className="text-xs font-bold text-primary">{displayMessage} ({displayProgress}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
