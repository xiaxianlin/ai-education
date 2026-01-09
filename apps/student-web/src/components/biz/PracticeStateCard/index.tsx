/**
 * 练习状态卡片组件
 * 统一能力练习和单元练习的状态展示
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import { PracticeGenerateStatus, PracticeStatus } from "@ai-education/shared-web";
import { useMemo } from "react";
import { CompleteCard } from "./CompleteCard";
import { GeneratingCard } from "./GeneratingCard";
import { PracticingCard } from "./PracticingCard";
import { PracticeStateCardProps } from "./types";
import { usePractice } from "./usePractice";
import { WaitCard } from "./WaitCard";

export function PracticeStateCard({
  type,
  abilityCode,
  atomic,
  unit,
  textbook: propTextbook,
  showKnowledgeButton,
  onKnowledgeClick,
}: PracticeStateCardProps) {
  const { activeTextbook, profile } = useProfileModel();
  const { grade, subject } = profile || {};

  // 使用通用 Hook
  const { practice, loading, creating, createPractice, canCreate, retryCount } = usePractice({
    type,
    abilityCode,
    unitId: unit?.id,
    subject,
    grade,
  });

  // 确定要使用的 textbook
  const textbook = useMemo(() => {
    if (propTextbook) return propTextbook;
    if (practice?.subject && practice?.grade && activeTextbook) {
      if (activeTextbook.subject === practice.subject && activeTextbook.grade === practice.grade) {
        return activeTextbook;
      }
    }
    if (activeTextbook) return activeTextbook;
    return undefined;
  }, [propTextbook, practice, activeTextbook]);

  // 加载中状态
  if (loading) {
    return null;
  }

  // 共享的 props
  const sharedProps = {
    type,
    atomic,
    unit,
    textbook,
    showKnowledgeButton,
    onKnowledgeClick,
  };

  // 无练习数据 - 显示等待卡片
  if (!practice) {
    return (
      <WaitCard
        {...sharedProps}
        createPractice={createPractice}
        creating={creating}
        canCreate={canCreate}
      />
    );
  }

  // 生成中状态
  if (practice.generate_status === PracticeGenerateStatus.GENERATING) {
    return <GeneratingCard {...sharedProps} sessionId={practice.id} retryCount={retryCount} />;
  }

  // 生成失败状态 - 显示等待卡片（允许重新创建）
  if (practice.generate_status === PracticeGenerateStatus.FAILED) {
    return (
      <WaitCard
        {...sharedProps}
        createPractice={createPractice}
        creating={creating}
        canCreate={canCreate}
      />
    );
  }

  // 根据练习状态显示对应卡片
  switch (practice.status) {
    case PracticeStatus.READY:
    case PracticeStatus.PRACTICING:
      return <PracticingCard {...sharedProps} practice={practice} />;
    case PracticeStatus.COMPLETED:
      return (
        <CompleteCard
          {...sharedProps}
          practice={practice}
          createPractice={createPractice}
          creating={creating}
        />
      );
    default:
      return null;
  }
}

// 导出所有组件和类型
export { CompleteCard } from "./CompleteCard";
export { GeneratingCard } from "./GeneratingCard";
export { PracticingCard } from "./PracticingCard";
export * from "./types";
export { usePractice } from "./usePractice";
export { WaitCard } from "./WaitCard";
