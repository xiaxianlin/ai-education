/**
 * 练习状态卡片组件
 * 统一能力练习和单元练习的状态展示
 */
import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { PracticeStateCardProps } from "./types";
import { usePractice } from "./usePractice";
import { CompletedAction, GeneratingAction, PracticingAction, WaitingAction } from "./actions";

export const PracticeStateCard = memo(function PracticeStateCard({
  type,
  atomic,
  unit,
  extra,
}: PracticeStateCardProps) {
  // 从 atomic 或 unit 中提取参数
  const abilityCode = atomic?.code;
  const unitId = unit?.id;

  // 使用通用 Hook（包含状态判断逻辑）
  const { practice, creating, state, stats, refresh, createPractice } = usePractice({
    type,
    abilityCode,
    unitId,
    atomic,
  });

  // 卡片基础信息
  const title = useMemo(
    () => (type === "ability_practice" ? atomic?.name || "能力练习" : unit?.name || "单元练习"),
    [type, atomic?.name, unit?.name]
  );

  const description = useMemo(
    () => (type === "ability_practice" ? atomic?.description : unit?.content),
    [type, atomic?.description, unit?.content]
  );

  // 根据状态渲染对应的 actions
  const actions = useMemo(() => {
    switch (state) {
      case "generating":
        return <GeneratingAction sessionId={practice?.id} onComplete={() => refresh()} />;
      case "completed":
        if (!practice) return null;
        return <CompletedAction practiceId={practice.id} creating={creating} onCreatePractice={createPractice} />;
      case "practicing":
        if (!practice) return null;
        return <PracticingAction practiceId={practice.id} />;
      case "waiting":
        return <WaitingAction creating={creating} onCreatePractice={createPractice} />;
      default:
        return null;
    }
  }, [state, practice, creating, createPractice]);

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border shadow-sm">
      <div className="p-5 flex flex-col flex-1">
        {/* 头部：标题 + extra */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-foreground line-clamp-1">{title}</h3>
          {extra && <div className="shrink-0">{extra}</div>}
        </div>

        {/* 描述 */}
        {description && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>}

        {/* 统计信息 */}
        {stats && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">共 {stats.total} 题</Badge>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">正确 {stats.correct}</Badge>
            <Badge className="bg-red-100 text-red-600 hover:bg-red-100">错误 {stats.wrong}</Badge>
          </div>
        )}

        {/* 占位区域，让按钮推到底部 */}
        <div className="flex-1" />

        {/* 按钮区域 */}
        <div className="mt-auto">{actions}</div>
      </div>
    </div>
  );
});

// 导出类型和 Hook
export * from "./types";
export { usePractice, type PracticeState } from "./usePractice";
