import { Link, useLocation } from '@tanstack/react-router';
import { Home, BookOpen, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/home', label: '首页', icon: Home },
  { path: '/wrong', label: '错题集', icon: BookOpen },
  { path: '/history', label: '练习记录', icon: History },
  { path: '/profile', label: '我的', icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white z-50">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 space-y-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
