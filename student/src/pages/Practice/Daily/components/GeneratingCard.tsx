/**
 * 生成中状态的练习卡片
 */
import { Loader2 } from "lucide-react";

interface GeneratingCardProps {
  title: string;
}

export const GeneratingCard = ({ title }: GeneratingCardProps) => (
  <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
    <div className="relative p-7">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div
            className="text-3xl animate-bounce"
            style={{ animationDuration: "1.5s" }}
          >
            ⚡
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-lg font-bold text-foreground line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              AI 正在为你精心准备今日练习题目，请稍候片刻～
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-10">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
          <span className="text-sm font-medium text-primary">正在生成练习</span>
        </div>
      </div>
    </div>
  </div>
);
