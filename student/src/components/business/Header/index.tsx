import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home } from "lucide-react";
import { ModeToggle } from "@/components/business/ModeToggle";

export function Header() {
  const location = useLocation();
  const { student, textbook, init, logout } = useAuthStore();
  const isHomePage = location.pathname === "/home";

  useEffect(() => {
    init();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const getGradeLabel = (grade: number) => {
    const gradeMap: Record<number, string> = {
      1: "一年级",
      2: "二年级",
      3: "三年级",
      4: "四年级",
      5: "五年级",
      6: "六年级",
    };
    return gradeMap[grade] || `年级${grade}`;
  };

  const getTextbookDisplayName = (textbook: Textbook) => {
    return `${textbook.subject} ${textbook.version} ${getGradeLabel(
      textbook.grade
    )} ${textbook.semester}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="h-16 flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer max-w-full">
            <span className="text-xl">📚</span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground">当前教材</span>
              <span className="text-sm font-semibold text-foreground truncate">
                {textbook ? getTextbookDisplayName(textbook) : "未设置教材"}
              </span>
            </div>
          </div>
        </div>

        {/* 右侧：个人信息和操作 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ModeToggle />
          {!isHomePage && (
            <Link
              to="/home"
              title="返回首页"
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">首页</span>
            </Link>
          )}

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
