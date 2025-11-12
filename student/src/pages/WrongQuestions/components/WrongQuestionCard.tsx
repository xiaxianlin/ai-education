/**
 * 错题卡片组件
 */
import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WrongQuestion } from '@/services/profile';

interface WrongQuestionCardProps {
  question: WrongQuestion;
  loading: boolean;
  onMarkAsMastered: (id: number) => void;
  onUnmarkAsMastered: (id: number) => void;
}

export const WrongQuestionCard = memo(function WrongQuestionCard({
  question,
  loading,
  onMarkAsMastered,
  onUnmarkAsMastered,
}: WrongQuestionCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className={cn(
      'border-2 transition-all duration-200 hover:shadow-lg',
      question.is_mastered === 1
        ? 'border-green-200 bg-green-50/50'
        : 'border-red-200 bg-red-50/50'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {question.question_content}
          </CardTitle>
          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
            {formatDate(question.last_wrong_time)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              question.is_mastered === 1
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            )}>
              {question.is_mastered === 1 ? '已掌握' : '待练习'}
            </span>
            {question.knowledge_point && (
              <span className="text-xs text-gray-500">
                {question.knowledge_point}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {question.is_mastered === 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnmarkAsMastered(question.id)}
                disabled={loading}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                未掌握
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkAsMastered(question.id)}
                disabled={loading}
                className="h-8"
              >
                <Check className="h-4 w-4 mr-1" />
                已掌握
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

