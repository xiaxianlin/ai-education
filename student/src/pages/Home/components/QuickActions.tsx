/**
 * 快速操作卡片组件
 */
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { BookOpen, Target, Brain, RefreshCw, History } from 'lucide-react';

export const QuickActions = memo(function QuickActions() {
  const actions = [
    {
      icon: Target,
      label: '今日练习',
      path: '/daily-practice',
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'hover:from-blue-600 hover:to-cyan-600',
    },
    {
      icon: BookOpen,
      label: '单元练习',
      path: '/unit-practice',
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'hover:from-green-600 hover:to-emerald-600',
    },
    {
      icon: Brain,
      label: '能力评测',
      path: '/assessment',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600',
    },
    {
      icon: RefreshCw,
      label: '错题复习',
      path: '/wrong',
      color: 'from-orange-500 to-red-500',
      hoverColor: 'hover:from-orange-600 hover:to-red-600',
    },
    {
      icon: History,
      label: '练习记录',
      path: '/history',
      color: 'from-indigo-500 to-blue-500',
      hoverColor: 'hover:from-indigo-600 hover:to-blue-600',
    },
  ];

  return (
    <Card className="border-2 border-purple-200 shadow-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {actions.map((action) => (
            <Link key={action.path} to={action.path}>
              <Button
                className={`w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-r ${action.color} ${action.hoverColor} text-white shadow-lg hover:shadow-xl transition-all`}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

