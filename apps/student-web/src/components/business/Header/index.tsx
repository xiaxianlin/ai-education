import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/button";
import { LogOut, User } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { useAuthModel } from "@/models/AuthModel";
import { useProfileModel } from "@/models/ProfileModel";
import { GRADES } from "@/constants/profile";
import { cn } from "@/lib/utils";

const MODULES = [
  { label: "每日练习", emoji: "📆", path: "/practice/daily" },
  { label: "单元练习", emoji: "📚", path: "/practice/unit" },
  { label: "综合评估", emoji: "🎯", path: "/practice/assessment" },
  { label: "练习记录", emoji: "📊", path: "/practice/history" },
  { label: "错题复习", emoji: "🔄", path: "/wrong-records" },
];

export function Header() {
  const { logout } = useAuthModel();
  const { student } = useProfileModel();
  const location = useLocation();
  const isHomePage = location.pathname === "/home";

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="h-16 flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3  min-w-0">
          <Link
            to="/home"
            title="返回首页"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer max-w-full">
              <span className="text-4xl">🎓</span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground">当前年级</span>
                <span className="text-sm font-semibold text-foreground truncate">
                  {GRADES[student?.grade || 0] || "未设置年级"}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* 中间：模块快捷入口（非首页时显示） */}
        {!isHomePage && (
          <div className="hidden md:flex items-center gap-1 flex-1">
            {MODULES.map((module) => {
              const isActive = location.pathname.startsWith(module.path);
              return (
                <Link
                  key={module.path}
                  to={module.path}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  title={module.label}
                >
                  <span className="text-base">{module.emoji}</span>
                  <span className="hidden lg:inline">{module.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* 右侧：个人信息和操作 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ModeToggle />
          <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">{student?.name || "学生"}</span>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-9 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
