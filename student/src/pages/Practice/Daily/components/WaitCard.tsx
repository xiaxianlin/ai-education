/**
 * 等待生成状态的练习卡片
 */
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface WaitCardProps {
  title: string;
  onCreate: () => void;
}

export const WaitCard = ({ title, onCreate }: WaitCardProps) => {
  return (
    <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative p-7 flex flex-col gap-5">
        {/* 内容区域 */}
        <div className="flex items-start gap-4">
          <div className="text-3xl">✨</div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-lg font-bold text-foreground line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              还没有为这本教材生成今日练习，点击下方按钮，一键生成专属题目。
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <Button
          onClick={onCreate}
          size="lg"
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl font-semibold text-base transition-all text-primary-foreground"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          生成今日练习
        </Button>
      </div>
    </div>
  );
};
