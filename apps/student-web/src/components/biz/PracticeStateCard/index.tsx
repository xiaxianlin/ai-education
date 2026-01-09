/**
 * 练习状态卡片组件
 * 统一能力练习和单元练习的状态展示
 */
import { memo, useMemo } from "react";
import { BaseCard } from "./BaseCard";
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
  const { practice, creating, createPractice, state, stats } = usePractice({
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
        return <GeneratingAction sessionId={practice?.id} />;
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

  return <BaseCard title={title} description={description} extra={extra} stats={stats} actions={actions} />;
});

// 导出类型和 Hook
export * from "./types";
export { usePractice, type PracticeState } from "./usePractice";
