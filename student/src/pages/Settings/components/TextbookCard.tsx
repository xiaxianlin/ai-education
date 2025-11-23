/**
 * 教材卡片组件
 */
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Check, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Textbook } from '@/services/profile';

interface TextbookCardProps {
  textbook: Textbook;
  isCurrent: boolean;
  saving: boolean;
  getGradeLabel: (grade: number) => string;
  onSelect: (id: number) => void;
}

export const TextbookCard = memo(function TextbookCard({
  textbook,
  isCurrent,
  saving,
  getGradeLabel,
  onSelect,
}: TextbookCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col p-6 rounded-3xl border-2 transition-all duration-500 ease-out',
        'shadow-lg hover:shadow-2xl transform hover:-translate-y-1',
        isCurrent
          ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-400 shadow-blue-200/50 ring-2 ring-blue-200 ring-offset-2'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-transparent'
      )}
    >
      {/* 选中状态的装饰性背景 */}
      {isCurrent && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100/30 via-transparent to-purple-100/30 pointer-events-none" />
      )}

      {/* 顶部图标和标题区域 */}
      <div className="flex items-start gap-4 mb-5 relative z-10">
        <div
          className={cn(
            'relative h-20 w-20 rounded-2xl flex items-center justify-center flex-shrink-0',
            'transition-all duration-300 shadow-lg',
            isCurrent
              ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-300/50 scale-110'
              : 'bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200'
          )}
        >
          <BookOpen className={cn(
            'h-8 w-8 transition-colors duration-300',
            isCurrent ? 'text-white' : 'text-blue-600'
          )} />
          {isCurrent && (
            <div className="absolute -top-1 -right-1">
              <div className="relative">
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-50 animate-ping" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3
              className={cn(
                'font-bold text-xl leading-tight transition-colors duration-300',
                isCurrent ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-800'
              )}
            >
              {textbook.subject}
            </h3>
            {isCurrent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md animate-in fade-in slide-in-from-right-2 duration-300">
                <Check className="h-3.5 w-3.5" />
                当前使用
              </span>
            )}
          </div>
          <div
            className={cn(
              'flex flex-wrap items-center gap-2.5 text-sm font-medium',
              isCurrent ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-700'
            )}
          >
            <span className="px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-current/20">
              {textbook.version}
            </span>
            <span className={cn(
              'transition-colors',
              isCurrent ? 'text-blue-400' : 'text-gray-300 group-hover:text-gray-400'
            )}>•</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-current/20">
              {getGradeLabel(textbook.grade)}
            </span>
            <span className={cn(
              'transition-colors',
              isCurrent ? 'text-blue-400' : 'text-gray-300 group-hover:text-gray-400'
            )}>•</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-current/20">
              {textbook.semester}
            </span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <Button
        variant={isCurrent ? 'default' : 'outline'}
        size="lg"
        className={cn(
          'w-full h-14 text-base font-bold rounded-2xl relative z-10',
          'transition-all duration-300 transform',
          isCurrent
            ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/50 hover:scale-[1.02] cursor-default'
            : 'border-2 border-blue-300 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 hover:scale-[1.02] active:scale-[0.98]',
          saving && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => onSelect(textbook.id)}
        disabled={isCurrent || saving}
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            设置中...
          </span>
        ) : isCurrent ? (
          <span className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            当前教材
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>选择此教材</span>
            <span className="text-xs opacity-70">→</span>
          </span>
        )}
      </Button>
    </div>
  );
});

