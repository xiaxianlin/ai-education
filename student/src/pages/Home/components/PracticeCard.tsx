/**
 * 练习卡片组件
 * 显示每日练习的三种状态：未生成、生成中、生成完成
 */
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type PracticeStatus = "not_generated" | "generating" | "ready";

interface PracticeCardProps {
  title: string;
  description?: string;
  createButtonText?: string;
  icon?: React.ReactNode;
  session?: PracticeSession;
  creating?: boolean;
  onCreate?: () => void;
  onStart?: () => void;
}

const WaitCard: FC<PracticeCardProps> = ({
  icon,
  title,
  description,
  createButtonText,
  onCreate,
}) => (
  <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
    <div className="relative p-8 flex flex-col gap-6">
      {/* 内容区域 */}
      <div className="flex items-center gap-5">
        <div className="text-6xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-base text-muted-foreground">{description}</p>
        </div>
      </div>
      {/* 操作按钮 */}
      <Button
        onClick={onCreate}
        size="lg"
        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl font-semibold text-base transition-all text-primary-foreground"
      >
        <Sparkles className="h-5 w-5 mr-2" />
        {createButtonText || "生成练习"}
      </Button>
    </div>
  </div>
);

const GeneratingCard: FC<PracticeCardProps> = ({ title }) => (
  <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-accent/50">
    <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
    <div className="relative p-8">
      <div className="flex items-center gap-6">
        <div
          className="text-6xl animate-bounce"
          style={{ animationDuration: "1.5s" }}
        >
          ⚡
        </div>
        <div className="flex-1">
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
  </div>
);

const CompleteCard: FC<PracticeCardProps> = ({ title, session, onStart }) => {
  const { question_count, answer_count, correct_count, status } = session || {};
  const isCompleted = status === 2;

  return (
    <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative p-8 flex flex-col gap-6">
        {/* 内容区域 */}
        <div className="flex items-center gap-5">
          <div className="text-6xl">{isCompleted ? "🎉" : "📝"}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-base text-muted-foreground mb-3">
              ✨ 已完成 {answer_count}/{question_count} 题 · 正确{" "}
              {correct_count} 题
            </p>
          </div>
        </div>
        {/* 操作按钮 */}
        <Button
          onClick={onStart}
          size="lg"
          className={cn(
            "w-full h-14 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base text-primary-foreground",
            isCompleted
              ? "bg-primary hover:bg-primary/90"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          <Play className="h-5 w-5 mr-2" fill="currentColor" />
          {isCompleted ? "查看结果" : "继续练习"}
        </Button>
      </div>
    </div>
  );
};

export const PracticeCard: FC<PracticeCardProps> = ({
  session,
  creating,
  ...props
}) => {
  if (creating || session?.generate_status === 0) {
    return <GeneratingCard {...props} />;
  }

  if (!session || session.generate_status === -1) {
    return <WaitCard {...props} />;
  }

  return <CompleteCard {...props} session={session} />;
};
