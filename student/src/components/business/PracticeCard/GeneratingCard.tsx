/**
 * 生成中状态的练习卡片
 */
import { FC } from "react";
import { Loader2 } from "lucide-react";
import type { PracticeCardProps } from "./types";

export const GeneratingCard: FC<PracticeCardProps> = ({ title }) => (
  <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-accent/50">
    <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
    <div className="relative p-8">
      <div className="flex flex-col items-center gap-4">
        <div
          className="text-4xl animate-bounce"
          style={{ animationDuration: "1.5s" }}
        >
          ⚡
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          正在生成{title}
        </h3>
        <p className="text-base text-muted-foreground mb-4">
          AI 正在为你精心准备题目，请稍候...
        </p>
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-accent animate-spin" />
          <span className="text-sm font-medium text-accent">生成中</span>
        </div>
      </div>
    </div>
  </div>
);
