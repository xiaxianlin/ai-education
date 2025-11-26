import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronDown, User, Home } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/business/ModeToggle";

export function Header() {
  const location = useLocation();
  const { student, init, logout } = useAuthStore();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [currentTextbook, setCurrentTextbook] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const isHomePage = location.pathname === "/home";

  useEffect(() => {
    init();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [checkResponse, textbooksData] = await Promise.all([
        authApi.check(),
        profileApi.getTextbooks(),
      ]);

      // 从 check 接口获取学生信息和当前教材
      setStudent(checkResponse.student);
      setTextbooks(textbooksData || []);

      // 找到当前教材（优先级：check接口返回的textbook > active字段）
      const current =
        checkResponse.textbook || textbooksData?.find((t) => t.active === 1);
      setCurrentTextbook(current || null);
    } catch (error) {
      console.error("Failed to load header data:", error);
      // 不显示错误提示，避免干扰用户体验
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchTextbook = async (textbookId: number) => {
    try {
      setSwitching(true);
      // 使用新的激活教材接口
      await profileApi.activateTextbook(textbookId);

      // 更新本地状态
      const newCurrent = textbooks.find((t) => t.id === textbookId);
      setCurrentTextbook(newCurrent || null);

      // 更新教材列表中的 active 状态
      setTextbooks((prev) =>
        prev.map((t) => ({
          ...t,
          active: t.id === textbookId ? 1 : 0,
        }))
      );

      toast.success("教材切换成功");

      // 刷新页面以更新所有相关数据
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch textbook:", error);
      const errorMessage =
        error instanceof Error ? error.message : "切换教材失败";
      toast.error(errorMessage);
    } finally {
      setSwitching(false);
    }
  };

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

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
        <div className="h-16 flex items-center justify-between px-4">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="h-16 flex items-center justify-between px-4 gap-4">
        {/* 左侧：教材信息 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Dropdown
            trigger={
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer max-w-full">
                <span className="text-xl">📚</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">
                    当前教材
                  </span>
                  <span className="text-sm font-semibold text-foreground truncate">
                    {currentTextbook
                      ? getTextbookDisplayName(currentTextbook)
                      : "未设置教材"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            }
            align="left"
          >
            <div className="py-1 max-h-[300px] overflow-y-auto bg-popover text-popover-foreground">
              {textbooks.length > 0 ? (
                <>
                  {textbooks.map((textbook) => {
                    const isCurrent = currentTextbook?.id === textbook.id;
                    return (
                      <DropdownItem
                        key={textbook.id}
                        onClick={() =>
                          !isCurrent && handleSwitchTextbook(textbook.id)
                        }
                        disabled={isCurrent || switching}
                        className={cn(
                          "py-2 px-3",
                          isCurrent &&
                            "bg-primary/10 text-primary font-semibold"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-base">
                              {isCurrent ? "✨" : "📖"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {textbook.subject}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {textbook.version} ·{" "}
                                {getGradeLabel(textbook.grade)} ·{" "}
                                {textbook.semester}
                              </div>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">
                              当前
                            </span>
                          )}
                        </div>
                      </DropdownItem>
                    );
                  })}
                </>
              ) : (
                <DropdownItem
                  disabled
                  className="text-muted-foreground text-center py-3"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">📚</span>
                    <span className="text-xs">暂无教材</span>
                  </div>
                </DropdownItem>
              )}
            </div>
          </Dropdown>
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
