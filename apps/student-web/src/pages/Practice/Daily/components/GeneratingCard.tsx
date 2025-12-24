/**
 * 生成中状态的练习卡片
 */
import { Loader2 } from "lucide-react";
import { PracticeCardProps } from "../types";

export function GeneratingCard({ textbook }: PracticeCardProps) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm transition-all">
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="text-3xl animate-bounce" style={{ animationDuration: "1.5s" }}>
            ⚡
          </div>
          <h3 className="text-xl font-bold text-foreground">{textbook.semester}</h3>
        </div>
        <p className="text-sm text-muted-foreground">AI 正在为你精心准备今日练习题目，请稍候片刻～</p>
        <div className="flex items-center justify-center gap-3 py-2 bg-secondary/50 rounded-xl">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-xs font-bold text-primary">正在生成练习</span>
        </div>
      </div>
    </div>
  );
}
