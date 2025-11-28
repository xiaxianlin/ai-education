/**
 * 快速操作卡片组件
 * 简单、活泼、大气、可爱的设计
 */
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const BG_COLORS = ["border-green-500/20 bg-green-500/5", "border-destructive/20 bg-destructive/5", "border-primary/20 bg-primary/5"];
const BG_COLORS_1 = ['bg-green-500', 'bg-destructive', 'bg-primary'];
const actions = [
  {
    label: "练习记录",
    emoji: "📊",
    path: "/practice/history",
  },
  {
    label: "错题复习",
    emoji: "🔄",
    path: "/wrong-records",
  },
  {
    label: "敬请期待",
    emoji: "🤩",
  },

];

export function QuickActions() {


  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground px-2">🚀 功能入口</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, i) => (
          <div
            onClick={() => action.path && navigate(action.path)}
            className={cn(
              "relative h-32 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105 bg-card",
              BG_COLORS[i]
            )}
          >
            {/* 背景装饰 */}
            <div
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                BG_COLORS_1[i]
              )}
            />
            {/* 内容 */}
            <div className="relative h-full flex flex-col items-center justify-center gap-3 p-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                {action.emoji}
              </div>
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                {action.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
