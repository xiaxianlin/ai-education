/**
 * 教材卡片组件
 */
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
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
        'flex flex-col p-6 rounded-2xl border-3 transition-all duration-300 shadow-lg hover:shadow-2xl',
        isCurrent
          ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-400 scale-105'
          : 'bg-white border-gray-300 hover:border-blue-300 hover:scale-105'
      )}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            'h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md',
            isCurrent ? 'bg-blue-200' : 'bg-blue-100'
          )}
        >
          <div className="text-4xl">📖</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className={cn(
                'font-bold text-lg',
                isCurrent ? 'text-blue-800' : 'text-gray-900'
              )}
            >
              {textbook.subject}
            </h3>
            {isCurrent && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white shadow-md">
                <Check className="h-4 w-4" />
                当前
              </span>
            )}
          </div>
          <div
            className={cn(
              'flex flex-wrap items-center gap-2 text-sm font-medium',
              isCurrent ? 'text-blue-700' : 'text-gray-600'
            )}
          >
            <span>{textbook.version}</span>
            <span className={isCurrent ? 'text-blue-400' : 'text-gray-400'}>•</span>
            <span>{getGradeLabel(textbook.grade)}</span>
            <span className={isCurrent ? 'text-blue-400' : 'text-gray-400'}>•</span>
            <span>{textbook.semester}</span>
          </div>
        </div>
      </div>
      <Button
        variant={isCurrent ? 'default' : 'outline'}
        size="lg"
        className={cn(
          'w-full h-14 text-lg font-bold rounded-2xl',
          isCurrent
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg'
            : 'border-2 hover:bg-blue-50'
        )}
        onClick={() => onSelect(textbook.id)}
        disabled={isCurrent || saving}
      >
        {isCurrent ? '✓ 当前教材' : '选这个'}
      </Button>
    </div>
  );
});

