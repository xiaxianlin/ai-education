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
          ? 'bg-card border-primary shadow-primary/20 ring-2 ring-primary/20 ring-offset-2'
          : 'bg-card border-border hover:border-primary/50 hover:bg-accent/5'
      )}
    >
      {/* 选中状态的装饰性背景 */}
      {isCurrent && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      )}

      {/* 顶部图标和标题区域 */}
      <div className="flex items-start gap-4 mb-5 relative z-10">
        <div
          className={cn(
            'relative h-20 w-20 rounded-2xl flex items-center justify-center flex-shrink-0',
            'transition-all duration-300 shadow-lg',
            isCurrent
              ? 'bg-gradient-to-br from-primary to-primary/80 shadow-primary/30 scale-110'
              : 'bg-muted group-hover:bg-primary/10'
          )}
        >
          <BookOpen className={cn(
            'h-8 w-8 transition-colors duration-300',
            isCurrent ? 'text-primary-foreground' : 'text-primary'
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
                isCurrent ? 'text-primary' : 'text-foreground group-hover:text-primary'
              )}
            >
              {textbook.subject}
            </h3>
            {isCurrent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-md animate-in fade-in slide-in-from-right-2 duration-300">
                <Check className="h-3.5 w-3.5" />
                当前使用
              </span>
            )}
          </div>
          <div
            className={cn(
              'flex flex-wrap items-center gap-2.5 text-sm font-medium',
              isCurrent ? 'text-primary/80' : 'text-muted-foreground group-hover:text-foreground'
            )}
          >
            <span className="px-2.5 py-1 rounded-lg bg-background/60 backdrop-blur-sm border border-border">
              {textbook.version}
            </span>
            <span className={cn(
              'transition-colors',
              isCurrent ? 'text-primary/40' : 'text-muted-foreground/40'
            )}>•</span>
            <span className="px-2.5 py-1 rounded-lg bg-background/60 backdrop-blur-sm border border-border">
              {getGradeLabel(textbook.grade)}
            </span>
            <span className={cn(
              'transition-colors',
              isCurrent ? 'text-primary/40' : 'text-muted-foreground/40'
            )}>•</span>
            <span className="px-2.5 py-1 rounded-lg bg-background/60 backdrop-blur-sm border border-border">
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
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] cursor-default'
            : 'border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 hover:text-primary hover:scale-[1.02] active:scale-[0.98]',
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

