/**
 * 快速操作卡片组件
 * 简单、活泼、大气、可爱的设计
 */
import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const QuickActions = memo(function QuickActions() {
  const actions = [
    {
      label: "单元练习",
      emoji: "📖",
      path: "/unit-practice",
    },
    {
      label: "错题复习",
      emoji: "🔄",
      path: "/wrong",
    },
    {
      label: "练习记录",
      emoji: "📊",
      path: "/history",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground px-2">快速开始 🚀</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Link key={action.path} to={action.path} className="group">
            <div
              className={cn(
                "relative h-32 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105 bg-card",
                action.path === "/unit-practice" &&
                  "border-green-500/20 bg-green-500/5",
                action.path === "/wrong" &&
                  "border-destructive/20 bg-destructive/5",
                action.path === "/history" && "border-primary/20 bg-primary/5"
              )}
            >
              {/* 背景装饰 */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                  action.path === "/unit-practice" && "bg-green-500",
                  action.path === "/wrong" && "bg-destructive",
                  action.path === "/history" && "bg-primary"
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
          </Link>
        ))}
      </div>
    </div>
  );
});
