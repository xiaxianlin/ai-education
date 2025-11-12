/**
 * 单元卡片组件
 * 展示单个单元的信息
 */
import { memo } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
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
}

export const UnitCard = memo(function UnitCard({
  unit,
  theme,
  onStart,
  onShowKnowledge,
}: UnitCardProps) {
  const knowledges = unit.knowledges || [];
  const knowledgePreviewLimit = 4;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl cursor-pointer rounded-3xl',
        theme.border
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', theme.bg)} />
      <CardContent className="relative z-10 p-6 space-y-4">
        {/* 单元标题和开始按钮 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn('p-3 rounded-2xl bg-white/90 shadow-lg flex-shrink-0')}>
              <BookOpen className={cn('h-8 w-8', theme.icon)} />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 leading-tight">
              {unit.name}
            </CardTitle>
          </div>
          <Button
            onClick={() => onStart(unit)}
            className={cn(
              'rounded-2xl w-16 h-16 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center p-0 flex-shrink-0',
              theme.button
            )}
          >
            <Play className="h-7 w-7" fill="currentColor" />
          </Button>
        </div>

        {/* 知识点标签 */}
        {knowledges.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {knowledges.slice(0, knowledgePreviewLimit).map((knowledge) => (
              <span
                key={knowledge.id}
                className="px-3 py-1.5 rounded-xl bg-white/90 border-2 border-white text-sm font-medium text-gray-700 shadow-sm"
              >
                {knowledge.name}
              </span>
            ))}
            {knowledges.length > knowledgePreviewLimit && (
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1.5 h-auto rounded-xl text-sm font-medium text-gray-600 hover:bg-white/50"
                onClick={() => onShowKnowledge(unit)}
              >
                +{knowledges.length - knowledgePreviewLimit}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 pt-2">暂无知识点</p>
        )}
      </CardContent>
      {/* 装饰性元素 */}
      <div className={cn('absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-3xl', theme.bg)} />
      <div className={cn('absolute -bottom-6 -left-6 w-36 h-36 rounded-full opacity-15 blur-3xl', theme.bg)} />
    </Card>
  );
});

