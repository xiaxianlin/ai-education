import logo from '@/assets/logo.png';
import { isAdminManager, isTeacherManager, ManagerTypeText } from '@/constants/manager';
import { apiClient } from '@/lib/api';
import { useInitialStateModel } from '@/models/initialState';
import { Badge, Button, IconButton, Spinner, classNames } from '@/components/ui';
import {
  BookOpen,
  Brain,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleUserRound,
  ClipboardList,
  FileQuestion,
  Home,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UsersRound,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

type NavItem = {
  path: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: '总览',
    items: [{ path: '/home', label: '工作台', icon: <Home className="size-4" /> }],
  },
  {
    title: '教学资源',
    items: [
      { path: '/textbook', label: '教材管理', icon: <BookOpen className="size-4" /> },
      { path: '/ability', label: '能力管理', icon: <Brain className="size-4" /> },
    ],
  },
  {
    title: '题库与练习',
    items: [
      { path: '/question', label: '题目管理', icon: <FileQuestion className="size-4" /> },
      { path: '/question_type', label: '题型管理', icon: <Settings className="size-4" /> },
      { path: '/practice', label: '练习管理', icon: <ClipboardList className="size-4" /> },
    ],
  },
  {
    title: '用户',
    items: [
      { path: '/student', label: '学生管理', icon: <UsersRound className="size-4" /> },
      { path: '/manager', label: '老师管理', icon: <ShieldCheck className="size-4" />, adminOnly: true },
    ],
  },
];

function getVisibleNavGroups(showTeacherManagement: boolean) {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => showTeacherManagement || !item.adminOnly),
    }))
    .filter((group) => group.items.length > 0);
}

function isActivePath(currentPath: string, itemPath: string) {
  if (itemPath === '/home') {
    return currentPath === '/home' || currentPath === '/';
  }
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, manager, clearState } = useInitialStateModel();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('admin-theme') === 'dark');
  const showTeacherManagement = isAdminManager(manager?.type);
  const visibleNavGroups = useMemo(() => getVisibleNavGroups(showTeacherManagement), [showTeacherManagement]);
  const roleText = manager?.type !== undefined ? ManagerTypeText[manager.type] : '未识别角色';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('admin-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (!loading && isTeacherManager(manager?.type) && location.pathname.startsWith('/manager')) {
      navigate('/student', { replace: true });
    }
  }, [loading, location.pathname, manager?.type, navigate]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const keyword = String(formData.get('keyword') || '').trim();
    const match = visibleNavGroups.flatMap((group) => group.items).find((item) => item.label.includes(keyword));
    if (match) {
      navigate(match.path);
      setMobileOpen(false);
      event.currentTarget.reset();
    }
  };

  const handleLogout = () => {
    apiClient.removeToken();
    clearState();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sidebar text-foreground">
      {mobileOpen ? <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent">
            <img src={logo} alt="AI刷题平台" className="size-6 rounded" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">AI刷题平台</div>
              <div className="truncate text-xs text-muted-foreground">Admin Console</div>
            </div>
          ) : null}
          <IconButton
            className="ml-auto hidden lg:inline-flex"
            icon={collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            onClick={() => setCollapsed((value) => !value)}
          />
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {visibleNavGroups.map((group) => (
            <div key={group.title}>
              {!collapsed ? <div className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{group.title}</div> : null}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActivePath(location.pathname, item.path);
                  return (
                    <button
                      key={item.path}
                      type="button"
                      title={collapsed ? item.label : undefined}
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      className={classNames(
                        'flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors',
                        collapsed ? 'justify-center' : 'justify-start',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      )}
                    >
                      {item.icon}
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={() => setUserMenuOpen((value) => !value)}
            className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-sidebar-accent"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CircleUserRound className="size-5" />
            </div>
            {!collapsed ? (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{manager?.username || '管理员'}</div>
                  <div className="truncate text-xs text-muted-foreground">{roleText}</div>
                </div>
                <ChevronDown className="size-4 text-muted-foreground" />
              </>
            ) : null}
          </button>
          {userMenuOpen && !collapsed ? (
            <div className="mt-2 rounded-lg border border-sidebar-border bg-popover p-1 shadow-lg">
              <button type="button" onClick={() => navigate('/profile')} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                <CircleUserRound className="size-4" />
                个人中心
              </button>
              <button type="button" onClick={() => navigate('/password')} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                <Settings className="size-4" />
                修改密码
              </button>
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="size-4" />
                退出登录
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className={classNames('transition-all duration-200', collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]')}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <IconButton
            className="lg:hidden"
            icon={mobileOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            onClick={() => setMobileOpen((value) => !value)}
          />
          <form onSubmit={handleSearch} className="relative hidden w-full max-w-sm sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="keyword"
              placeholder="搜索导航..."
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline">{roleText}</Badge>
            <Button
              variant="ghost"
              size="icon"
              icon={dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              onClick={() => setDark((value) => !value)}
            />
          </div>
        </header>
        <div className="min-h-[calc(100vh-4rem)] rounded-tl-xl border-l border-t border-border bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
