/**
 * 生成中状态的练习卡片
 */
import { Loader2 } from "lucide-react";
import { PracticeCardProps } from "./types";

export function GeneratingCard({ textbook }: PracticeCardProps) {
  return (
    <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all min-h-[280px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="relative p-8 flex flex-col h-full">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="text-4xl animate-bounce" style={{ animationDuration: "1.5s" }}>
              ⚡
            </div>
            <h3 className="text-2xl font-bold text-foreground">{textbook.subject}</h3>
          </div>
          <p className="text-base text-muted-foreground text-center">AI 正在为你精心准备今日练习题目，请稍候片刻～</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
          <span className="text-sm font-medium text-primary">正在生成练习</span>
        </div>
      </div>
    </div>
  );
}
