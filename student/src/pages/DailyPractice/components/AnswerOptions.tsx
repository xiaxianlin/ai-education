import { memo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question } from '@/services/practice';

interface AnswerOptionsProps {
  question: Question;
  answer: string | undefined;
  hasAnswered: boolean;
  isCorrect: boolean | undefined;
  onAnswerChange: (answer: string) => void;
}

export const AnswerOptions = memo(function AnswerOptions({
  question,
  answer,
  hasAnswered,
  isCorrect,
  onAnswerChange,
}: AnswerOptionsProps) {
  let options: Array<string | { label: string; text: string }> = [];
  try {
    options = question.options ? JSON.parse(question.options) : [];
  } catch {
    options = question.options ? question.options.split('\n') : [];
  }

  if (question.type === '选择题') {
    return (
      <div className="space-y-4">
        {options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);
          const isSelected = answer === optionLabel;
          const optionText =
            typeof option === 'object' && option !== null && 'text' in option
              ? option.text
              : String(option);

          return (
            <button
              key={index}
              onClick={() => !hasAnswered && onAnswerChange(optionLabel)}
              disabled={hasAnswered}
              className={cn(
                'w-full text-left p-6 rounded-2xl border-3 transition-all duration-300 shadow-md hover:shadow-lg',
                isSelected
                  ? hasAnswered
                    ? isCorrect
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 scale-105'
                      : 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 scale-105'
                    : 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 scale-105'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30',
                hasAnswered && 'cursor-not-allowed opacity-80'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-md',
                    isSelected
                      ? hasAnswered
                        ? isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {optionLabel}
                </div>
                <div className="flex-1 pt-2 text-lg text-gray-800 font-medium">{optionText}</div>
                {isSelected && hasAnswered && (
                  <div className="flex-shrink-0 mt-2">
                    {isCorrect ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === '判断题') {
    return (
      <div className="space-y-4">
        {[
          { value: '正确', emoji: '✅' },
          { value: '错误', emoji: '❌' },
        ].map(({ value: option, emoji }) => {
          const isSelected = answer === option;
          return (
            <button
              key={option}
              onClick={() => !hasAnswered && onAnswerChange(option)}
              disabled={hasAnswered}
              className={cn(
                'w-full p-6 rounded-2xl border-3 transition-all duration-300 shadow-md hover:shadow-lg',
                isSelected
                  ? hasAnswered
                    ? isCorrect
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 scale-105'
                      : 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 scale-105'
                    : 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 scale-105'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30',
                hasAnswered && 'cursor-not-allowed opacity-80'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <span className="text-4xl">{emoji}</span>
                  {option}
                </span>
                {isSelected && hasAnswered && (
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // 主观题
  return (
    <div>
      <textarea
        value={answer || ''}
        onChange={(e) => !hasAnswered && onAnswerChange(e.target.value)}
        disabled={hasAnswered}
        placeholder="请输入你的答案..."
        className={cn(
          'w-full p-6 border-3 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all text-lg',
          hasAnswered
            ? isCorrect
              ? 'border-green-500 bg-green-50'
              : 'border-red-500 bg-red-50'
            : 'border-gray-300 focus:border-blue-400',
          hasAnswered && 'cursor-not-allowed'
        )}
        rows={6}
      />
      {hasAnswered && (
        <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-gray-50">
          {isCorrect ? (
            <CheckCircle className="h-7 w-7 text-green-600" />
          ) : (
            <XCircle className="h-7 w-7 text-red-600" />
          )}
          <span
            className={cn(
              'text-lg font-bold',
              isCorrect ? 'text-green-700' : 'text-red-700'
            )}
          >
            {isCorrect ? '回答正确！✨' : '回答错误'}
          </span>
        </div>
      )}
    </div>
  );
});

