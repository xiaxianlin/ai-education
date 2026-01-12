import { useAuthModel } from "@/common/models/AuthModel";
import { useProfileModel } from "@/common/models/ProfileModel";
import { getPracticeIcon, getPracticeName, getPracticePath } from "@/lib/practice";
import { cn } from "@/lib/utils";
import { GRADES } from "@ai-education/shared-web";
import { LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SettingsDialog } from "../SettingsDialog";

// 固定的练习类型列表（根据后端支持的练习类型）
const PRACTICE_TYPES = ["ability_practice", "unit_practice"] as const;

export function Header() {
  const { logout } = useAuthModel();
  const { profile } = useProfileModel();
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems = [
    { name: "首页", path: "/home", icon: <span className="text-xl">🏠</span> },
    ...PRACTICE_TYPES.map((practiceType) => ({
      name: getPracticeName(practiceType),
      path: getPracticePath(practiceType),
      icon: <span className="text-xl">{getPracticeIcon(practiceType)}</span>,
    })),
    { name: "练习记录", path: "/practice/record", icon: <span className="text-xl">📊</span> },
  ];

  return (
    <>
      {/* Mobile/iPad Portrait Toggle (Hidden for now as we focus on iPad landscape/split) */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white/80 backdrop-blur-xl border-r-2 border-primary/10 p-6 z-50 animate-springy">
        {/* Grade Area */}
        <div className="px-4 py-6 mb-8 rounded-3xl bg-secondary/50 bubbly-card">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-foreground">{profile.subject}</span>
            {profile?.semester && profile?.subject && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{GRADES[profile?.grade || 0]}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{profile.semester}</span>
              </>
            )}
            {(!profile?.semester || !profile?.subject) && (
              <span className="text-sm text-muted-foreground">未完成设置</span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path || (item.path !== "/home" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                {item.icon}
                <span className="text-base">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Area: Settings & Logout */}
        <div className="mt-auto space-y-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
          >
            <Settings className="w-5 h-5" />
            <span>学习设置</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </aside>

      {/* Mobile Top Bar (Simplified) */}
      <header className="md:hidden sticky top-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-primary/10 flex items-center justify-between px-6 z-50">
        <Link to="/home" className="text-2xl">
          🎓
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/practice/record")} className="text-xl">
            📊
          </button>
        </div>
      </header>
    </>
  );
}
