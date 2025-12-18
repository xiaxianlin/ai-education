/**
 * 等待生成状态的练习卡片
 */
import { Button } from "@/components/ui";
import { Sparkles, Loader2 } from "lucide-react";
import { PracticeCardProps } from "./types";

export function WaitCard({ textbook, onCreate, loading }: PracticeCardProps) {
  return (
    <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all min-h-[280px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative p-8 flex flex-col h-full">
        {/* 内容区域 */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="text-4xl">✨</div>
            <h3 className="text-2xl font-bold text-foreground">{textbook.semester}</h3>
          </div>
          <p className="text-base text-muted-foreground text-center">
            还没有为这本教材创建今日练习，点击下方按钮，一键创建专属题目。
          </p>
        </div>

        {/* 操作按钮 */}
        <Button
          onClick={onCreate}
          disabled={loading}
          size="lg"
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl font-semibold text-base transition-all text-primary-foreground"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              创建中...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              创建练习
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
