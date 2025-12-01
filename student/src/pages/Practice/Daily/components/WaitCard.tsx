/**
 * 等待生成状态的练习卡片
 */
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const WaitCard = ({ onCreate }: { onCreate: () => void }) => {
  return (
    <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative p-8 flex flex-col gap-6">
        {/* 内容区域 */}
        <div className="flex items-center gap-5"></div>
        {/* 操作按钮 */}
        <Button
          onClick={onCreate}
          size="lg"
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl font-semibold text-base transition-all text-primary-foreground"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          生成练习
        </Button>
      </div>
    </div>
  );
};
