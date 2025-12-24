import { PRACTICE_PATH_MAP } from "@/common/constants";
import { cn } from "@/common/utils";
import { ModeToggle } from "@/components/biz";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui";
import { useAuthModel } from "@/models/AuthModel";
import { useProfileModel } from "@/models/ProfileModel";
import { GRADES } from "@ai-education/shared-web";
import { History, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Header() {
  const { logout } = useAuthModel();
  const { profile, practices } = useProfileModel();
  const location = useLocation();
  const navigate = useNavigate();
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
                  {GRADES[profile?.grade || 0] || "未设置年级"}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* 中间：模块快捷入口（非首页时显示） */}
        {!isHomePage && (
          <div className="hidden md:flex items-center gap-1 flex-1">
            {practices.map((practice) => {
              const path = PRACTICE_PATH_MAP[practice.slug];
              const isActive = location.pathname.startsWith(path);
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
                  title={practice.name}
                >
                  <span className="text-base">{practice.icon}</span>
                  <span className="hidden lg:inline">{practice.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* 右侧：个人信息和操作 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ModeToggle />
          <Dropdown
            trigger={
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">{profile?.name || "学生"}</span>
                </div>
              </div>
            }
            align="right"
          >
            <DropdownItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              个人中心
            </DropdownItem>
            <DropdownItem onClick={() => navigate("/practice/record")}>
              <History className="mr-2 h-4 w-4" />
              练习记录
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
