/**
 * 单元卡片组件
 * 展示单个单元的信息
 */
import { memo } from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Unit } from '@/services/profile';

interface UnitCardProps {
  unit: Unit;
  theme: {
    bg: string;
    border: string;
    icon: string;
    button: string;
  };
  onStart: (unit: Unit) => void;
  onShowKnowledge: (unit: Unit) => void;
  hasIncompletePractice?: boolean;
}

export const UnitCard = memo(function UnitCard({
  unit,
  theme,
  onStart,
  onShowKnowledge,
  hasIncompletePractice = false,
}: UnitCardProps) {
  const knowledges = unit.knowledges || [];

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer rounded-2xl',
        theme.border
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', theme.bg)} />
      <CardContent className="relative z-10 p-5 space-y-4">
        {/* 未完成练习标识 */}
        {hasIncompletePractice && (
          <div className="absolute top-3 right-3 z-20">
            <div className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <span>⏸️</span>
              <span>未完成</span>
            </div>
          </div>
        )}

        {/* 单元标题和简介 */}
        <div className="flex items-start gap-3">
          <div className={cn('p-2.5 rounded-xl bg-white/90 shadow-md flex-shrink-0')}>
            <BookOpen className={cn('h-8 w-8', theme.icon)} />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <CardTitle className="text-xl font-bold text-gray-800 leading-tight">
              {unit.name}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-gray-600 line-clamp-2">
              {unit.content || '本单元包含多个重点知识点，快来挑战吧！'}
            </CardDescription>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="pt-1 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'flex-1 h-11 rounded-xl text-sm font-semibold transition-all',
              knowledges.length > 0
                ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm hover:bg-purple-200 hover:border-purple-300 hover:-translate-y-0.5 hover:shadow-md'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70 shadow-sm hover:translate-y-0 hover:shadow-sm'
            )}
            onClick={() => knowledges.length > 0 && onShowKnowledge(unit)}
            disabled={knowledges.length === 0}
          >
            查看知识点
          </Button>

          <Button
            onClick={() => onStart(unit)}
            className={cn(
              'flex-1 h-11 rounded-xl text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300',
              theme.button
            )}
          >
            <Play className="h-5 w-5 mr-2" fill="currentColor" />
            {hasIncompletePractice ? '继续练习' : '开始练习'}
          </Button>
        </div>

        {knowledges.length === 0 && (
          <p className="text-xs text-gray-500 text-center">暂无知识点</p>
        )}
      </CardContent>
      {/* 装饰性元素 */}
      <div className={cn('absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-3xl', theme.bg)} />
      <div className={cn('absolute -bottom-6 -left-6 w-36 h-36 rounded-full opacity-15 blur-3xl', theme.bg)} />
    </Card>
  );
});

