/**
 * 结算视图 - 显示练习结算中状态
 * 自动轮询检查报告生成状态，生成完成后自动切换到结果视图
 */
import { memo } from "react";
import { Card, CardContent } from "@/components/ui";
import { Loader2, Sparkles } from "lucide-react";

export const SettlementView = memo(() => {
  return (
    <div className="from-sky-50 via-white to-amber-50 flex items-center justify-center p-4">
      <Card className="relative overflow-hidden border-2 border-primary/20 shadow-xl bg-card rounded-3xl max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          {/* 结算图标 */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 animate-pulse" />
            </div>
            <div className="relative z-10 p-6 rounded-full bg-primary/5">
              <Sparkles className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: "2s" }} />
            </div>
          </div>

          {/* 结算文案 */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">正在结算中...</h2>
            <p className="text-sm text-muted-foreground">正在为您生成练习报告，请稍候</p>
          </div>

          {/* 加载动画 */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">分析答题情况中</span>
          </div>

          {/* 提示信息 */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">报告生成完成后将自动跳转</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
