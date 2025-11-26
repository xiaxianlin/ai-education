/**
 * 练习卡片组件
 * 根据练习状态显示不同的卡片：未生成、生成中、已完成
 */
import { FC } from "react";
import { WaitCard } from "./WaitCard";
import { GeneratingCard } from "./GeneratingCard";
import { CompleteCard } from "./CompleteCard";
import type { PracticeCardProps } from "./types";

export const PracticeCard: FC<PracticeCardProps> = ({
  session,
  creating,
  ...props
}) => {
  // 生成中状态
  if (creating || session?.generate_status === 0) {
    return <GeneratingCard {...props} />;
  }

  // 未生成或生成失败状态
  if (!session || session.generate_status === -1) {
    return <WaitCard {...props} />;
  }

  // 已生成状态
  return <CompleteCard {...props} session={session} />;
};

export type { PracticeCardProps } from "./types";
