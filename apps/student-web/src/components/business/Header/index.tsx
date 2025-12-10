import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { ModeToggle } from "@/components/business/ModeToggle";
import { useProfileStore } from "@/stores/profile-store";
import { GRADES } from "@/constants/profile";

export function Header() {
  const { logout } = useAuthStore();
  const { student } = useProfileStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="h-16 flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
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

        {/* 右侧：个人信息和操作 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ModeToggle />
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {student?.name || "学生"}
              </span>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
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
