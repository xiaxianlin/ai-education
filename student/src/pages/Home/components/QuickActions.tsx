/**
 * 快速操作卡片组件
 * 简单、活泼、大气、可爱的设计
 */
import { memo } from 'react';
import { Link } from '@tanstack/react-router';
import { BookOpen, Brain, RefreshCw, History } from 'lucide-react';

export const QuickActions = memo(function QuickActions() {
  const actions = [
    {
      icon: BookOpen,
      label: '单元练习',
      emoji: '📖',
      path: '/unit-practice',
      gradient: 'from-green-400 to-emerald-500',
      hoverGradient: 'hover:from-green-500 hover:to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      icon: Brain,
      label: '能力评测',
      emoji: '🧠',
      path: '/assessment',
      gradient: 'from-purple-400 to-pink-500',
      hoverGradient: 'hover:from-purple-500 hover:to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      icon: RefreshCw,
      label: '错题复习',
      emoji: '🔄',
      path: '/wrong',
      gradient: 'from-orange-400 to-red-500',
      hoverGradient: 'hover:from-orange-500 hover:to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      icon: History,
      label: '练习记录',
      emoji: '📊',
      path: '/history',
      gradient: 'from-indigo-400 to-blue-500',
      hoverGradient: 'hover:from-indigo-500 hover:to-blue-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 px-2">快速开始 🚀</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link key={action.path} to={action.path} className="group">
            <div className={`relative h-32 rounded-2xl ${action.bgColor} border-2 ${action.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105`}>
              {/* 背景装饰 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* 内容 */}
              <div className="relative h-full flex flex-col items-center justify-center gap-3 p-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {action.emoji}
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {action.label}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
});

