/**
 * 等待生成状态的练习卡片
 */
import { Button } from "@/components/ui";
import { Loader2, Sparkles } from "lucide-react";
import { usePageModel } from "../models/page";
import { PracticeCardProps } from "../types";

export function WaitCard({ textbook }: PracticeCardProps) {
  const { loading, createPractice } = usePageModel();
  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="text-3xl">✨</div>
          <h3 className="text-xl font-bold text-foreground">{textbook.semester}</h3>
        </div>
        <p className="text-sm text-muted-foreground">还没有为这本教材创建能力练习，点击下方按钮开始吧。</p>
        <Button
          disabled={loading}
          onClick={() => createPractice(textbook.id)}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold text-sm transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              创建中...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              创建练习
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
