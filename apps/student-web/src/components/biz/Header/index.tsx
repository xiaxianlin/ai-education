import { useAuthModel } from "@/common/models/AuthModel";
import { useProfileModel } from "@/common/models/ProfileModel";
import { PRACTICE_PATH_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GRADES } from "@ai-education/shared-web";
import { LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Header() {
  const { logout } = useAuthModel();
  const { profile, practices } = useProfileModel();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "首页", path: "/home", icon: <span className="text-xl">🏠</span> },
    ...practices.map((p) => ({
      name: p.name,
      path: PRACTICE_PATH_MAP[p.slug],
      icon: <span className="text-xl">{p.icon}</span>,
    })),
    { name: "练习记录", path: "/practice/record", icon: <span className="text-xl">📊</span> },
  ];

  return (
    <>
      {/* Mobile/iPad Portrait Toggle (Hidden for now as we focus on iPad landscape/split) */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white/80 backdrop-blur-xl border-r-2 border-primary/10 p-6 z-50 animate-springy">
        {/* Logo/Grade Area */}
        <Link to="/home" className="flex items-center gap-3 px-4 py-6 mb-8 rounded-3xl bg-secondary/50 bubbly-card">
          <span className="text-4xl animate-float">🎓</span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">我的年级</span>
            <span className="text-lg font-bold text-foreground truncate">
              {GRADES[profile?.grade || 0] || "未设置"}
            </span>
          </div>
        </Link>

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

        {/* Bottom Area: Profile & Logout */}
        <div className="mt-auto space-y-3">
          <button
            onClick={() => navigate("/profile")}
            className={cn(
              "w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all",
              location.pathname === "/profile"
                ? "bg-accent/10 text-accent-foreground border-2 border-accent/20"
                : "text-muted-foreground hover:bg-accent/5 hover:text-accent"
            )}
          >
            <span className="text-xl">👤</span>
            <span className="truncate">{profile?.name || "个人中心"}</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar (Simplified) */}
      <header className="md:hidden sticky top-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-primary/10 flex items-center justify-between px-6 z-50">
        <Link to="/home" className="text-2xl">
          🎓
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/profile")} className="text-xl">
            👤
          </button>
          <button onClick={() => navigate("/practice/record")} className="text-xl">
            📊
          </button>
        </div>
      </header>
    </>
  );
}
