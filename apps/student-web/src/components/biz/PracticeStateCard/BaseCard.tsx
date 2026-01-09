/**
 * 练习卡片基础布局组件
 * 统一的卡片结构，确保列表中卡片高度一致
 */
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BaseCardProps {
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 右上角额外内容 */
  extra?: ReactNode;
  /** 统计信息 */
  stats?: {
    total: number;
    correct: number;
    wrong: number;
  };
  /** 按钮区域 */
  actions: ReactNode;
  /** 额外的 className */
  className?: string;
}

export function BaseCard({
  title,
  description,
  extra,
  stats,
  actions,
  className,
}: BaseCardProps) {
  return (
    <div className={cn("h-full flex flex-col bg-white rounded-2xl border shadow-sm", className)}>
      <div className="p-5 flex flex-col flex-1">
        {/* 头部：标题 + extra */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-foreground line-clamp-1">{title}</h3>
          {extra && <div className="shrink-0">{extra}</div>}
        </div>

        {/* 描述 */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>
        )}

        {/* 统计信息 */}
        {stats && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span>一共 <b className="text-foreground">{stats.total}</b> 题</span>
            <span>正确: <b className="text-green-600">{stats.correct}</b> 题</span>
            <span>错误: <b className="text-red-500">{stats.wrong}</b> 题</span>
          </div>
        )}

        {/* 占位区域，让按钮推到底部 */}
        <div className="flex-1" />

        {/* 按钮区域 */}
        <div className="mt-auto">{actions}</div>
      </div>
    </div>
  );
}
